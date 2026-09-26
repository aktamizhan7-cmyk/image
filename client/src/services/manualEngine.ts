import { ManualAdjustmentSettings } from '../types';

export class ManualImageProcessor {
  /**
   * Generates hardware-accelerated CSS filter for instant 60fps preview
   */
  public static getCssFilter(settings: ManualAdjustmentSettings): string {
    const brightness = 1 + (settings.brightness / 100) * 0.8 + (settings.exposure / 100) * 0.5;
    const contrast = 1 + (settings.contrast / 100) * 0.8;
    const saturate = 1 + (settings.saturation / 100) * 0.9;
    const blur = (settings.blur / 100) * 10;
    
    // Temperature & tint approximated via sepia & hue-rotate
    let sepia = Math.max(0, settings.temperature / 200);
    let hueRotate = settings.tint * 0.9;

    // Golden skin warmth in CSS filter if skinToneMode or melaninWarmth is active
    if ((settings.skinToneMode && settings.skinToneMode !== 'none') || (settings.melaninWarmth || 0) > 0) {
      const extraWarmth = ((settings.melaninWarmth || 40) / 100) * 0.16;
      sepia = Math.min(0.45, sepia + extraWarmth);
      hueRotate -= 3.5; // shift slightly towards warm golden-amber spectrum
    }

    return `brightness(${Math.max(0.1, brightness)}) contrast(${Math.max(0.1, contrast)}) saturate(${Math.max(0, saturate)}) blur(${blur}px) sepia(${sepia}) hue-rotate(${hueRotate}deg)`;
  }


  /**
   * Applies full precision pixel-level adjustments to an ImageData buffer or HTMLCanvasElement
   */
  public static applyAdjustments(
    source: HTMLImageElement | HTMLCanvasElement,
    settings: ManualAdjustmentSettings,
    targetCanvas?: HTMLCanvasElement
  ): HTMLCanvasElement {
    const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;

    // Draw base source
    ctx.drawImage(source, 0, 0, width, height);

    // If all default, return immediately
    const isDefault = Object.values(settings).every((v) => v === 0);
    if (isDefault) return canvas;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // Precalculate factors
    const brightFactor = (settings.brightness / 100) * 60;
    const expFactor = Math.pow(2, settings.exposure / 50);
    const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
    const satFactor = (settings.saturation + 100) / 100;
    const tempK = settings.temperature; // -100 (cool/blue) to 100 (warm/amber)
    const tintM = settings.tint; // -100 (green) to 100 (magenta)
    const highlightFactor = settings.highlights / 100;
    const shadowFactor = settings.shadows / 100;
    const skinMode = settings.skinToneMode || (settings.melaninWarmth ? 'wheatish_golden' : 'none');
    const warmthFactor = (settings.melaninWarmth ?? (skinMode !== 'none' ? 45 : 0)) / 100;
    const antiAshFactor = (settings.antiAshiness ?? (skinMode !== 'none' ? 50 : 0)) / 100;


    // Pixel color transformations
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Exposure
      if (settings.exposure !== 0) {
        r *= expFactor;
        g *= expFactor;
        b *= expFactor;
      }

      // 2. Brightness
      if (settings.brightness !== 0) {
        r += brightFactor;
        g += brightFactor;
        b += brightFactor;
      }

      // 3. Contrast
      if (settings.contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }

      // Calculate luminance for highlights / shadows
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 4. Highlights (affects bright areas lum > 128)
      if (settings.highlights !== 0 && lum > 128) {
        const hWeight = (lum - 128) / 127;
        const boost = highlightFactor * 40 * hWeight;
        r += boost;
        g += boost;
        b += boost;
      }

      // 5. Shadows (affects dark areas lum < 128)
      if (settings.shadows !== 0 && lum < 128) {
        const sWeight = (128 - lum) / 128;
        const boost = shadowFactor * 40 * sWeight;
        r += boost;
        g += boost;
        b += boost;
      }

      // 6. Temperature (Warm = boost Red, reduce Blue; Cool = boost Blue, reduce Red)
      if (tempK !== 0) {
        r += tempK * 0.4;
        b -= tempK * 0.4;
      }

      // 7. Tint (Magenta = boost Red/Blue, reduce Green; Green = boost Green)
      if (tintM !== 0) {
        g -= tintM * 0.35;
        r += tintM * 0.15;
        b += tintM * 0.15;
      }

      // 8. Saturation
      if (settings.saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + satFactor * (r - gray);
        g = gray + satFactor * (g - gray);
        b = gray + satFactor * (b - gray);
      }

      // 8.5 South Asian & Indian Melanin Protection & Skin Tone Optimization
      if (skinMode !== 'none') {
        if (r > 40 && g > 25 && b > 15) {
          const diffRG = r - g;
          const diffRB = r - b;
          const pLum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (diffRG >= 5 && diffRB >= 10 && pLum >= 35 && pLum <= 240) {
            const conf = Math.min(1, Math.max(0, (diffRG - 3) / 15)) * Math.min(1, Math.max(0, (diffRB - 6) / 20));
            if (conf > 0.05) {
              if (skinMode === 'wheatish_golden') {
                r = Math.min(255, r + warmthFactor * 22 * conf);
                g = Math.min(255, g + warmthFactor * 12 * conf);
                b = Math.max(0, b - antiAshFactor * 14 * conf);
                if (pLum > 185) {
                  const comp = (pLum - 185) * 0.45 * conf;
                  r -= comp * 0.4;
                  g -= comp * 0.7;
                  b -= comp * 1.0;
                }
              } else if (skinMode === 'dusky_bronze') {
                if (pLum < 95) {
                  const lift = (95 - pLum) * 0.35 * conf;
                  r += lift * 1.2;
                  g += lift * 0.85;
                  b += lift * 0.4;
                }
                r = Math.min(255, r + warmthFactor * 26 * conf);
                g = Math.min(255, g + warmthFactor * 15 * conf);
                b = Math.max(0, b - antiAshFactor * 18 * conf);
                if (pLum > 175) {
                  const comp = (pLum - 175) * 0.5 * conf;
                  r -= comp * 0.4;
                  g -= comp * 0.8;
                  b -= comp * 1.1;
                }
              } else if (skinMode === 'warm_olive') {
                r = Math.min(255, r + warmthFactor * 17 * conf);
                g = Math.min(255, g + warmthFactor * 14 * conf);
                b = Math.max(0, b - antiAshFactor * 16 * conf);
              } else if (skinMode === 'anti_whitewash') {
                if (pLum > 165) {
                  const rollback = (pLum - 165) * 0.55 * conf;
                  r -= rollback * 0.3;
                  g -= rollback * 0.7;
                  b -= rollback * 1.2;
                }
                const ashyCast = Math.max(0, b - g * 0.88);
                b -= ashyCast * antiAshFactor * conf;
                r += warmthFactor * 18 * conf;
                g += warmthFactor * 9 * conf;
              }
            }
          }
        }
      }

      // Clamp values 0 - 255

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);

    // 9. Sharpness (Unsharp Mask via convolution)
    if (settings.sharpness > 0 || settings.clarity > 0) {
      this.applySharpnessAndClarity(ctx, width, height, settings.sharpness, settings.clarity);
    }

    // 10. Blur
    if (settings.blur > 0) {
      const tempBlurCanvas = document.createElement('canvas');
      tempBlurCanvas.width = width;
      tempBlurCanvas.height = height;
      const bCtx = tempBlurCanvas.getContext('2d');
      if (bCtx) {
        bCtx.filter = `blur(${(settings.blur / 100) * 12}px)`;
        bCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempBlurCanvas, 0, 0);
      }
    }

    return canvas;
  }

  /**
   * High performance sharpness & clarity filter
   */
  private static applySharpnessAndClarity(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    sharpness: number,
    clarity: number
  ): void {
    const srcData = ctx.getImageData(0, 0, w, h);
    const src = srcData.data;
    const output = ctx.createImageData(w, h);
    const dst = output.data;

    const amount = (sharpness / 100) * 1.5 + (clarity / 100) * 0.8;
    if (amount <= 0) return;

    // Fast 3x3 Laplacian edge enhancement
    // Kernel:
    // [  0, -a/4,  0 ]
    // [ -a/4, 1+a, -a/4 ]
    // [  0, -a/4,  0 ]
    const edge = amount / 4;
    const center = 1 + amount;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const up = ((y - 1) * w + x) * 4;
        const down = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            center * src[idx + c] -
            edge * (src[up + c] + src[down + c] + src[left + c] + src[right + c]);
          dst[idx + c] = Math.min(255, Math.max(0, val));
        }
        dst[idx + 3] = src[idx + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
  }

  /**
   * Renders image with adjustments and optional scale to a Blob
   */
  public static async renderToBlob(
    imageUrl: string,
    settings: ManualAdjustmentSettings,
    options: {
      format?: 'png' | 'jpeg' | 'webp';
      quality?: number;
      scaleMultiplier?: number;
    } = {}
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const scale = options.scaleMultiplier || 1;
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const adjustedCanvas = this.applyAdjustments(canvas, settings);
          const mimeType =
            options.format === 'jpeg'
              ? 'image/jpeg'
              : options.format === 'webp'
              ? 'image/webp'
              : 'image/png';
          const quality = (options.quality || 92) / 100;
          adjustedCanvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob returned null'));
            },
            mimeType,
            quality
          );
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = imageUrl;
    });
  }
}
