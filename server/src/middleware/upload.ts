import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { UPLOADS_DIR, ensureTempDirectories } from '../utils/tempPaths.js';

ensureTempDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter: any = (
  _req: any,
  file: any,
  cb: any
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
  fileFilter: fileFilter as any,
});

export const uploadWithReferences = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'ref1', maxCount: 1 },
  { name: 'ref2', maxCount: 1 },
  { name: 'ref3', maxCount: 1 },
]);

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

/**
 * Validates main image + optional reference images
 */
export async function validateMultiImageIntegrity(req: Request, res: Response, next: NextFunction) {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const mainFile = files?.image?.[0] || req.file;

  if (!mainFile) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  try {
    const metadata = await sharp(mainFile.path).metadata();
    const maxDim = 8192;
    if ((metadata.width && metadata.width > maxDim) || (metadata.height && metadata.height > maxDim)) {
      return res.status(400).json({
        error: `Image dimensions exceed maximum allowed limit of ${maxDim}x${maxDim}px.`,
      });
    }

    (req as any).imageMetadata = metadata;

    if (files) {
      for (const key of ['ref1', 'ref2', 'ref3']) {
        const ref = files[key]?.[0];
        if (ref) {
          try {
            await sharp(ref.path).metadata();
          } catch (e: any) {
            console.warn(`[validateMultiImageIntegrity] Reference image ${key} error:`, e.message);
          }
        }
      }
    }

    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Uploaded file is corrupted or not a valid image.',
    });
  }
}

