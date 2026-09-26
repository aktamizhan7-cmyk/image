export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
  hasAlpha?: boolean;
  space?: string;
  channels?: number;
  density?: number;
}

export type SkinToneMode = 'wheatish_golden' | 'dusky_bronze' | 'warm_olive' | 'anti_whitewash' | 'none';

export interface EnhancementOptions {
  scale?: 2 | 4;
  denoiseStrength?: number; // 0 - 100
  sharpenStrength?: number; // 0 - 100
  lightingCorrection?: boolean;
  colorCorrection?: boolean;
  model?: 'realesrgan-x4plus' | 'realesrgan-x2plus';
  // South Asian & Indian Skin Tone Optimization
  skinToneProtection?: boolean;
  skinToneMode?: SkinToneMode;
  melaninWarmth?: number; // 0 - 100 (golden-amber radiance)
  antiAshiness?: number; // 0 - 100 (eliminates grey/chalky bleaching)
}

export interface ManualAdjustmentSettings {
  brightness: number;
  contrast: number;
  exposure: number;
  highlights: number;
  shadows: number;
  saturation: number;
  temperature: number;
  tint: number;
  sharpness: number;
  clarity: number;
  noiseReduction: number;
  blur: number;
  // Indian Skin Tone fine-tuning
  melaninWarmth?: number; // 0 - 100
  antiAshiness?: number; // 0 - 100
  skinToneMode?: SkinToneMode;
}


export interface ExportOptions {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  preserveMetadata?: boolean;
}

export type NanoBananaModelId =
  | 'gemini-3.1-flash-lite-image' // Nano Banana 2 Lite
  | 'gemini-3.1-flash-image'      // Nano Banana 2
  | 'gemini-3-pro-image';         // Nano Banana Pro

export interface NanoBananaReferenceInput {
  buffer: Buffer;
  mimeType: string;
  label?: string;
  originalName?: string;
}

export interface ProcessedResult {
  outputPath: string;
  metadata: ImageMetadata;
  processingTimeMs: number;
  provider: string;
  modelUsed?: string;
}
