export type SkinToneMode = 'wheatish_golden' | 'dusky_bronze' | 'warm_olive' | 'anti_whitewash' | 'deep_rich' | 'none';

export interface EnhancementOptions {
  scale: 2 | 4 | 8;
  denoiseStrength: number; // 0 - 100
  sharpenStrength: number; // 0 - 100
  lightingCorrection: boolean;
  colorCorrection: boolean;
  model: 'realesrgan-x4plus' | 'realesrgan-x2plus' | 'realesrgan-x4plus-anime' | 'realesrnet-x4plus';
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
  sizeBytes?: number;
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

export type BatchItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  status: BatchItemStatus;
  progress: number;
  originalMeta?: ImageMetadata;
  enhancedBlob?: Blob;
  enhancedUrl?: string;
  enhancedMeta?: ImageMetadata;
  processingTimeMs?: number;
  error?: string;
}

export type PresetCategory = 'custom' | 'portrait' | 'cinematic' | 'landscape' | 'vintage' | 'vibrant' | 'monochrome';

export interface AdjustmentPreset {
  id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  isBuiltIn?: boolean;
  colorBadge?: string;
  createdAt: string;
  updatedAt?: string;
  manualSettings: Partial<ManualAdjustmentSettings>;
  enhancementOptions?: Partial<EnhancementOptions>;
  author?: string;
  tags?: string[];
}

export type ContactPriority = 'normal' | 'high' | 'urgent';

export interface ContactTicketResponse {
  id: string;
  name?: string;
  email?: string;
  topic: string;
  priority: ContactPriority;
  status: 'received' | 'in_review' | 'assigned' | 'resolved';
  createdAt: string;
  slaResponseHours: number;
  estimatedResolutionTime: string;
  assignedTeam: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  organization?: string;
  priority?: ContactPriority;
  topic: string;
  message: string;
}

export interface ContactTopicInfo {
  id: string;
  label: string;
  description: string;
  defaultSlaHours: number;
  team: string;
}

export type NanoBananaModelId =
  | 'gemini-3.1-flash-lite-image' // Nano Banana 2 Lite
  | 'gemini-3.1-flash-image'      // Nano Banana 2
  | 'gemini-3-pro-image';         // Nano Banana Pro

export interface NanoBananaModelOption {
  id: NanoBananaModelId;
  name: string;
  badge: string;
  description: string;
  speed: string;
  recommendedFor: string;
  resolutions: string[];
}

export const NANO_BANANA_MODELS: NanoBananaModelOption[] = [
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    badge: 'Ultra Fast',
    description: 'Optimized for high-speed generation, rapid prototyping, and quick creative iterations.',
    speed: '~1.8s',
    recommendedFor: 'Fast edits, social avatars, rapid concept exploration',
    resolutions: ['512px', '1K'],
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    badge: 'Standard Pro',
    description: 'Native high-fidelity Gemini image engine with photorealistic rendering and precise semantic editing.',
    speed: '~3.2s',
    recommendedFor: 'General generative edits, background swaps, object edits, portrait retouching',
    resolutions: ['512px', '1K', '2K', '4K'],
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    badge: 'Flagship Studio',
    description: 'Flagship professional Gemini model with deep multi-reference fidelity and complex reasoning.',
    speed: '~5.5s',
    recommendedFor: 'Complex commercial workflows, multi-image composition, intricate prompt adherence',
    resolutions: ['1K', '2K', '4K'],
  },
];

export interface ReferenceImageSlot {
  id: string;
  label: string;
  file?: File;
  previewUrl?: string;
  roleHint: 'subject' | 'clothing' | 'background' | 'lighting' | 'style';
}



