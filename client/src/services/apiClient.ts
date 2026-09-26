import {
  EnhancementOptions,
  ExportOptions,
  ImageMetadata,
  ManualAdjustmentSettings,
  ContactSubmissionPayload,
  ContactTicketResponse,
  ContactTopicInfo,
  NanoBananaModelId,
} from '../types';

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
    hasGeminiApiKey?: boolean;
    nanoBananaModel?: string;
  }> {
    const response = await fetch(`${API_BASE}/images/status`);
    if (!response.ok) {
      throw new Error(`Backend status check returned ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Text-to-Image creation with Nano Banana (Gemini)
   */
  public static async generateNanoBanana(options: {
    prompt: string;
    aspectRatio?: string;
    imageSize?: string;
    model?: string;
    autoSuperResolution?: boolean;
    scale?: 2 | 4;
    skinToneProtection?: boolean;
    skinToneMode?: string;
    melaninWarmth?: number;
    antiAshiness?: number;
  }): Promise<{
    blob: Blob;
    metadata: ImageMetadata;
    processingTimeMs: number;
    description?: string;
    provider?: string;
    isSuperResolved?: boolean;
  }> {
    const response = await fetch(`${API_BASE}/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Image generation failed' }));
      throw new Error(err.details || err.error || err.message || 'Image generation failed');
    }

    const processingTimeMs = Number(response.headers.get('x-processing-time-ms') || 0);
    const provider = response.headers.get('x-provider-name') || 'Nano Banana 2';
    const isSuperResolved = response.headers.get('x-super-resolved') === 'true';
    const rawDesc = response.headers.get('x-ai-description');
    const description = rawDesc ? decodeURIComponent(rawDesc) : undefined;
    const metadataHeader = response.headers.get('x-image-metadata');
    let metadata: ImageMetadata = { width: 1024, height: 1024, format: 'png', size: 0, aspectRatio: 1 };
    if (metadataHeader) {
      try {
        metadata = JSON.parse(metadataHeader);
      } catch {}
    }

    const blob = await response.blob();
    return { blob, metadata, processingTimeMs, description, provider, isSuperResolved };
  }

  /**
   * Image-to-Image editing with Nano Banana (Gemini)
   * Supports multi-image references and chained super-resolution.
   */
  public static async editNanoBanana(
    fileOrOptions:
      | File
      | Blob
      | {
          file: File | Blob;
          prompt: string;
          model?: NanoBananaModelId | string;
          references?: Array<{ file: File | Blob; label: string }>;
          aspectRatio?: string;
          imageSize?: string;
          history?: Array<{ role: 'user' | 'assistant'; text: string }>;
          autoSuperResolution?: boolean;
          scale?: 2 | 4;
          skinToneProtection?: boolean;
          skinToneMode?: string;
          melaninWarmth?: number;
          antiAshiness?: number;
        },
    optionalPrompt?: string,
    optionalModel?: string
  ): Promise<{
    blob: Blob;
    metadata: ImageMetadata;
    processingTimeMs: number;
    description?: string;
    provider?: string;
    isSuperResolved?: boolean;
  }> {
    const formData = new FormData();

    if (fileOrOptions instanceof Blob) {
      formData.append('image', fileOrOptions);
      formData.append('prompt', optionalPrompt || '');
      if (optionalModel) formData.append('model', optionalModel);
    } else {
      const opts = fileOrOptions;
      formData.append('image', opts.file);
      formData.append('prompt', opts.prompt);
      if (opts.model) formData.append('model', opts.model);
      if (opts.aspectRatio) formData.append('aspectRatio', opts.aspectRatio);
      if (opts.imageSize) formData.append('imageSize', opts.imageSize);
      if (opts.autoSuperResolution) formData.append('autoSuperResolution', 'true');
      if (opts.scale) formData.append('scale', opts.scale.toString());
      if (opts.skinToneProtection !== undefined) {
        formData.append('skinToneProtection', opts.skinToneProtection.toString());
      }
      if (opts.skinToneMode) formData.append('skinToneMode', opts.skinToneMode);
      if (opts.melaninWarmth !== undefined) formData.append('melaninWarmth', opts.melaninWarmth.toString());
      if (opts.antiAshiness !== undefined) formData.append('antiAshiness', opts.antiAshiness.toString());
      if (opts.history) formData.append('history', JSON.stringify(opts.history));

      if (opts.references && opts.references.length > 0) {
        const refLabels: { [key: string]: string } = {};
        opts.references.forEach((ref, idx) => {
          if (idx < 3) {
            const fieldName = `ref${idx + 1}`;
            formData.append(fieldName, ref.file);
            refLabels[fieldName] = ref.label;
          }
        });
        formData.append('refLabels', JSON.stringify(refLabels));
      }
    }

    const response = await fetch(`${API_BASE}/images/ai-edit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'AI image editing failed' }));
      throw new Error(err.details || err.error || err.message || 'AI image editing failed');
    }

    const processingTimeMs = Number(response.headers.get('x-processing-time-ms') || 0);
    const provider = response.headers.get('x-provider-name') || 'Nano Banana';
    const isSuperResolved = response.headers.get('x-super-resolved') === 'true';
    const rawDesc = response.headers.get('x-ai-description');
    const description = rawDesc ? decodeURIComponent(rawDesc) : undefined;
    const metadataHeader = response.headers.get('x-image-metadata');
    let metadata: ImageMetadata = { width: 1024, height: 1024, format: 'png', size: 0, aspectRatio: 1 };
    if (metadataHeader) {
      try {
        metadata = JSON.parse(metadataHeader);
      } catch {}
    }

    const blob = await response.blob();
    return { blob, metadata, processingTimeMs, description, provider, isSuperResolved };
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

  /**
   * Submit a contact inquiry / enterprise ticket
   */
  public static async submitContact(
    payload: ContactSubmissionPayload,
    attachmentFile?: File | null
  ): Promise<{
    success: boolean;
    message: string;
    ticket: ContactTicketResponse;
  }> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    if (payload.organization) {
      formData.append('organization', payload.organization);
    }
    if (payload.priority) {
      formData.append('priority', payload.priority);
    }
    formData.append('topic', payload.topic);
    formData.append('message', payload.message);

    if (attachmentFile) {
      formData.append('attachment', attachmentFile);
    }

    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Contact submission failed' }));
      throw new Error(err.details || err.error || err.message || 'Contact submission failed');
    }

    return await response.json();
  }

  /**
   * Lookup ticket details by reference ID
   */
  public static async getContactTicket(ticketId: string): Promise<{
    ticket: ContactTicketResponse;
  }> {
    const response = await fetch(`${API_BASE}/contact/tickets/${encodeURIComponent(ticketId.trim())}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Ticket not found' }));
      throw new Error(err.message || err.details || err.error || 'Failed to lookup ticket');
    }
    return await response.json();
  }

  /**
   * Retrieve contact topics and active SLA catalog
   */
  public static async getContactTopics(): Promise<{
    topics: ContactTopicInfo[];
    teamStatus: {
      isOnline: boolean;
      activeEngineers: number;
      averageResponseMinutes: number;
      officialSupportEmail: string;
      officeHoursUtc: string;
    };
  }> {
    const response = await fetch(`${API_BASE}/contact/topics`);
    if (!response.ok) {
      throw new Error(`Failed to load contact topics: ${response.status}`);
    }
    return await response.json();
  }
}

