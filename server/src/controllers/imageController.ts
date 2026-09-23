import { Request, Response } from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ImageAnalyzer } from '../services/image/imageAnalyzer.js';
import { ProviderRegistry } from '../services/providers/providerRegistry.js';
import { ManualImageProcessor } from '../services/image/manualImageProcessor.js';
import { EnhancementOptions, ExportOptions, ManualAdjustmentSettings } from '../types/index.js';

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
    });
  }
}
