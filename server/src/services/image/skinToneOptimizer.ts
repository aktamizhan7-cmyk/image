import sharp from 'sharp';
import { SkinToneMode } from '../../types/index.js';

export interface SkinToneOptimizationOptions {
  skinToneMode?: SkinToneMode;
  melaninWarmth?: number; // 0 to 100
  antiAshiness?: number; // 0 to 100
}

export class SkinToneOptimizer {
  /**
   * Applies melanin-aware tone mapping and anti-ashiness protection specifically tailored
   * for South Asian and Indian skin tones (Fitzpatrick skin types III - VI).
   *
   * Solves:
   * 1. Bleaching / Whitewashing caused by generic AI super-resolution models
   * 2. Ashy / greyish desaturation in warm midtones
   * 3. Blown-out highlights on forehead/cheekbones
   * 4. Crushed shadows in dusky/deep bronze skin
   */
  public static async optimize(
    pipeline: sharp.Sharp,
    options: SkinToneOptimizationOptions = {}
  ): Promise<sharp.Sharp> {
    const mode = options.skinToneMode || 'wheatish_golden';
    if (mode === 'none') {
      return pipeline;
    }

    const warmth = (options.melaninWarmth ?? 45) / 100;
    const antiAshiness = (options.antiAshiness ?? 50) / 100;

    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const len = data.length;

    for (let i = 0; i < len; i += channels) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Detect skin / melanin range in South Asian portraits
      if (r > 40 && g > 25 && b > 15) {
        const diffRG = r - g;
        const diffRB = r - b;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Warm melanin spectral criteria: R > G and R > B
        if (diffRG >= 5 && diffRB >= 10 && lum >= 35 && lum <= 240) {
          const rgConf = Math.min(1, Math.max(0, (diffRG - 3) / 15));
          const rbConf = Math.min(1, Math.max(0, (diffRB - 6) / 20));
          const conf = rgConf * rbConf;

          if (conf > 0.05) {
            if (mode === 'wheatish_golden') {
              // 1. Wheatish & Golden Glow:
              // Restores radiant amber-gold carotene undertones, softens specular highlights
              const rBoost = warmth * 22 * conf;
              const gBoost = warmth * 12 * conf;
              const bCurb = antiAshiness * 14 * conf;

              r = Math.min(255, r + rBoost);
              g = Math.min(255, g + gBoost);
              b = Math.max(0, b - bCurb);

              // Highlight compression for facial peaks (forehead, nose tip, cheekbones)
              if (lum > 185) {
                const comp = (lum - 185) * 0.45 * conf;
                r -= comp * 0.4;
                g -= comp * 0.7;
                b -= comp * 1.0;
              }
            } else if (mode === 'dusky_bronze') {
              // 2. Dusky & Deep Bronze:
              // Preserves rich melanin depth, recovers deep shadow details without grey blotches
              if (lum < 95) {
                const shadowLift = (95 - lum) * 0.35 * conf;
                r += shadowLift * 1.2;
                g += shadowLift * 0.85;
                b += shadowLift * 0.4;
              }

              const rBoost = warmth * 26 * conf;
              const gBoost = warmth * 15 * conf;
              const bCurb = antiAshiness * 18 * conf;

              r = Math.min(255, r + rBoost);
              g = Math.min(255, g + gBoost);
              b = Math.max(0, b - bCurb);

              if (lum > 175) {
                const comp = (lum - 175) * 0.5 * conf;
                r -= comp * 0.4;
                g -= comp * 0.8;
                b -= comp * 1.1;
              }
            } else if (mode === 'warm_olive') {
              // 3. Warm Olive Radiance:
              // Balances olive/golden undertone, neutralizes cool cyan/blue casts
              const rBoost = warmth * 17 * conf;
              const gBoost = warmth * 14 * conf;
              const bCurb = antiAshiness * 16 * conf;

              r = Math.min(255, r + rBoost);
              g = Math.min(255, g + gBoost);
              b = Math.max(0, b - bCurb);

              if (lum > 190) {
                const comp = (lum - 190) * 0.4 * conf;
                b -= comp * 0.9;
              }
            } else if (mode === 'anti_whitewash') {
              // 4. Anti-Whitewash Shield:
              // Counteracts aggressive AI bleaching, clamps chalky highlights and restores true pigment
              if (lum > 165) {
                const bleachRollback = (lum - 165) * 0.55 * conf;
                r -= bleachRollback * 0.3;
                g -= bleachRollback * 0.7;
                b -= bleachRollback * 1.2;
              }

              // Remove cool/grey veil (excessive B compared to G in skin)
              const ashyCast = Math.max(0, b - g * 0.88);
              b -= ashyCast * antiAshiness * conf;

              r += warmth * 18 * conf;
              g += warmth * 9 * conf;
            }

            data[i] = Math.min(255, Math.max(0, Math.round(r)));
            data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
            data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
          }
        }
      }
    }

    return sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    });
  }
}
