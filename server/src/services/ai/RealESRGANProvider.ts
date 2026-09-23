import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { ImageInput, ImageProcessingProvider } from '../providers/ImageProcessingProvider.js';
import { EnhancementOptions, ProcessedResult } from '../../types/index.js';
import { RealESRGANModelManager } from './RealESRGANModelManager.js';
import { ImageAnalyzer } from '../image/imageAnalyzer.js';
import { SkinToneOptimizer } from '../image/skinToneOptimizer.js';

export class RealESRGANProvider implements ImageProcessingProvider {
  public readonly name = 'Real-ESRGAN (NCNN Vulkan)';
  private modelManager: RealESRGANModelManager;
  private tempDir: string;

  constructor() {
    this.modelManager = RealESRGANModelManager.getInstance();
    const serverRoot = path.resolve(__dirname, '../../../');
    this.tempDir = path.resolve(serverRoot, 'temp');
  }

  public async isAvailable(): Promise<boolean> {
    return this.modelManager.isAvailable();
  }

  /**
   * Complete AI Enhancement Pipeline:
   * Input -> Validation -> Pre-processing -> Real-ESRGAN -> Denoising -> Post-processing -> Output
   */
  public async enhance(input: ImageInput, options: EnhancementOptions): Promise<ProcessedResult> {
    const startTime = Date.now();
    await this.ensureTempDir();

    // 1. Validation & Analysis
    const analysis = await ImageAnalyzer.analyze(input.filePath);
    const origWidth = analysis.metadata.width;
    const origHeight = analysis.metadata.height;

    const scale = options.scale || (analysis.isHighResolution ? 2 : 4);
    const denoiseStrength = options.denoiseStrength ?? 30;
    const sharpenStrength = options.sharpenStrength ?? 25;
    const model = options.model || 'realesrgan-x4plus';

    const jobId = `enh_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const preprocessedPath = path.join(this.tempDir, `${jobId}_pre.png`);
    const esrganOutputPath = path.join(this.tempDir, `${jobId}_esrgan.png`);
    const finalOutputPath = path.join(this.tempDir, `${jobId}_enhanced.png`);

    try {
      // 2. Pre-processing: Exif rotation, intelligent working bounds, and artifact reduction
      // High-resolution photos are safely bounded to prevent VRAM overflow and ensure responsive processing
      const maxWorkingDim = scale === 4 ? 800 : 960;
      let preChain = sharp(input.filePath)
        .rotate()
        .resize(maxWorkingDim, maxWorkingDim, {
          fit: 'inside',
          withoutEnlargement: true,
        });

      if (denoiseStrength > 50) {
        preChain = preChain.median(1);
      }
      await preChain.toFile(preprocessedPath);
      const preMeta = await sharp(preprocessedPath).metadata();
      const preW = preMeta.width || origWidth;
      const preH = preMeta.height || origHeight;

      // 3. Real-ESRGAN Super-Resolution Execution
      // CRITICAL: realesrgan-x4plus is fundamentally a 4x neural architecture.
      // Running it with -s 2 in ncnn causes mismatched tile strides and scrambled tiles.
      // We execute the neural net at its native 4x scale for mathematical perfection,
      // and downsample with Lanczos3 if 2x was requested.
      const nativeNetScale = model.includes('x4') ? 4 : scale;
      await this.modelManager.execute({
        inputPath: preprocessedPath,
        outputPath: esrganOutputPath,
        scale: nativeNetScale,
        modelName: model,
      });

      // 4. Post-processing: Denoise + Smart Sharpen + Lighting & Color Correction + Downsample to target scale
      let postChain = sharp(esrganOutputPath);

      // If user requested 2x and we ran 4x native net, downsample with pristine Lanczos3
      if (scale === 2 && nativeNetScale === 4) {
        postChain = postChain.resize(preW * 2, preH * 2, {
          kernel: 'lanczos3',
        });
      }

      // Denoising step
      if (denoiseStrength > 0) {
        if (denoiseStrength >= 70) {
          postChain = postChain.median(1);
        }
      }

      // Smart Sharpening: prevents haloing by using adaptive threshold
      if (sharpenStrength > 0) {
        const sigma = 0.5 + (sharpenStrength / 100) * 1.0;
        const flat = 1.0;
        const jagged = 2.0;
        postChain = postChain.sharpen({
          sigma,
          m1: flat,
          m2: jagged,
        });
      }

      // Lighting & Color correction
      if (options.lightingCorrection) {
        postChain = postChain.modulate({
          brightness: 1.02, // subtle natural lift without blowing out skin highlights
          saturation: options.colorCorrection ? 1.06 : 1.02,
        });
      }

      // South Asian & Indian Skin Tone Optimization (Melanin & Warmth Preservation)
      // Active by default to prevent whitewashing/ashiness, or explicitly configured
      const isSkinProtectionEnabled = options.skinToneProtection !== false && options.skinToneMode !== 'none';
      if (isSkinProtectionEnabled) {
        postChain = await SkinToneOptimizer.optimize(postChain, {
          skinToneMode: options.skinToneMode || 'wheatish_golden',
          melaninWarmth: options.melaninWarmth ?? 45,
          antiAshiness: options.antiAshiness ?? 50,
        });
      } else if (options.lightingCorrection) {
        // Subtle auto-levels normalize only if skin protection is disabled
        postChain = postChain.linear(1.02, -2);
      }


      await postChain.png({ compressionLevel: 6 }).toFile(finalOutputPath);

      const finalMeta = await sharp(finalOutputPath).metadata();
      const finalStat = await fs.stat(finalOutputPath);

      return {
        outputPath: finalOutputPath,
        metadata: {
          width: finalMeta.width || preW * scale,
          height: finalMeta.height || preH * scale,
          format: 'png',
          size: finalStat.size,
          aspectRatio: analysis.metadata.aspectRatio,
          hasAlpha: finalMeta.hasAlpha,
        },
        processingTimeMs: Date.now() - startTime,
        provider: this.name,
        modelUsed: model,
      };
    } finally {
      // Clean up intermediate files
      await fs.unlink(preprocessedPath).catch(() => {});
      await fs.unlink(esrganOutputPath).catch(() => {});
    }
  }

  /**
   * Direct AI Upscale (2x or 4x)
   */
  public async upscale(input: ImageInput, scale: 2 | 4, model = 'realesrgan-x4plus'): Promise<ProcessedResult> {
    const startTime = Date.now();
    await this.ensureTempDir();

    const jobId = `upscale_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const inputPng = path.join(this.tempDir, `${jobId}_in.png`);
    const outputPath = path.join(this.tempDir, `${jobId}_out.png`);

    try {
      // Ensure clean PNG and safe working dimension for Real-ESRGAN
      const maxWorkingDim = scale === 4 ? 800 : 960;
      await sharp(input.filePath)
        .rotate()
        .resize(maxWorkingDim, maxWorkingDim, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png()
        .toFile(inputPng);

      const preMeta = await sharp(inputPng).metadata();
      const preW = preMeta.width || 0;
      const preH = preMeta.height || 0;

      const nativeNetScale = model.includes('x4') ? 4 : scale;
      const rawOutputPath = scale === 2 && nativeNetScale === 4 ? `${outputPath}.4x.png` : outputPath;

      await this.modelManager.execute({
        inputPath: inputPng,
        outputPath: rawOutputPath,
        scale: nativeNetScale,
        modelName: model,
      });

      if (scale === 2 && nativeNetScale === 4) {
        await sharp(rawOutputPath)
          .resize(preW * 2, preH * 2, { kernel: 'lanczos3' })
          .png()
          .toFile(outputPath);
        await fs.unlink(rawOutputPath).catch(() => {});
      }

      const meta = await sharp(outputPath).metadata();
      const stat = await fs.stat(outputPath);

      return {
        outputPath,
        metadata: {
          width: meta.width || preW * scale,
          height: meta.height || preH * scale,
          format: 'png',
          size: stat.size,
          aspectRatio: meta.width && meta.height ? Number((meta.width / meta.height).toFixed(2)) : 1,
          hasAlpha: meta.hasAlpha,
        },
        processingTimeMs: Date.now() - startTime,
        provider: this.name,
        modelUsed: model,
      };
    } finally {
      await fs.unlink(inputPng).catch(() => {});
    }
  }

  /**
   * Standalone Denoising
   */
  public async denoise(input: ImageInput, strength: number): Promise<ProcessedResult> {
    const startTime = Date.now();
    await this.ensureTempDir();

    const jobId = `denoise_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outputPath = path.join(this.tempDir, `${jobId}_denoised.png`);

    let chain = sharp(input.filePath).rotate();
    if (strength > 50) {
      chain = chain.median(1);
    }
    const blurAmount = Math.max(0.3, (strength / 100) * 1.5);
    chain = chain.blur(blurAmount);

    await chain.png().toFile(outputPath);

    const meta = await sharp(outputPath).metadata();
    const stat = await fs.stat(outputPath);

    return {
      outputPath,
      metadata: {
        width: meta.width || 0,
        height: meta.height || 0,
        format: 'png',
        size: stat.size,
        aspectRatio: meta.width && meta.height ? Number((meta.width / meta.height).toFixed(2)) : 1,
        hasAlpha: meta.hasAlpha,
      },
      processingTimeMs: Date.now() - startTime,
      provider: this.name,
    };
  }

  private async ensureTempDir(): Promise<void> {
    if (!existsSync(this.tempDir)) {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }
}
