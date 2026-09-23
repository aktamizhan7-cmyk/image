import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { ExportOptions, ManualAdjustmentSettings, ProcessedResult } from '../../types/index.js';
import { SkinToneOptimizer } from './skinToneOptimizer.js';


export class ManualImageProcessor {
  private static tempDir = path.resolve(__dirname, '../../../temp');

  public static async processAndExport(
    inputPath: string,
    adjustments: ManualAdjustmentSettings,
    exportOptions: ExportOptions
  ): Promise<ProcessedResult> {
    const startTime = Date.now();
    await this.ensureTempDir();

    const jobId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const ext = exportOptions.format === 'jpeg' ? 'jpg' : exportOptions.format;
    const outputPath = path.join(this.tempDir, `${jobId}.${ext}`);

    let pipeline = sharp(inputPath).rotate();

    // 1. Exposure & Brightness & Saturation modulation
    // Calculate brightness multiplier
    // Sharp modulate: brightness: 1 = normal, saturation: 1 = normal, hue: degrees
    const brightMult = Math.max(
      0.1,
      1 + (adjustments.brightness / 100) * 0.5 + (adjustments.exposure / 100) * 0.4
    );
    const satMult = Math.max(0, 1 + (adjustments.saturation / 100) * 0.8);
    const hueDeg = Math.round(adjustments.tint * 0.9);

    pipeline = pipeline.modulate({
      brightness: brightMult,
      saturation: satMult,
      hue: hueDeg,
    });

    // 2. Contrast adjustments via linear transformation (a * input + b)
    if (adjustments.contrast !== 0) {
      const c = adjustments.contrast / 100;
      const a = 1 + c * 0.6;
      const b = 128 * (1 - a);
      pipeline = pipeline.linear(a, b);
    }

    // 3. Temperature (approx via tint/tinting matrix or subtle linear channel scaling)
    if (adjustments.temperature !== 0) {
      const t = adjustments.temperature / 100;
      // Warm: boost red, reduce blue
      // Cool: reduce red, boost blue
      const rScale = 1 + t * 0.12;
      const bScale = 1 - t * 0.12;
      pipeline = pipeline.recomb([
        [rScale, 0, 0],
        [0, 1, 0],
        [0, 0, bScale],
      ]);
    }

    // 3.5 South Asian / Indian Skin Tone Optimization
    if (adjustments.skinToneMode && adjustments.skinToneMode !== 'none') {
      pipeline = await SkinToneOptimizer.optimize(pipeline, {
        skinToneMode: adjustments.skinToneMode,
        melaninWarmth: adjustments.melaninWarmth,
        antiAshiness: adjustments.antiAshiness,
      });
    }

    // 4. Sharpness & Clarity

    const totalSharp = adjustments.sharpness + adjustments.clarity * 0.5;
    if (totalSharp > 0) {
      const sigma = 0.5 + (totalSharp / 100) * 1.5;
      pipeline = pipeline.sharpen({
        sigma,
        m1: 1.0,
        m2: 2.5,
      });
    }

    // 5. Blur
    if (adjustments.blur > 0) {
      const blurSigma = Math.max(0.3, (adjustments.blur / 100) * 10);
      pipeline = pipeline.blur(blurSigma);
    }

    // 6. Noise reduction
    if (adjustments.noiseReduction > 40) {
      pipeline = pipeline.median(1);
    }

    // 7. Format Export Configuration
    const quality = Math.min(100, Math.max(1, exportOptions.quality || 92));

    if (exportOptions.format === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      });
    } else if (exportOptions.format === 'webp') {
      pipeline = pipeline.webp({
        quality,
        lossless: quality === 100,
        effort: 4,
      });
    } else {
      // PNG
      pipeline = pipeline.png({
        compressionLevel: quality < 80 ? 9 : 6,
      });
    }

    const info = await pipeline.toFile(outputPath);

    return {
      outputPath,
      metadata: {
        width: info.width || 0,
        height: info.height || 0,
        format: exportOptions.format,
        size: info.size,
        aspectRatio: info.width && info.height ? Number((info.width / info.height).toFixed(2)) : 1,
        hasAlpha: exportOptions.format === 'png' || exportOptions.format === 'webp',
      },
      processingTimeMs: Date.now() - startTime,
      provider: 'Sharp Manual Engine',
    };
  }

  private static async ensureTempDir(): Promise<void> {
    if (!existsSync(this.tempDir)) {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }
}
