import express, { Request, Response, NextFunction, Router } from 'express';
import cors, { CorsOptions } from 'cors';
import { nanoBananaService, NanoBananaService, ImageToImageOptions } from './services/nanoBanana.js';
import { uploadWithReferences, validateMultiImageIntegrity } from './middleware/upload.js';
import { NanoBananaReferenceInput, SkinToneMode } from './types/index.js';
import fs from 'fs/promises';

/**
 * Standard CORS configuration for Nano Banana image endpoints
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: [
    'x-processing-time-ms',
    'x-image-metadata',
    'x-provider-name',
    'x-super-resolved',
    'x-ai-description',
    'Content-Disposition',
  ],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);

/**
 * Validated image edit request body interface
 */
export interface ValidatedEditInput {
  prompt: string;
  imageBuffer: Buffer;
  mimeType: string;
  model?: 'gemini-3.1-flash-image' | 'gemini-3.1-flash-lite-image' | 'gemini-3-pro-image';
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '1:4' | '1:8' | '4:1' | '8:1';
  imageSize?: '512px' | '1K' | '2K' | '4K';
  references?: NanoBananaReferenceInput[];
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  autoSuperResolution?: boolean;
  scale?: 2 | 4;
  skinToneProtection?: boolean;
  skinToneMode?: SkinToneMode;
  melaninWarmth?: number;
  antiAshiness?: number;
}

/**
 * Input validator for image-editing requests
 */
export async function validateImageEditRequest(req: Request): Promise<{
  input?: ValidatedEditInput;
  filesToCleanup: string[];
  error?: string;
}> {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const mainFile = files?.image?.[0] || req.file;
  const filesToCleanup: string[] = [];

  let imageBuffer: Buffer | null = null;
  let mimeType = 'image/jpeg';

  // 1. Image extraction (Multipart file upload or JSON Base64 data)
  if (mainFile) {
    filesToCleanup.push(mainFile.path);
    imageBuffer = await fs.readFile(mainFile.path);
    mimeType = mainFile.mimetype || 'image/jpeg';
  } else if (req.body.image && typeof req.body.image === 'string') {
    const raw = req.body.image.trim();
    if (raw.startsWith('data:')) {
      const match = raw.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBuffer = Buffer.from(match[2], 'base64');
      } else {
        return { filesToCleanup, error: 'Invalid data URL format for image. Expected data:<mime>;base64,<data>' };
      }
    } else {
      try {
        imageBuffer = Buffer.from(raw, 'base64');
      } catch {
        return { filesToCleanup, error: 'Malformed base64 string provided for image.' };
      }
    }
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    return {
      filesToCleanup,
      error: 'Missing required image. Provide an image file (multipart/form-data) or a base64 encoded image string.',
    };
  }

  // 2. Prompt validation
  const prompt = req.body.prompt;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return { filesToCleanup, error: 'A non-empty prompt is required for image editing.' };
  }

  if (prompt.trim().length > 3000) {
    return { filesToCleanup, error: 'Prompt exceeds maximum allowed length of 3000 characters.' };
  }

  // 3. Model validation
  const validModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image'];
  let model: 'gemini-3.1-flash-image' | 'gemini-3.1-flash-lite-image' | 'gemini-3-pro-image' = 'gemini-3.1-flash-image';
  if (req.body.model) {
    if (!validModels.includes(req.body.model)) {
      return {
        filesToCleanup,
        error: `Invalid model "${req.body.model}". Supported models: ${validModels.join(', ')}`,
      };
    }
    model = req.body.model;
  }

  // 4. Aspect Ratio validation
  const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
  let aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '1:4' | '1:8' | '4:1' | '8:1' | undefined;
  if (req.body.aspectRatio) {
    if (!validAspectRatios.includes(req.body.aspectRatio)) {
      return {
        filesToCleanup,
        error: `Invalid aspectRatio "${req.body.aspectRatio}". Supported ratios: ${validAspectRatios.join(', ')}`,
      };
    }
    aspectRatio = req.body.aspectRatio;
  }

  // 5. Image Size validation
  const validImageSizes = ['512px', '1K', '2K', '4K'];
  let imageSize: '512px' | '1K' | '2K' | '4K' | undefined;
  if (req.body.imageSize) {
    if (!validImageSizes.includes(req.body.imageSize)) {
      return {
        filesToCleanup,
        error: `Invalid imageSize "${req.body.imageSize}". Supported sizes: ${validImageSizes.join(', ')}`,
      };
    }
    imageSize = req.body.imageSize;
  }

  // 6. Super-resolution scale validation
  let scale: 2 | 4 = 2;
  if (req.body.scale !== undefined) {
    const parsedScale = Number(req.body.scale);
    if (parsedScale !== 2 && parsedScale !== 4) {
      return { filesToCleanup, error: 'Invalid scale value. Must be either 2 or 4.' };
    }
    scale = parsedScale;
  }

  // 7. Reference images extraction & validation
  const references: NanoBananaReferenceInput[] = [];
  const refLabels: { [key: string]: string } = {};
  if (req.body.refLabels) {
    try {
      Object.assign(refLabels, typeof req.body.refLabels === 'string' ? JSON.parse(req.body.refLabels) : req.body.refLabels);
    } catch {
      // Ignore parse failure
    }
  }

  if (files) {
    for (const key of ['ref1', 'ref2', 'ref3']) {
      const refFile = files[key]?.[0];
      if (refFile) {
        filesToCleanup.push(refFile.path);
        const refBuf = await fs.readFile(refFile.path);
        references.push({
          buffer: refBuf,
          mimeType: refFile.mimetype || 'image/jpeg',
          label: refLabels[key] || `Reference ${key.replace('ref', '')}`,
          originalName: refFile.originalname,
        });
      }
    }
  }

  // 8. Session history validation
  let history: Array<{ role: 'user' | 'assistant'; text: string }> | undefined;
  if (req.body.history) {
    try {
      history = typeof req.body.history === 'string' ? JSON.parse(req.body.history) : req.body.history;
      if (!Array.isArray(history)) {
        history = undefined;
      }
    } catch {
      history = undefined;
    }
  }

  // 9. Skin tone calibration parameters
  const isSuperRes = req.body.autoSuperResolution === true || req.body.autoSuperResolution === 'true';
  const skinToneProtection = req.body.skinToneProtection === true || req.body.skinToneProtection === 'true';
  const skinToneMode = req.body.skinToneMode as SkinToneMode | undefined;
  const melaninWarmth = req.body.melaninWarmth !== undefined ? Number(req.body.melaninWarmth) : undefined;
  const antiAshiness = req.body.antiAshiness !== undefined ? Number(req.body.antiAshiness) : undefined;

  return {
    input: {
      prompt: prompt.trim(),
      imageBuffer,
      mimeType,
      model,
      aspectRatio,
      imageSize,
      references: references.length > 0 ? references : undefined,
      history,
      autoSuperResolution: isSuperRes,
      scale,
      skinToneProtection,
      skinToneMode,
      melaninWarmth,
      antiAshiness,
    },
    filesToCleanup,
  };
}

/**
 * Express handler for image-editing requests powered by NanoBananaService
 */
export async function editImageHandler(req: Request, res: Response) {
  let filesToClean: string[] = [];

  try {
    const { input, filesToCleanup, error } = await validateImageEditRequest(req);
    filesToClean = filesToCleanup;

    if (error || !input) {
      return res.status(400).json({ error: error || 'Invalid input provided' });
    }

    const editOptions: ImageToImageOptions = {
      prompt: input.prompt,
      image: input.imageBuffer,
      mimeType: input.mimeType,
      model: input.model,
      references: input.references?.map((r) => ({
        buffer: r.buffer,
        label: r.label,
        mimeType: r.mimeType,
      })),
      aspectRatio: input.aspectRatio,
      imageSize: input.imageSize,
      history: input.history,
      autoSuperResolution: input.autoSuperResolution,
      scale: input.scale,
      skinToneProtection: input.skinToneProtection,
      skinToneMode: input.skinToneMode,
      melaninWarmth: input.melaninWarmth,
      antiAshiness: input.antiAshiness,
    };

    const result = await nanoBananaService.imageToImage(editOptions);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('x-processing-time-ms', result.processingTimeMs.toString());
    res.setHeader('x-image-metadata', JSON.stringify(result.metadata));
    res.setHeader('x-provider-name', result.modelUsed);
    if (result.isSuperResolved) {
      res.setHeader('x-super-resolved', 'true');
    }
    if (result.textDescription) {
      res.setHeader('x-ai-description', encodeURIComponent(result.textDescription));
    }

    const buffer = await fs.readFile(result.outputPath);
    return res.send(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[NanoBananaEndpoint] Edit processing error:', message);
    return res.status(500).json({
      error: message || 'AI image editing failed.',
      details: message,
    });
  } finally {
    for (const filePath of filesToClean) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
}

/**
 * Create a router with CORS and validation configured
 */
export function createNanoBananaRouter(): Router {
  const router = Router();

  // Apply CORS to all routes in this router
  router.use(corsMiddleware);

  // Preflight support
  router.options('*', corsMiddleware);

  const uploadMiddleware = uploadWithReferences as any;
  const integrityMiddleware = validateMultiImageIntegrity as any;

  // Primary image editing endpoints
  router.post('/edit', uploadMiddleware, integrityMiddleware, editImageHandler);
  router.post('/ai-edit', uploadMiddleware, integrityMiddleware, editImageHandler);

  return router;
}

export const nanoBananaRouter = createNanoBananaRouter();

export { nanoBananaService, NanoBananaService };
export default nanoBananaRouter;
