import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import crypto from 'crypto';
import imageRoutes from './server/src/routes/imageRoutes.js';
import contactRoutes from './server/src/routes/contactRoutes.js';
import { nanoBananaRouter } from './server/src/index.js';
import { ensureTempDirectories } from './server/src/utils/tempPaths.js';

// Load environment variables
dotenv.config();

// Ensure temporary processing and uploads directories exist in system tmpdir
ensureTempDirectories();

// Process-level error and signal handling to prevent unhandled rejections from terminating the process
process.on('uncaughtException', (err: Error) => {
  console.error('[ImageEnhancerServer] Uncaught Exception:', err.message || err);
  if (err.stack) console.error(err.stack);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('[ImageEnhancerServer] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const httpServer = http.createServer(app);

// CLI argument parsing (supports --port, -p, --host, -h passed by container runners)
function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return undefined;
}

const argPort = parseArg('--port') || parseArg('-p');
const argHost = parseArg('--host') || parseArg('-h');

const PORT = Number(argPort) || Number(process.env.DEFAULT_APP_PORT) || Number(process.env.PORT) || 3000;
const HOST = argHost || process.env.HOST || '0.0.0.0';
const appRoot = process.cwd();

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('[ImageEnhancerServer] Received SIGTERM signal, closing HTTP server...');
  httpServer.close(() => {
    console.log('[ImageEnhancerServer] Server closed successfully.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[ImageEnhancerServer] Received SIGINT signal, closing HTTP server...');
  httpServer.close(() => {
    console.log('[ImageEnhancerServer] Server closed successfully.');
    process.exit(0);
  });
});

// Basic security headers configured for iFrame and development compatibility
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [
      'x-processing-time-ms',
      'x-image-metadata',
      'x-provider-name',
      'x-super-resolved',
      'x-ai-description',
      'Content-Disposition',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint for pre-warming and container readiness probes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI + Manual Image Enhancer Server',
    nodeVersion: process.version,
    port: PORT,
  });
});

// Image Processing API routes
app.use('/api/images', imageRoutes);
app.use('/api/nano-banana', nanoBananaRouter);

// Support & Contact Inquiries API routes
app.use('/api/contact', contactRoutes);

// Global API error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred during image processing.',
  });
});

let isListening = false;

// Setup Frontend Serving & Vite Middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: {
          ignored: [
            '**/temp/**',
            '**/uploads/**',
            '**/dist/**',
            '**/.git/**',
            '**/test_tmp/**',
            '**/bin/**',
          ],
        },
      },
      appType: 'spa',
      root: path.resolve(appRoot, 'client'),
    });
    app.use(vite.middlewares);

    // Fallback for client SPA routing (also serves pre-warming GET requests)
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }

      // If an asset/file with extension was requested but not handled by Vite, return 404
      const urlPath = url.split('?')[0];
      const ext = path.extname(urlPath);
      if (ext && ext !== '.html') {
        return res.status(404).end('Not found');
      }

      try {
        const indexPath = path.resolve(appRoot, 'client/index.html');
        if (!fs.existsSync(indexPath)) {
          return res.status(200).send('<!doctype html><html><body><div id="root"></div></body></html>');
        }
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        console.warn('[ViteTransformIndexHtml] Warning transforming html:', e?.message || e);
        next(e);
      }
    });
  } else {
    const clientDist = path.resolve(appRoot, 'client/dist');
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(clientDist, 'index.html'));
      });
    }
  }

  // Handle WebSocket upgrade requests cleanly without rejecting or abruptly terminating connections
  httpServer.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key'];
    if (key && typeof key === 'string') {
      const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
      const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
      const responseHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`,
        'Sec-WebSocket-Protocol: vite-hmr',
        '\r\n',
      ];
      socket.write(responseHeaders.join('\r\n'));
      socket.on('error', () => {
        try {
          socket.destroy();
        } catch {}
      });
    } else {
      socket.destroy();
    }
  });

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[ImageEnhancer] Port ${PORT} is busy, retrying in 1.5s...`);
      setTimeout(() => {
        try {
          httpServer.close();
        } catch {}
        if (!isListening) {
          httpServer.listen(PORT, HOST);
        }
      }, 1500);
    } else {
      console.error('[ImageEnhancerServer] Server error:', err);
    }
  });

  if (!isListening) {
    httpServer.listen(PORT, HOST, () => {
      isListening = true;
      console.log(`[ImageEnhancer] Application running on http://${HOST}:${PORT}`);
    });
  }
}

// Start server without killing process on transient errors
startServer().catch((err: any) => {
  console.error('[ImageEnhancerServer] Initialization warning:', err?.message || err);
});
