import { ImageProcessingProvider } from './ImageProcessingProvider.js';
import { RealESRGANProvider } from '../ai/RealESRGANProvider.js';

export class ProviderRegistry {
  private static providers: Map<string, ImageProcessingProvider> = new Map();
  private static defaultProviderName = 'realesrgan';

  public static initialize(): void {
    const realEsrgan = new RealESRGANProvider();
    this.providers.set('realesrgan', realEsrgan);
  }

  public static getProvider(name?: string): ImageProcessingProvider {
    const key = name || this.defaultProviderName;
    const provider = this.providers.get(key);
    if (!provider) {
      // Fallback to first available provider
      const first = this.providers.values().next().value;
      if (!first) {
        throw new Error('No image processing providers configured.');
      }
      return first;
    }
    return provider;
  }

  public static registerProvider(name: string, provider: ImageProcessingProvider): void {
    this.providers.set(name, provider);
  }
}

// Auto-initialize
ProviderRegistry.initialize();
