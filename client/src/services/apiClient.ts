import { EnhancementOptions, ExportOptions, ImageMetadata, ManualAdjustmentSettings } from '../types';

function resolveApiBase(): string {
  const envUrl = (
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.VITE_API_URL ||
    '/api'
  ).trim();

  const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  // If provided an absolute URL like http://localhost:3001 without /api, append /api
  if (cleanUrl.startsWith('http') && !cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/api`;
  }
  return cleanUrl;
}

export const API_BASE = resolveApiBase();


export class ApiClient {
  /**
   * Analyze uploaded image metadata and statistics
   */
  public static async analyzeImage(file: File | Blob): Promise<ImageMetadata> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/images/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Image analysis failed' }));
      throw new Error(err.message || 'Image analysis failed');
    }

    const data = await response.json();
    return data.metadata;
  }

  /**
   * Enhance image using AI pipeline (Real-ESRGAN super-resolution + smart enhance)
   */
  public static async enhanceImage(
    file: File | Blob,
    options: EnhancementOptions,
    onProgress?: (msg: string) => void
  ): Promise<{ blob: Blob; metadata: ImageMetadata; processingTimeMs: number }> {
    onProgress?.('Sending image to AI processing engine...');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('options', JSON.stringify(options));

    const response = await fetch(`${API_BASE}/images/enhance`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'AI enhancement failed' }));
      throw new Error(err.details || err.error || err.message || 'AI enhancement failed');
    }

    const processingTimeMs = Number(response.headers.get('x-processing-time-ms') || 0);
    const metadataHeader = response.headers.get('x-image-metadata');
    let metadata: ImageMetadata = {
      width: 0,
      height: 0,
      format: 'png',
      size: 0,
      aspectRatio: 1,
    };

    if (metadataHeader) {
      try {
        metadata = JSON.parse(metadataHeader);
      } catch {
        // fallback
      }
    }

    const blob = await response.blob();
    return { blob, metadata, processingTimeMs };
  }

  /**
   * Fast AI Upscaling (2x or 4x)
   */
  public static async upscaleImage(
    file: File | Blob,
    scale: 2 | 4,
    model = 'realesrgan-x4plus'
  ): Promise<{ blob: Blob; metadata: ImageMetadata; processingTimeMs: number }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('scale', scale.toString());
    formData.append('model', model);

    const response = await fetch(`${API_BASE}/images/upscale`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'AI upscaling failed' }));
      throw new Error(err.details || err.error || err.message || 'AI upscaling failed');
    }

    const processingTimeMs = Number(response.headers.get('x-processing-time-ms') || 0);
    const metadataHeader = response.headers.get('x-image-metadata');
    let metadata: ImageMetadata = { width: 0, height: 0, format: 'png', size: 0, aspectRatio: 1 };
    if (metadataHeader) {
      try {
        metadata = JSON.parse(metadataHeader);
      } catch {
        // fallback
      }
    }

    const blob = await response.blob();
    return { blob, metadata, processingTimeMs };
  }

  /**
   * Server-side high fidelity export with sharp
   */
  public static async exportProcessedImage(
    file: File | Blob,
    adjustments: ManualAdjustmentSettings,
    exportOptions: ExportOptions
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('adjustments', JSON.stringify(adjustments));
    formData.append('exportOptions', JSON.stringify(exportOptions));

    const response = await fetch(`${API_BASE}/images/export`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Export failed' }));
      throw new Error(err.message || 'Export failed');
    }

    return await response.blob();
  }

  /**
   * Check backend engine and GPU status
   */
  public static async checkStatus(): Promise<{
    status: string;
    provider: string;
    isAiAvailable: boolean;
    supportedFormats: string[];
    maxFileSizeMb: number;
    maxDimension: number;
  }> {
    const response = await fetch(`${API_BASE}/images/status`);
    if (!response.ok) {
      throw new Error(`Backend status check returned ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Check backend server health endpoint
   */
  public static async checkHealth(): Promise<{ status: string; service: string }> {
    const healthUrl = API_BASE.endsWith('/api')
      ? `${API_BASE.slice(0, -4)}/api/health`
      : `${API_BASE}/health`;
    const response = await fetch(healthUrl);
    if (!response.ok) {
      throw new Error(`Health check returned ${response.status}`);
    }
    return await response.json();
  }
}

