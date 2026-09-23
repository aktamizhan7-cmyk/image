import { EnhancementOptions, ProcessedResult } from '../../types/index.js';

export interface ImageInput {
  filePath: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

export interface ImageProcessingProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  enhance(input: ImageInput, options: EnhancementOptions): Promise<ProcessedResult>;
  upscale(input: ImageInput, scale: 2 | 4, model?: string): Promise<ProcessedResult>;
  denoise(input: ImageInput, strength: number): Promise<ProcessedResult>;
}
