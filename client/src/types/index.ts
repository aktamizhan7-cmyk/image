export type SkinToneMode = 'wheatish_golden' | 'dusky_bronze' | 'warm_olive' | 'anti_whitewash' | 'none';

export interface EnhancementOptions {
  scale: 2 | 4;
  denoiseStrength: number; // 0 - 100
  sharpenStrength: number; // 0 - 100
  lightingCorrection: boolean;
  colorCorrection: boolean;
  model: 'realesrgan-x4plus' | 'realesrgan-x2plus';
  // South Asian & Indian Skin Tone Optimization
  skinToneProtection: boolean;
  skinToneMode: SkinToneMode;
  melaninWarmth: number; // 0 - 100 (golden-amber radiance)
  antiAshiness: number; // 0 - 100 (eliminates grey/chalky bleaching)
}

export interface ManualAdjustmentSettings {
  // Light
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  
  // Color
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100 (warm/cool)
  tint: number; // -100 to 100 (magenta/green)
  
  // Detail
  sharpness: number; // 0 to 100
  clarity: number; // 0 to 100
  noiseReduction: number; // 0 to 100
  blur: number; // 0 to 100

  // Indian Skin Tone & Melanin Tuning
  melaninWarmth?: number; // 0 to 100
  antiAshiness?: number; // 0 to 100
  skinToneMode?: SkinToneMode;
}

export const DEFAULT_MANUAL_SETTINGS: ManualAdjustmentSettings = {
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
  melaninWarmth: 0,
  antiAshiness: 0,
  skinToneMode: 'none',
};

export const DEFAULT_ENHANCEMENT_OPTIONS: EnhancementOptions = {
  scale: 2,
  denoiseStrength: 30,
  sharpenStrength: 25,
  lightingCorrection: true,
  colorCorrection: true,
  model: 'realesrgan-x4plus',
  skinToneProtection: true,
  skinToneMode: 'wheatish_golden',
  melaninWarmth: 45,
  antiAshiness: 50,
};

export interface SkinTonePreset {
  id: SkinToneMode;
  label: string;
  badge: string;
  description: string;
  color: string;
  manualSettings: Partial<ManualAdjustmentSettings>;
  aiOptions: Partial<EnhancementOptions>;
}

export const SKIN_TONE_PRESETS: SkinTonePreset[] = [
  {
    id: 'wheatish_golden',
    label: 'Wheatish & Golden Glow',
    badge: 'Popular',
    description: 'Brings out rich warm amber and golden undertones with soft highlight roll-off.',
    color: 'from-amber-500 to-orange-600',
    manualSettings: {
      temperature: 14,
      tint: 4,
      exposure: 2,
      highlights: -12,
      shadows: 8,
      saturation: 12,
      contrast: 4,
      clarity: 8,
      melaninWarmth: 45,
      antiAshiness: 50,
      skinToneMode: 'wheatish_golden',
    },
    aiOptions: {
      skinToneProtection: true,
      skinToneMode: 'wheatish_golden',
      melaninWarmth: 45,
      antiAshiness: 50,
    },
  },
  {
    id: 'dusky_bronze',
    label: 'Dusky & Deep Bronze',
    badge: 'Melanin Rich',
    description: 'Deep, radiant bronze preservation. Lifts shadows without ashiness or highlight clipping.',
    color: 'from-amber-700 to-yellow-800',
    manualSettings: {
      temperature: 16,
      tint: 2,
      exposure: 4,
      highlights: -18,
      shadows: 16,
      saturation: 15,
      contrast: -2,
      clarity: 10,
      melaninWarmth: 60,
      antiAshiness: 65,
      skinToneMode: 'dusky_bronze',
    },
    aiOptions: {
      skinToneProtection: true,
      skinToneMode: 'dusky_bronze',
      melaninWarmth: 60,
      antiAshiness: 65,
    },
  },
  {
    id: 'warm_olive',
    label: 'Warm Olive Radiance',
    badge: 'Natural Tone',
    description: 'Balances green/olive undertones and neutralizes cool grey casts for smooth radiance.',
    color: 'from-yellow-600 to-emerald-700',
    manualSettings: {
      temperature: 10,
      tint: 6,
      exposure: 0,
      highlights: -10,
      shadows: 6,
      saturation: 8,
      contrast: 6,
      clarity: 12,
      melaninWarmth: 35,
      antiAshiness: 40,
      skinToneMode: 'warm_olive',
    },
    aiOptions: {
      skinToneProtection: true,
      skinToneMode: 'warm_olive',
      melaninWarmth: 35,
      antiAshiness: 40,
    },
  },
  {
    id: 'anti_whitewash',
    label: 'Anti-Bleach & True Melanin',
    badge: 'Fidelity Shield',
    description: 'Strictly preserves original skin pigmentation against AI bleaching and chalky filters.',
    color: 'from-rose-600 to-amber-600',
    manualSettings: {
      temperature: 12,
      tint: 0,
      exposure: -2,
      highlights: -20,
      shadows: 12,
      saturation: 10,
      contrast: -4,
      clarity: 6,
      melaninWarmth: 50,
      antiAshiness: 70,
      skinToneMode: 'anti_whitewash',
    },
    aiOptions: {
      skinToneProtection: true,
      skinToneMode: 'anti_whitewash',
      melaninWarmth: 50,
      antiAshiness: 70,
    },
  },
];


export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
  hasAlpha?: boolean;
  space?: string;
  channels?: number;
}

export interface ExportOptions {
  format: 'jpeg' | 'png' | 'webp';
  quality: number; // 1 - 100
  preserveMetadata?: boolean;
}

export interface ProcessedImageResult {
  imageUrl: string;
  metadata: ImageMetadata;
  processingTimeMs: number;
  provider: string;
  modelUsed?: string;
}
