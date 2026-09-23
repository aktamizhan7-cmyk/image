import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import imageRoutes from './routes/imageRoutes.js';

// Load environment variables from server and workspace root directories
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Ensure temp directory exists
const serverRoot = path.resolve(__dirname, '../');
const tempDir = path.resolve(serverRoot, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting dynamic frontend ports and network dev addresses
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === CLIENT_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['x-processing-time-ms', 'x-image-metadata', 'x-provider-name', 'Content-Disposition'],
    credentials: true,
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI + Manual Image Enhancer Server',
    nodeVersion: process.version,
  });
});

// Image Processing Endpoints
app.use('/api/images', imageRoutes);

// Safe global error handler - never leaks internal paths or stack traces
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred during image processing.',
  });
});

app.listen(PORT, () => {
  console.log(`[ImageEnhancer] Server listening on http://localhost:${PORT}`);
  console.log(`[ImageEnhancer] Health check ready at http://localhost:${PORT}/api/health`);
});
