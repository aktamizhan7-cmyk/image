import { AdjustmentPreset, ManualAdjustmentSettings, EnhancementOptions } from '../types';

const STORAGE_KEY = 'lumina_presets_v1';
let memoryStorageFallback: string | null = null;

function safeGetStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryStorageFallback;
  }
}

function safeSetStorage(val: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, val);
  } catch {
    memoryStorageFallback = val;
  }
}

export const BUILT_IN_PRESETS: AdjustmentPreset[] = [
  {
    id: 'builtin_wheatish_golden',
    name: 'Wheatish & Golden Glow',
    description: 'Specialized South Asian skin-tone preservation with rich warm amber roll-off and melanin warmth.',
    category: 'portrait',
    isBuiltIn: true,
    colorBadge: 'from-amber-500 to-orange-600',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Melanin', 'Portrait', 'Warmth', 'Indian'],
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
    enhancementOptions: {
      scale: 2,
      skinToneProtection: true,
      skinToneMode: 'wheatish_golden',
      melaninWarmth: 45,
      antiAshiness: 50,
      denoiseStrength: 25,
      sharpenStrength: 30,
    },
  },
  {
    id: 'builtin_dusky_bronze',
    name: 'Dusky & Deep Bronze',
    description: 'Deep, radiant bronze melanin preservation. Lifts shadows smoothly without ashiness or highlight clipping.',
    category: 'portrait',
    isBuiltIn: true,
    colorBadge: 'from-amber-700 to-yellow-800',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Melanin', 'Bronze', 'Deep Tone', 'Portrait'],
    manualSettings: {
      temperature: 16,
      tint: 2,
      exposure: 4,
      highlights: -18,
      shadows: 14,
      saturation: 10,
      contrast: 6,
      clarity: 10,
      melaninWarmth: 60,
      antiAshiness: 75,
      skinToneMode: 'dusky_bronze',
    },
    enhancementOptions: {
      scale: 2,
      skinToneProtection: true,
      skinToneMode: 'dusky_bronze',
      melaninWarmth: 60,
      antiAshiness: 75,
      denoiseStrength: 20,
      sharpenStrength: 35,
    },
  },
  {
    id: 'builtin_cinematic_teal_orange',
    name: 'Cinematic Teal & Orange',
    description: 'Hollywood block-buster color grading with rich warm amber skin tones against cooled teal shadows.',
    category: 'cinematic',
    isBuiltIn: true,
    colorBadge: 'from-cyan-500 to-orange-500',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Cinematic', 'Teal Orange', 'Dramatic', 'Film'],
    manualSettings: {
      exposure: -2,
      contrast: 18,
      highlights: -14,
      shadows: 10,
      saturation: 12,
      clarity: 14,
      temperature: 8,
      tint: -6,
    },
    enhancementOptions: {
      scale: 2,
      denoiseStrength: 25,
      sharpenStrength: 35,
    },
  },
  {
    id: 'builtin_ultra_res_commercial',
    name: 'Ultra-Res Commercial Studio',
    description: 'Maximum crispness, 4× super-resolution, clean clarity, and neutral micro-contrast for e-commerce or editorial.',
    category: 'custom',
    isBuiltIn: true,
    colorBadge: 'from-blue-600 to-indigo-600',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Studio', '4K', 'Commercial', 'Sharpen'],
    manualSettings: {
      exposure: 2,
      contrast: 8,
      highlights: -6,
      shadows: 4,
      saturation: 4,
      clarity: 18,
      sharpness: 24,
      temperature: 0,
      tint: 0,
    },
    enhancementOptions: {
      scale: 4,
      denoiseStrength: 15,
      sharpenStrength: 40,
    },
  },
  {
    id: 'builtin_vintage_kodachrome',
    name: 'Kodachrome 1974 Vintage',
    description: 'Nostalgic 1970s analog film warmth with gentle shadow roll-off, amber highlights, and organic vignette.',
    category: 'vintage',
    isBuiltIn: true,
    colorBadge: 'from-yellow-600 to-red-600',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Film', 'Analog', 'Retro', '70s'],
    manualSettings: {
      exposure: 0,
      contrast: 12,
      highlights: -22,
      shadows: 16,
      saturation: 20,
      temperature: 15,
      tint: 6,
      clarity: -4,
    },
    enhancementOptions: {
      scale: 2,
      denoiseStrength: 35,
      sharpenStrength: 20,
    },
  },
  {
    id: 'builtin_cyberpunk_neon',
    name: 'Cyberpunk Neon Pop',
    description: 'Electric vibrancy, deep dark blacks, amplified saturations, and ultra-punchy urban night aesthetics.',
    category: 'vibrant',
    isBuiltIn: true,
    colorBadge: 'from-pink-500 via-purple-500 to-cyan-500',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Neon', 'Cyberpunk', 'Vibrant', 'Night'],
    manualSettings: {
      contrast: 24,
      highlights: 12,
      shadows: -10,
      saturation: 38,
      clarity: 16,
      sharpness: 20,
      temperature: -8,
      tint: 14,
    },
    enhancementOptions: {
      scale: 2,
      denoiseStrength: 20,
      sharpenStrength: 35,
    },
  },
  {
    id: 'builtin_nordic_landscape',
    name: 'Nordic Mist Landscape',
    description: 'Subtle desaturation, cool Scandinavian undertones, crisp edge definition, and expanded dynamic range.',
    category: 'landscape',
    isBuiltIn: true,
    colorBadge: 'from-slate-600 to-emerald-700',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Landscape', 'Moody', 'Nature', 'Cool'],
    manualSettings: {
      exposure: -2,
      contrast: 14,
      highlights: -16,
      shadows: 12,
      saturation: -20,
      clarity: 18,
      sharpness: 22,
      temperature: -12,
      tint: -2,
    },
    enhancementOptions: {
      scale: 2,
      denoiseStrength: 25,
      sharpenStrength: 35,
    },
  },
  {
    id: 'builtin_fine_art_monochrome',
    name: 'Fine Art B&W High-Contrast',
    description: 'Pure black-and-white tonal elegance with sculpted clarity, punchy blacks, and silvery highlight luminance.',
    category: 'monochrome',
    isBuiltIn: true,
    colorBadge: 'from-zinc-900 via-neutral-500 to-slate-200',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Black & White', 'Monochrome', 'Artistic', 'Portrait'],
    manualSettings: {
      saturation: -100,
      contrast: 28,
      highlights: -10,
      shadows: 14,
      clarity: 22,
      sharpness: 18,
    },
    enhancementOptions: {
      scale: 2,
      denoiseStrength: 20,
      sharpenStrength: 30,
    },
  },
];

export class PresetLibraryService {
  /**
   * Retrieves all user-created presets from localStorage
   */
  static getUserPresets(): AdjustmentPreset[] {
    try {
      const raw = safeGetStorage();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Failed to parse user presets from storage', e);
      return [];
    }
  }

  /**
   * Retrieves all presets (built-ins + user presets)
   */
  static getAllPresets(): AdjustmentPreset[] {
    const user = this.getUserPresets();
    return [...user, ...BUILT_IN_PRESETS];
  }

  /**
   * Saves a new or existing user preset
   */
  static savePreset(
    name: string,
    description: string,
    category: AdjustmentPreset['category'],
    manualSettings: Partial<ManualAdjustmentSettings>,
    enhancementOptions?: Partial<EnhancementOptions>,
    existingId?: string,
    tags?: string[]
  ): AdjustmentPreset {
    const userPresets = this.getUserPresets();
    const now = new Date().toISOString();

    if (existingId) {
      const idx = userPresets.findIndex((p) => p.id === existingId);
      if (idx !== -1) {
        const updated: AdjustmentPreset = {
          ...userPresets[idx],
          name: name.trim(),
          description: description.trim(),
          category,
          manualSettings: { ...manualSettings },
          enhancementOptions: enhancementOptions ? { ...enhancementOptions } : undefined,
          updatedAt: now,
          tags: tags || userPresets[idx].tags,
        };
        userPresets[idx] = updated;
        safeSetStorage(JSON.stringify(userPresets));
        return updated;
      }
    }

    const newPreset: AdjustmentPreset = {
      id: `usr_preset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'My Custom Preset',
      description: description.trim() || 'Custom user configuration',
      category: category || 'custom',
      isBuiltIn: false,
      colorBadge: 'from-brand-600 to-accent-600',
      createdAt: now,
      manualSettings: { ...manualSettings },
      enhancementOptions: enhancementOptions ? { ...enhancementOptions } : undefined,
      tags: tags || ['Custom'],
    };

    userPresets.unshift(newPreset);
    safeSetStorage(JSON.stringify(userPresets));
    return newPreset;
  }

  /**
   * Deletes a user preset
   */
  static deletePreset(id: string): boolean {
    const userPresets = this.getUserPresets();
    const filtered = userPresets.filter((p) => p.id !== id);
    if (filtered.length !== userPresets.length) {
      safeSetStorage(JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  /**
   * Duplicates a preset (built-in or user) into a new custom user preset
   */
  static duplicatePreset(id: string): AdjustmentPreset | null {
    const all = this.getAllPresets();
    const source = all.find((p) => p.id === id);
    if (!source) return null;

    return this.savePreset(
      `${source.name} (Copy)`,
      source.description || '',
      'custom',
      source.manualSettings,
      source.enhancementOptions,
      undefined,
      source.tags ? [...source.tags, 'Copy'] : ['Copy']
    );
  }

  /**
   * Exports presets as downloadable JSON file
   */
  static exportPresetsToJson(presetsToExport?: AdjustmentPreset[]): void {
    const presets = presetsToExport || this.getUserPresets();
    const exportBundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      generator: 'SPIDY Enhancer Studio',
      presets,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina_presets_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /**
   * Imports presets from JSON string
   */
  static importPresetsFromJson(jsonContent: string): { importedCount: number; errors?: string } {
    try {
      const data = JSON.parse(jsonContent);
      let incomingPresets: any[] = [];

      if (Array.isArray(data)) {
        incomingPresets = data;
      } else if (data && Array.isArray(data.presets)) {
        incomingPresets = data.presets;
      } else {
        return { importedCount: 0, errors: 'Invalid preset file format' };
      }

      const validPresets: AdjustmentPreset[] = [];
      const existing = this.getUserPresets();

      for (const item of incomingPresets) {
        if (!item.name || !item.manualSettings) continue;

        const importedPreset: AdjustmentPreset = {
          id: `usr_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: String(item.name).trim(),
          description: item.description ? String(item.description).trim() : 'Imported preset',
          category: item.category || 'custom',
          isBuiltIn: false,
          colorBadge: item.colorBadge || 'from-teal-600 to-emerald-600',
          createdAt: item.createdAt || new Date().toISOString(),
          manualSettings: item.manualSettings,
          enhancementOptions: item.enhancementOptions,
          tags: Array.isArray(item.tags) ? item.tags : ['Imported'],
        };
        validPresets.push(importedPreset);
      }

      if (validPresets.length > 0) {
        const merged = [...validPresets, ...existing];
        safeSetStorage(JSON.stringify(merged));
      }

      return { importedCount: validPresets.length };
    } catch (e: any) {
      return { importedCount: 0, errors: e.message || 'Failed to read preset JSON' };
    }
  }
}
