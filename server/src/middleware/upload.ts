import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

const serverRoot = path.resolve(__dirname, '../../../');
const uploadDir = path.resolve(serverRoot, 'temp', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload a JPG, PNG, or WebP image.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter,
});

/**
 * Validates actual image integrity and magic bytes using Sharp
 */
export async function validateImageIntegrity(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  try {
    const metadata = await sharp(req.file.path).metadata();
    
    // Check width and height
    const maxDim = 8192;
    if ((metadata.width && metadata.width > maxDim) || (metadata.height && metadata.height > maxDim)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: `Image dimensions exceed maximum allowed limit of ${maxDim}x${maxDim}px.`,
      });
    }

    // Attach validated metadata to request
    (req as any).imageMetadata = metadata;
    next();
  } catch (err) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      error: 'Uploaded file is corrupted or not a valid image.',
    });
  }
}
