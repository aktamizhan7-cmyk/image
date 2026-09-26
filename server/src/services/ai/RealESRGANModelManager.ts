import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import sharp from 'sharp';

export interface ProcessTaskOptions {
  inputPath: string;
  outputPath: string;
  scale?: 2 | 3 | 4;
  modelName?: string;
  tileSize?: number;
  gpuId?: number; // 0 for AMD GPU, -1 for CPU
  timeoutMs?: number;
}

export class RealESRGANModelManager {
  private static instance: RealESRGANModelManager;
  private binPath: string;
  private modelsDir: string;
  private isBusy = false;
  private queue: Array<() => Promise<void>> = [];

  private constructor() {
    // Resolve absolute path to bin directory with env override support
    const serverRoot = process.cwd();
    const customBin = process.env.REAL_ESRGAN_EXECUTABLE_PATH;
    const customModels = process.env.REAL_ESRGAN_MODELS_DIR;

    this.binPath = customBin
      ? path.isAbsolute(customBin)
        ? customBin
        : path.resolve(serverRoot, customBin)
      : path.resolve(serverRoot, 'bin', 'realesrgan-ncnn-vulkan.exe');

    this.modelsDir = customModels
      ? path.isAbsolute(customModels)
        ? customModels
        : path.resolve(serverRoot, customModels)
      : path.resolve(serverRoot, 'bin', 'models');
  }


  public static getInstance(): RealESRGANModelManager {
    if (!RealESRGANModelManager.instance) {
      RealESRGANModelManager.instance = new RealESRGANModelManager();
    }
    return RealESRGANModelManager.instance;
  }

  public getAvailableModel(preferred = 'realesrgan-x4plus'): string {
    const preferredBin = path.join(this.modelsDir, `${preferred}.bin`);
    if (existsSync(preferredBin)) return preferred;

    const candidates = [
      'realesrgan-x4plus-anime',
      'realesr-animevideov3-x4',
      'realesr-animevideov3-x2',
      'realesr-animevideov3-x3',
      'realesrgan-x4plus',
    ];
    for (const cand of candidates) {
      if (existsSync(path.join(this.modelsDir, `${cand}.bin`))) {
        return cand;
      }
    }
    return preferred;
  }

  public async isAvailable(): Promise<boolean> {
    if (!existsSync(this.binPath)) {
      return false;
    }
    const candidates = [
      'realesrgan-x4plus.bin',
      'realesrgan-x4plus-anime.bin',
      'realesr-animevideov3-x4.bin',
      'realesr-animevideov3-x2.bin',
    ];
    return candidates.some((c) => existsSync(path.join(this.modelsDir, c)));
  }

  /**
   * Enqueues an execution task to safely manage GPU VRAM and process sequentially
   */
  public async execute(options: ProcessTaskOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          await this.runProcess(options);
          resolve();
        } catch (err) {
          // If GPU failed, attempt fallback to CPU once
          if (options.gpuId !== -1 && String(err).includes('vkQueueSubmit') || String(err).includes('vulkan')) {
            console.warn('[RealESRGAN] GPU error encountered, falling back to multi-core CPU mode...');
            try {
              await this.runProcess({ ...options, gpuId: -1 });
              resolve();
              return;
            } catch (cpuErr) {
              reject(cpuErr);
              return;
            }
          }
          reject(err);
        }
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isBusy || this.queue.length === 0) return;
    this.isBusy = true;
    const nextTask = this.queue.shift();
    if (nextTask) {
      try {
        await nextTask();
      } catch (err) {
        console.error('[RealESRGANModelManager] Error processing task:', err);
      } finally {
        this.isBusy = false;
        this.processQueue();
      }
    }
  }

  private async runProcess(options: ProcessTaskOptions): Promise<void> {
    const {
      inputPath,
      outputPath,
      scale = 4,
      modelName = 'realesrgan-x4plus',
      gpuId = 0, // default auto/GPU
      timeoutMs = 180000,
    } = options;

    if (!existsSync(this.binPath)) {
      throw new Error(`Real-ESRGAN binary not found at ${this.binPath}`);
    }

    // Auto-calculate optimal tile size based on image dimensions to avoid VRAM overflow
    // On integrated AMD Radeon Graphics (512MB VRAM), 128-160 provides optimal throughput without stalls
    let tileSize = options.tileSize;
    if (tileSize === undefined || tileSize === 0) {
      try {
        const meta = await sharp(inputPath).metadata();
        const maxDim = Math.max(meta.width || 0, meta.height || 0);
        if (maxDim > 1200) {
          tileSize = 128; // safe low-VRAM tiling for larger resolutions
        } else {
          tileSize = 160; // fast balanced tiling
        }
      } catch {
        tileSize = 160;
      }
    }

    let resolvedModel = this.getAvailableModel(modelName);
    if (resolvedModel.startsWith('realesr-animevideov3')) {
      const scaleModel = `realesr-animevideov3-x${scale}`;
      if (existsSync(path.join(this.modelsDir, `${scaleModel}.bin`))) {
        resolvedModel = scaleModel;
      }
    }

    const safeGpuId = Math.max(0, gpuId);

    const args = [
      '-i', inputPath,
      '-o', outputPath,
      '-s', scale.toString(),
      '-n', resolvedModel,
      '-m', this.modelsDir,
      '-t', tileSize.toString(),
      '-g', safeGpuId.toString(),
      '-f', 'png',
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(this.binPath, args);
      let stderr = '';
      let timer: NodeJS.Timeout;

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error(`Real-ESRGAN processing timed out after ${timeoutMs / 1000}s`));
        }, timeoutMs);
      }

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('close', (code) => {
        if (timer) clearTimeout(timer);
        if (code === 0 && existsSync(outputPath)) {
          resolve();
        } else {
          reject(new Error(`Real-ESRGAN failed with code ${code}: ${stderr.trim()}`));
        }
      });

      child.on('error', (err) => {
        if (timer) clearTimeout(timer);
        reject(err);
      });
    });
  }
}
