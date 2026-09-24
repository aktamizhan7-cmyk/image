import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import imageRoutes from './server/src/routes/imageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure temp directories exist
const tempDir = path.resolve(__dirname, 'temp');
const uploadsDir = path.resolve(tempDir, 'uploads');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Basic security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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
      'Content-Disposition',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI + Manual Image Enhancer Server',
    nodeVersion: process.version,
  });
});

// Image Processing API routes
app.use('/api/images', imageRoutes);

// Global API error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred during image processing.',
  });
});

// Setup Frontend Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
      root: path.resolve(__dirname, 'client'),
    });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.resolve(__dirname, 'client/dist');
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(clientDist, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ImageEnhancer] Application running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[FatalServerStartup]', err);
  process.exit(1);
});
