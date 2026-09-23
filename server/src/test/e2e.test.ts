import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { RealESRGANProvider } from '../services/ai/RealESRGANProvider.js';
import { ImageAnalyzer } from '../services/image/imageAnalyzer.js';
import { ManualImageProcessor } from '../services/image/manualImageProcessor.js';

describe('AI + Manual Image Enhancer Pipeline Tests', () => {
  const testDir = path.resolve(__dirname, '../../test_tmp');
  const sampleImagePath = path.join(testDir, 'sample_test.jpg');

  before(async () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Generate a clean test image with sharp
    await sharp({
      create: {
        width: 320,
        height: 240,
        channels: 3,
        background: { r: 120, g: 60, b: 200 },
      },
    })
      .jpeg()
      .toFile(sampleImagePath);
  });

  after(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('ImageAnalyzer should correctly analyze test image', async () => {
    const report = await ImageAnalyzer.analyze(sampleImagePath);
    assert.strictEqual(report.metadata.width, 320);
    assert.strictEqual(report.metadata.height, 240);
    assert.strictEqual(report.metadata.format, 'jpeg');
    assert.strictEqual(report.aspectRatioLabel, '4:3 Standard');
  });

  it('RealESRGANProvider is available and ready', async () => {
    const provider = new RealESRGANProvider();
    const available = await provider.isAvailable();
    assert.strictEqual(available, true);
  });

  async function safeUnlink(filePath: string) {
    for (let i = 0; i < 3; i++) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  }

  it('RealESRGANProvider upscales image 2x', async () => {
    const provider = new RealESRGANProvider();
    const result = await provider.upscale({ filePath: sampleImagePath }, 2);
    assert.strictEqual(result.metadata.width, 640);
    assert.strictEqual(result.metadata.height, 480);
    assert.ok(fs.existsSync(result.outputPath));
    await safeUnlink(result.outputPath);
  });

  it('RealESRGANProvider enhances image with smart sharpen and lighting', async () => {
    const provider = new RealESRGANProvider();
    const result = await provider.enhance(
      { filePath: sampleImagePath },
      {
        scale: 2,
        denoiseStrength: 30,
        sharpenStrength: 25,
        lightingCorrection: true,
        colorCorrection: true,
      }
    );
    assert.strictEqual(result.metadata.width, 640);
    assert.strictEqual(result.metadata.height, 480);
    assert.ok(fs.existsSync(result.outputPath));
    await safeUnlink(result.outputPath);
  });

  it('ManualImageProcessor processes and exports to WebP and JPEG', async () => {
    const adjustments = {
      brightness: 10,
      contrast: 15,
      exposure: 5,
      highlights: 10,
      shadows: -5,
      saturation: 20,
      temperature: 15,
      tint: -5,
      sharpness: 30,
      clarity: 20,
      noiseReduction: 10,
      blur: 0,
    };

    // Test WebP Export
    const webpResult = await ManualImageProcessor.processAndExport(sampleImagePath, adjustments, {
      format: 'webp',
      quality: 90,
    });
    assert.strictEqual(webpResult.metadata.format, 'webp');
    assert.ok(fs.existsSync(webpResult.outputPath));
    await safeUnlink(webpResult.outputPath);

    // Test JPEG Export
    const jpegResult = await ManualImageProcessor.processAndExport(sampleImagePath, adjustments, {
      format: 'jpeg',
      quality: 85,
    });
    assert.strictEqual(jpegResult.metadata.format, 'jpeg');
    assert.ok(fs.existsSync(jpegResult.outputPath));
    await safeUnlink(jpegResult.outputPath);
  });
});
