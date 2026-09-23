import sharp from 'sharp';
import fs from 'fs/promises';
import { ImageMetadata } from '../../types/index.js';

export interface ImageAnalysisReport {
  metadata: ImageMetadata;
  aspectRatioLabel: string;
  hasAlpha: boolean;
  isHighResolution: boolean;
  estimatedNoiseLevel: 'low' | 'medium' | 'high';
  averageLuminance: number;
  recommendations: {
    recommendedUpscale: 2 | 4;
    suggestDenoise: boolean;
    suggestSharpen: boolean;
  };
}

export class ImageAnalyzer {
  public static async analyze(filePath: string): Promise<ImageAnalysisReport> {
    const stat = await fs.stat(filePath);
    const image = sharp(filePath);
    const meta = await image.metadata();
    const stats = await image.stats().catch(() => null);

    const width = meta.width || 0;
    const height = meta.height || 0;
    const format = meta.format || 'unknown';
    const aspectRatio = width && height ? Number((width / height).toFixed(2)) : 1;
    const hasAlpha = meta.hasAlpha || false;

    // Luminance & noise estimation
    let avgLum = 128;
    let stdevAvg = 50;

    if (stats && stats.channels && stats.channels.length >= 3) {
      const r = stats.channels[0].mean;
      const g = stats.channels[1].mean;
      const b = stats.channels[2].mean;
      avgLum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      const rDev = stats.channels[0].stdev;
      const gDev = stats.channels[1].stdev;
      const bDev = stats.channels[2].stdev;
      stdevAvg = (rDev + gDev + bDev) / 3;
    }

    // Estimate noise level: low stdev in dark or very high frequency variance
    const estimatedNoiseLevel = stdevAvg < 20 ? 'low' : stdevAvg > 65 ? 'high' : 'medium';
    const isHighResolution = width >= 2048 || height >= 2048;

    return {
      metadata: {
        width,
        height,
        format,
        size: stat.size,
        aspectRatio,
        hasAlpha,
        space: meta.space,
        channels: meta.channels,
        density: meta.density,
      },
      aspectRatioLabel: this.getAspectRatioLabel(aspectRatio),
      hasAlpha,
      isHighResolution,
      estimatedNoiseLevel,
      averageLuminance: avgLum,
      recommendations: {
        recommendedUpscale: isHighResolution ? 2 : 4,
        suggestDenoise: estimatedNoiseLevel !== 'low',
        suggestSharpen: !isHighResolution,
      },
    };
  }

  private static getAspectRatioLabel(ratio: number): string {
    if (Math.abs(ratio - 1) < 0.05) return '1:1 Square';
    if (Math.abs(ratio - 1.33) < 0.05) return '4:3 Standard';
    if (Math.abs(ratio - 1.78) < 0.05) return '16:9 Widescreen';
    if (Math.abs(ratio - 0.75) < 0.05) return '3:4 Portrait';
    if (Math.abs(ratio - 0.56) < 0.05) return '9:16 Story/Reel';
    if (Math.abs(ratio - 1.5) < 0.05) return '3:2 Photo';
    return `${ratio}:1 Custom`;
  }
}
