import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { CONTACT_UPLOADS_DIR, ensureTempDirectories } from '../utils/tempPaths.js';

ensureTempDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CONTACT_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedName}`;
    cb(null, unique.endsWith(originalExt) ? unique : `${unique}${originalExt}`);
  },
});

const fileFilter: any = (
  _req: any,
  file: any,
  cb: any
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
    'application/zip',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.json', '.zip'];

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file attachment. Allowed formats: JPG, PNG, WebP, PDF, TXT, JSON, ZIP.'));
  }
};

export const contactUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
    files: 1,
  },
  fileFilter,
});
