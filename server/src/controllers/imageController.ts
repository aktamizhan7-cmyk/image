import { Request, Response } from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ImageAnalyzer } from '../services/image/imageAnalyzer.js';
import { ProviderRegistry } from '../services/providers/providerRegistry.js';
import { ManualImageProcessor } from '../services/image/manualImageProcessor.js';
import { GeminiImageService } from '../services/ai/geminiImageService.js';
import { nanoBananaService } from '../services/nanoBanana.js';
import {
  EnhancementOptions,
  ExportOptions,
  ManualAdjustmentSettings,
  NanoBananaReferenceInput,
} from '../types/index.js';

export class ImageController {
  /**
   * POST /api/images/analyze
   */
  public static async analyze(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    try {
      const report = await ImageAnalyzer.analyze(filePath);
      return res.json(report);
    } catch (err: any) {
      console.error('[ImageController] analyze error:', err);
      return res.status(500).json({ error: 'Failed to analyze image', details: err.message });
    } finally {
      await fs.unlink(filePath).catch(() => {});
    }
  }

  /**
   * POST /api/images/enhance
   */
  public static async enhance(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    let outputPath: string | null = null;

    try {
      let options: EnhancementOptions = {};
      if (req.body.options) {
        try {
          options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body.options;
        } catch {
          // fallback
        }
      }

      const provider = ProviderRegistry.getProvider();
      const result = await provider.enhance(
        {
          filePath,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
        options
      );

      outputPath = result.outputPath;

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('x-processing-time-ms', result.processingTimeMs.toString());
      res.setHeader('x-image-metadata', JSON.stringify(result.metadata));
      res.setHeader('x-provider-name', result.provider);

      const buffer = await fs.readFile(outputPath);
      return res.send(buffer);
    } catch (err: any) {
      console.error('[ImageController] enhance error:', err);
      return res.status(500).json({ error: 'AI enhancement failed', details: err.message });
    } finally {
      await fs.unlink(filePath).catch(() => {});
      if (outputPath && existsSync(outputPath)) {
        await fs.unlink(outputPath).catch(() => {});
      }
    }
  }

  /**
   * POST /api/images/upscale
   */
  public static async upscale(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    let outputPath: string | null = null;

    try {
      const scaleNum = Number(req.body.scale) || 2;
      const scale: 2 | 4 = scaleNum === 4 ? 4 : 2;
      const model = req.body.model || 'realesrgan-x4plus';

      const provider = ProviderRegistry.getProvider();
      const result = await provider.upscale(
        {
          filePath,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
        scale,
        model
      );

      outputPath = result.outputPath;

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('x-processing-time-ms', result.processingTimeMs.toString());
      res.setHeader('x-image-metadata', JSON.stringify(result.metadata));

      const buffer = await fs.readFile(outputPath);
      return res.send(buffer);
    } catch (err: any) {
      console.error('[ImageController] upscale error:', err);
      return res.status(500).json({ error: 'AI upscaling failed', details: err.message });
    } finally {
      await fs.unlink(filePath).catch(() => {});
      if (outputPath && existsSync(outputPath)) {
        await fs.unlink(outputPath).catch(() => {});
      }
    }
  }

  /**
   * POST /api/images/export
   */
  public static async exportImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    let outputPath: string | null = null;

    try {
      let adjustments: ManualAdjustmentSettings = {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        sharpness: 0,
        clarity: 0,
        noiseReduction: 0,
        blur: 0,
      };

      let exportOptions: ExportOptions = {
        format: 'png',
        quality: 92,
      };

      if (req.body.adjustments) {
        try {
          adjustments = typeof req.body.adjustments === 'string' ? JSON.parse(req.body.adjustments) : req.body.adjustments;
        } catch {}
      }

      if (req.body.exportOptions) {
        try {
          exportOptions = typeof req.body.exportOptions === 'string' ? JSON.parse(req.body.exportOptions) : req.body.exportOptions;
        } catch {}
      } else if (req.body.format) {
        exportOptions.format = req.body.format;
        if (req.body.quality) {
          exportOptions.quality = Number(req.body.quality) || 92;
        }
      }

      const result = await ManualImageProcessor.processAndExport(filePath, adjustments, exportOptions);
      outputPath = result.outputPath;

      const ext = exportOptions.format === 'jpeg' ? 'jpg' : exportOptions.format;
      const mime = exportOptions.format === 'jpeg' ? 'image/jpeg' : `image/${exportOptions.format}`;

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="enhanced_image.${ext}"`);
      res.setHeader('x-image-metadata', JSON.stringify(result.metadata));

      const buffer = await fs.readFile(outputPath);
      return res.send(buffer);
    } catch (err: any) {
      console.error('[ImageController] export error:', err);
      return res.status(500).json({ error: 'Image export failed', details: err.message });
    } finally {
      await fs.unlink(filePath).catch(() => {});
      if (outputPath && existsSync(outputPath)) {
        await fs.unlink(outputPath).catch(() => {});
      }
    }
  }

  /**
   * POST /api/images/generate
   * Generates a new image using Nano Banana models with optional chained super-resolution
   */
  public static async generateNanoBanana(req: Request, res: Response) {
    const {
      prompt,
      aspectRatio,
      imageSize,
      model,
      autoSuperResolution,
      scale,
      skinToneProtection,
      skinToneMode,
      melaninWarmth,
      antiAshiness,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A prompt is required for image generation.' });
    }

    try {
      const isSuperRes = autoSuperResolution === true || autoSuperResolution === 'true';
      const parsedScale = Number(scale) === 4 ? 4 : 2;

      const result = await nanoBananaService.textToImage({
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
        model,
        autoSuperResolution: isSuperRes,
        scale: parsedScale,
        skinToneProtection: skinToneProtection === true || skinToneProtection === 'true',
        skinToneMode,
        melaninWarmth: melaninWarmth !== undefined ? Number(melaninWarmth) : undefined,
        antiAshiness: antiAshiness !== undefined ? Number(antiAshiness) : undefined,
      });

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
    } catch (err: any) {
      console.error('[ImageController] generateNanoBanana error:', err);
      return res.status(500).json({
        error: err.message || 'Image generation failed.',
        details: err.message,
      });
    }
  }

  /**
   * POST /api/images/ai-edit or /api/images/edit
   * Edits the uploaded image using Nano Banana (Gemini) with multi-image references
   * and optional Real-ESRGAN super-resolution post-pass.
   */
  public static async editNanoBanana(req: Request, res: Response) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const mainFile = files?.image?.[0] || req.file;

    const filesToCleanup: string[] = [];
    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    // 1. Resolve and validate input image (from file upload or base64 payload)
    if (mainFile) {
      filesToCleanup.push(mainFile.path);
      imageBuffer = await fs.readFile(mainFile.path);
      mimeType = mainFile.mimetype || 'image/jpeg';
    } else if (req.body.image && typeof req.body.image === 'string') {
      const rawImage = req.body.image.trim();
      if (rawImage.startsWith('data:')) {
        const matches = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          return res.status(400).json({ error: 'Invalid data URL format for image' });
        }
      } else {
        imageBuffer = Buffer.from(rawImage, 'base64');
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        error: 'No image provided. Please upload an image file (multipart/form-data) or provide a base64 encoded image string.',
      });
    }

    // 2. Validate Prompt
    const prompt = req.body.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'An editing prompt is required.' });
    }

    if (prompt.trim().length > 3000) {
      return res.status(400).json({ error: 'Editing prompt exceeds maximum limit of 3000 characters.' });
    }

    // 3. Validate Model
    const validModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image'];
    const model = req.body.model && validModels.includes(req.body.model) ? req.body.model : 'gemini-3.1-flash-image';

    // 4. Validate Aspect Ratio
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
    const aspectRatio = req.body.aspectRatio && validAspectRatios.includes(req.body.aspectRatio) ? req.body.aspectRatio : undefined;

    // 5. Validate Image Size
    const validImageSizes = ['512px', '1K', '2K', '4K'];
    const imageSize = req.body.imageSize && validImageSizes.includes(req.body.imageSize) ? req.body.imageSize : undefined;

    try {
      // Extract reference images if provided
      const references: NanoBananaReferenceInput[] = [];
      const refLabels: { [key: string]: string } = {};
      if (req.body.refLabels) {
        try {
          Object.assign(refLabels, typeof req.body.refLabels === 'string' ? JSON.parse(req.body.refLabels) : req.body.refLabels);
        } catch {
          // fallback
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

      // Parse history if present
      let history: Array<{ role: 'user' | 'assistant'; text: string }> | undefined;
      if (req.body.history) {
        try {
          history = typeof req.body.history === 'string' ? JSON.parse(req.body.history) : req.body.history;
        } catch {
          // ignore
        }
      }

      const isSuperRes = req.body.autoSuperResolution === true || req.body.autoSuperResolution === 'true';
      const parsedScale = Number(req.body.scale) === 4 ? 4 : 2;

      const result = await nanoBananaService.imageToImage({
        prompt: prompt.trim(),
        image: imageBuffer,
        mimeType,
        model,
        references: references.length > 0 ? references : undefined,
        aspectRatio,
        imageSize,
        history,
        autoSuperResolution: isSuperRes,
        scale: parsedScale,
        skinToneProtection: req.body.skinToneProtection === true || req.body.skinToneProtection === 'true',
        skinToneMode: req.body.skinToneMode,
        melaninWarmth: req.body.melaninWarmth !== undefined ? Number(req.body.melaninWarmth) : undefined,
        antiAshiness: req.body.antiAshiness !== undefined ? Number(req.body.antiAshiness) : undefined,
      });

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
    } catch (err: any) {
      console.error('[ImageController] editNanoBanana error:', err);
      return res.status(500).json({
        error: err.message || 'AI Image editing failed.',
        details: err.message,
      });
    } finally {
      for (const p of filesToCleanup) {
        await fs.unlink(p).catch(() => {});
      }
    }
  }

  /**
   * POST /api/images/remove-background
   * Removes image background and returns transparent PNG using NanoBanana.
   */
  public static async removeBackgroundNanoBanana(req: Request, res: Response) {
    const mainFile = req.file;
    const filesToCleanup: string[] = [];
    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/png';

    if (mainFile) {
      filesToCleanup.push(mainFile.path);
      imageBuffer = await fs.readFile(mainFile.path);
      mimeType = mainFile.mimetype || 'image/png';
    } else if (req.body.image && typeof req.body.image === 'string') {
      const rawImage = req.body.image.trim();
      if (rawImage.startsWith('data:')) {
        const matches = rawImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          return res.status(400).json({ error: 'Invalid data URL format for image' });
        }
      } else {
        imageBuffer = Buffer.from(rawImage, 'base64');
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        error: 'No image provided for background removal. Please upload an image or provide a base64 string.',
      });
    }

    try {
      const featherRadius = req.body.featherRadius ? Number(req.body.featherRadius) : 3;
      const isSuperRes = req.body.autoSuperResolution === true || req.body.autoSuperResolution === 'true';
      const parsedScale = Number(req.body.scale) === 4 ? 4 : 2;

      const result = await nanoBananaService.removeBackground({
        image: imageBuffer,
        mimeType,
        featherRadius,
        autoSuperResolution: isSuperRes,
        scale: parsedScale,
        prompt: typeof req.body.prompt === 'string' ? req.body.prompt : undefined,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('x-processing-time-ms', result.processingTimeMs.toString());
      res.setHeader('x-image-metadata', JSON.stringify(result.metadata));
      res.setHeader('x-provider-name', result.modelUsed);
      if (result.isSuperResolved) {
        res.setHeader('x-super-resolved', 'true');
      }

      const buffer = await fs.readFile(result.outputPath);
      return res.send(buffer);
    } catch (err: any) {
      console.error('[ImageController] removeBackgroundNanoBanana error:', err);
      return res.status(500).json({
        error: err.message || 'Background removal failed.',
        details: err.message,
      });
    } finally {
      for (const p of filesToCleanup) {
        await fs.unlink(p).catch(() => {});
      }
    }
  }

  /**
   * GET /api/images/status
   */
  public static async status(_req: Request, res: Response) {
    const provider = ProviderRegistry.getProvider();
    const isAiAvailable = await provider.isAvailable();
    return res.json({
      status: 'online',
      provider: provider.name,
      isAiAvailable,
      supportedFormats: ['jpeg', 'jpg', 'png', 'webp'],
      maxFileSizeMb: 25,
      maxDimension: 8192,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      nanoBananaModels: [
        {
          id: 'gemini-3.1-flash-lite-image',
          name: 'Nano Banana 2 Lite',
          type: 'Fast Operations',
        },
        {
          id: 'gemini-3.1-flash-image',
          name: 'Nano Banana 2',
          type: 'General Generation & Editing',
        },
        {
          id: 'gemini-3-pro-image',
          name: 'Nano Banana Pro',
          type: 'Complex Professional Studio',
        },
      ],
      features: [
        'Multi-Reference Image Input (Up to 3 references)',
        'Subject Preservation & Visual Feature Locking',
        'Chained Real-ESRGAN Super-Resolution (2x / 4x 4K Post-Pass)',
        'Melanin Guard South Asian & Indian Skin Calibration',
        'Multi-turn Conversational Editing',
      ],
    });
  }
}
