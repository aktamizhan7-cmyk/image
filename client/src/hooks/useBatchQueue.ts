import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { BatchQueueItem, EnhancementOptions, ImageMetadata } from '../types';
import { ApiClient } from '../services/apiClient';

export function useBatchQueue() {
  const [items, setItems] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);

  // Use refs to access current state inside async loops and cancellation triggers
  const itemsRef = useRef<BatchQueueItem[]>([]);
  itemsRef.current = items;

  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const cancelRequestedRef = useRef<boolean>(false);

  // Add one or more files to the queue
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImageFiles = fileArray.filter((f) => f.type.startsWith('image/'));

    const newItems: BatchQueueItem[] = validImageFiles.map((file) => {
      const id = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        previewUrl,
        status: 'pending',
        progress: 0,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Remove a specific item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.enhancedUrl) URL.revokeObjectURL(target.enhancedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // Clear completed items
  const clearCompleted = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => {
        if (item.status === 'completed' || item.status === 'failed') {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          if (item.enhancedUrl) URL.revokeObjectURL(item.enhancedUrl);
        }
      });
      return prev.filter((item) => item.status !== 'completed' && item.status !== 'failed');
    });
  }, []);

  // Clear all items (except currently processing)
  const clearAll = useCallback(() => {
    if (isProcessing) {
      cancelRequestedRef.current = true;
    }
    itemsRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.enhancedUrl) URL.revokeObjectURL(item.enhancedUrl);
    });
    setItems([]);
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentProcessingId(null);
  }, [isProcessing]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.enhancedUrl) URL.revokeObjectURL(item.enhancedUrl);
      });
    };
  }, []);

  // Process a single item
  const processSingleItem = async (
    item: BatchQueueItem,
    options: EnhancementOptions
  ): Promise<{ success: boolean; blob?: Blob; url?: string; meta?: ImageMetadata; timeMs?: number; error?: string }> => {
    try {
      const result = await ApiClient.enhanceImage(item.file, options);
      const enhancedUrl = URL.createObjectURL(result.blob);
      return {
        success: true,
        blob: result.blob,
        url: enhancedUrl,
        meta: result.metadata,
        timeMs: result.processingTimeMs,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Enhancement failed',
      };
    }
  };

  // Main sequential runner
  const startBatch = useCallback(
    async (options: EnhancementOptions) => {
      if (isProcessing) return;

      cancelRequestedRef.current = false;
      setIsProcessing(true);
      setIsPaused(false);

      const queueSnapshot = [...itemsRef.current];

      for (let i = 0; i < queueSnapshot.length; i++) {
        // Check if user requested cancellation
        if (cancelRequestedRef.current) {
          break;
        }

        // Handle pause: wait in a polling loop until unpaused or cancelled
        while (isPausedRef.current && !cancelRequestedRef.current) {
          await new Promise((r) => setTimeout(r, 200));
        }

        if (cancelRequestedRef.current) {
          break;
        }

        const currentItem = itemsRef.current[i];
        if (!currentItem || currentItem.status === 'completed') {
          continue;
        }

        setCurrentProcessingId(currentItem.id);

        // Mark as processing
        setItems((prev) =>
          prev.map((it) => (it.id === currentItem.id ? { ...it, status: 'processing', progress: 30 } : it))
        );

        // Execute sequential enhancement
        const outcome = await processSingleItem(currentItem, options);

        if (cancelRequestedRef.current) {
          // If cancelled during execution, mark remaining as pending or cancelled
          setItems((prev) =>
            prev.map((it) => (it.id === currentItem.id ? { ...it, status: 'cancelled', progress: 0 } : it))
          );
          break;
        }

        if (outcome.success && outcome.blob && outcome.url) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === currentItem.id
                ? {
                    ...it,
                    status: 'completed',
                    progress: 100,
                    enhancedBlob: outcome.blob,
                    enhancedUrl: outcome.url,
                    enhancedMeta: outcome.meta,
                    processingTimeMs: outcome.timeMs,
                  }
                : it
            )
          );
        } else {
          setItems((prev) =>
            prev.map((it) =>
              it.id === currentItem.id
                ? {
                    ...it,
                    status: 'failed',
                    progress: 0,
                    error: outcome.error || 'Enhancement failed',
                  }
                : it
            )
          );
        }
      }

      setIsProcessing(false);
      setIsPaused(false);
      setCurrentProcessingId(null);
    },
    [isProcessing]
  );

  const pauseBatch = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeBatch = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopBatch = useCallback(() => {
    cancelRequestedRef.current = true;
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentProcessingId(null);
  }, []);

  // Retry a failed or single item
  const retryItem = useCallback(
    async (id: string, options: EnhancementOptions) => {
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item) return;

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: 'processing', progress: 35, error: undefined } : it))
      );

      const outcome = await processSingleItem(item, options);

      if (outcome.success && outcome.blob && outcome.url) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: 'completed',
                  progress: 100,
                  enhancedBlob: outcome.blob,
                  enhancedUrl: outcome.url,
                  enhancedMeta: outcome.meta,
                  processingTimeMs: outcome.timeMs,
                }
              : it
          )
        );
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: 'failed',
                  progress: 0,
                  error: outcome.error || 'Retry failed',
                }
              : it
          )
        );
      }
    },
    []
  );

  // Download a single finished item
  const downloadItem = useCallback((id: string) => {
    const item = itemsRef.current.find((it) => it.id === id);
    if (!item || !item.enhancedUrl) return;

    const link = document.createElement('a');
    link.href = item.enhancedUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    link.download = `enhanced_${baseName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Download all completed items in a single zip archive
  const downloadAllZip = useCallback(async (): Promise<void> => {
    const completed = itemsRef.current.filter((it) => it.status === 'completed' && it.enhancedBlob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    completed.forEach((it, index) => {
      if (it.enhancedBlob) {
        const baseName = it.name.replace(/\.[^/.]+$/, '');
        const filename = `${String(index + 1).padStart(2, '0')}_${baseName}_enhanced.png`;
        zip.file(filename, it.enhancedBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `lumina_enhanced_batch_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  }, []);

  // Computed metrics
  const completedCount = items.filter((it) => it.status === 'completed').length;
  const failedCount = items.filter((it) => it.status === 'failed').length;
  const pendingCount = items.filter((it) => it.status === 'pending').length;
  const totalCount = items.length;

  const totalProgress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    items,
    isProcessing,
    isPaused,
    currentProcessingId,
    completedCount,
    failedCount,
    pendingCount,
    totalCount,
    totalProgress,
    addFiles,
    removeItem,
    clearCompleted,
    clearAll,
    startBatch,
    pauseBatch,
    resumeBatch,
    stopBatch,
    retryItem,
    downloadItem,
    downloadAllZip,
  };
}
