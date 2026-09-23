import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { AdjustmentPanel } from './components/AdjustmentPanel';
import { ExportModal } from './components/ExportModal';
import { useAdjustmentHistory } from './hooks/useHistory';
import { ApiClient } from './services/apiClient';
import { ManualImageProcessor } from './services/manualEngine';
import {
  DEFAULT_ENHANCEMENT_OPTIONS,
  DEFAULT_MANUAL_SETTINGS,
  EnhancementOptions,
  ExportOptions,
  ImageMetadata,
} from './types';

export default function App() {
  // Image State
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);

  const [originalMetadata, setOriginalMetadata] = useState<ImageMetadata | null>(null);
  const [enhancedMetadata, setEnhancedMetadata] = useState<ImageMetadata | null>(null);

  // Enhancement & Adjustment states
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOptions>(
    DEFAULT_ENHANCEMENT_OPTIONS
  );
  const {
    settings: manualSettings,
    updateLive: updateManualLive,
    commit: commitManual,
    undo,
    redo,
    reset: resetManual,
    canUndo,
    canRedo,
  } = useAdjustmentHistory(DEFAULT_MANUAL_SETTINGS);

  // Status & UI States
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [gpuStatus, setGpuStatus] = useState<string>('Vulkan GPU Active');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check backend server & GPU status on launch and poll periodically
  useEffect(() => {
    let isMounted = true;

    const queryBackendStatus = async () => {
      try {
        const data = await ApiClient.checkStatus();
        if (isMounted) {
          if (data.isAiAvailable) {
            setGpuStatus(data.provider ? `${data.provider} Ready` : 'Real-ESRGAN Vulkan Ready');
          } else {
            setGpuStatus('CPU Mode Ready');
          }
        }
      } catch {
        if (isMounted) {
          setGpuStatus('Offline / Reconnecting');
        }
      }
    };

    queryBackendStatus();
    const interval = setInterval(queryBackendStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);


  // Handle image upload
  const handleImageSelected = useCallback(async (file: File) => {
    // Revoke previous object URLs to prevent memory leaks
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);

    setOriginalFile(file);
    const newUrl = URL.createObjectURL(file);
    setOriginalUrl(newUrl);
    setEnhancedBlob(null);
    setEnhancedUrl(null);
    setEnhancedMetadata(null);
    resetManual();

    try {
      const meta = await ApiClient.analyzeImage(file);
      setOriginalMetadata(meta);
    } catch {
      // Create local image metadata if server analysis times out
      const img = new Image();
      img.src = newUrl;
      img.onload = () => {
        setOriginalMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: file.type.split('/')[1] || 'png',
          size: file.size,
          aspectRatio: Number((img.naturalWidth / img.naturalHeight).toFixed(2)),
        });
      };
    }
  }, [originalUrl, enhancedUrl, resetManual]);

  // Run AI Enhancement
  const handleRunAiEnhancement = useCallback(async () => {
    if (!originalFile) return;

    setIsAiProcessing(true);
    setStatusMessage('Neural processing in progress...');

    try {
      const result = await ApiClient.enhanceImage(originalFile, enhancementOptions);

      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);

      const newEnhancedUrl = URL.createObjectURL(result.blob);
      setEnhancedBlob(result.blob);
      setEnhancedUrl(newEnhancedUrl);
      setEnhancedMetadata(result.metadata);
      setStatusMessage(`Enhanced in ${(result.processingTimeMs / 1000).toFixed(1)}s`);
    } catch (err: any) {
      alert(`AI Enhancement failed: ${err.message || err}`);
    } finally {
      setIsAiProcessing(false);
    }
  }, [originalFile, enhancementOptions, enhancedUrl]);

  // Export processed image
  const handleExport = async (options: ExportOptions) => {
    // Source is enhancedBlob if available, otherwise originalFile
    const sourceBlob = enhancedBlob || originalFile;
    if (!sourceBlob) return;

    try {
      // Perform server-side high precision Sharp export
      const resultBlob = await ApiClient.exportProcessedImage(sourceBlob, manualSettings, options);

      // Trigger browser download
      const ext = options.format === 'jpeg' ? 'jpg' : options.format;
      const downloadUrl = URL.createObjectURL(resultBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `lumina_enhanced_${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.warn('Server export failed, falling back to client-side canvas export:', err);

      // Client-side canvas export fallback
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = enhancedUrl || originalUrl!;
      await new Promise((res) => (img.onload = res));

      const processedCanvas = ManualImageProcessor.applyAdjustments(img, manualSettings);
      const mime = options.format === 'jpeg' ? 'image/jpeg' : `image/${options.format}`;
      const ext = options.format === 'jpeg' ? 'jpg' : options.format;

      processedCanvas.toBlob(
        (blob) => {
          if (!blob) return;
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `lumina_enhanced_${Date.now()}.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        },
        mime,
        options.quality / 100
      );
    }
  };

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Export), Ctrl+O (New)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (originalUrl) {
          e.preventDefault();
          setIsExportModalOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsExportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, originalUrl]);

  const hasManualApplied = Object.entries(manualSettings).some(([k, v]) => {
    if (k === 'skinToneMode') return v !== 'none' && v !== undefined;
    return typeof v === 'number' && v !== 0;
  });


  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-950 text-slate-100 select-none">
      {/* Header */}
      <Header
        hasImage={!!originalUrl}
        canUndo={canUndo}
        canRedo={canRedo}
        onNewImage={() => {
          if (originalUrl && confirm('Open a new image? Current unsaved work will be cleared.')) {
            setOriginalFile(null);
            setOriginalUrl(null);
            setEnhancedBlob(null);
            setEnhancedUrl(null);
            resetManual();
          }
        }}
        onUndo={undo}
        onRedo={redo}
        onReset={resetManual}
        onOpenExport={() => setIsExportModalOpen(true)}
        isProcessing={isAiProcessing}
        gpuStatus={gpuStatus}
        statusMessage={statusMessage}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {originalUrl ? (
          <>
            {/* Center: Before / After Comparison Slider */}
            <BeforeAfterSlider
              originalUrl={originalUrl}
              enhancedUrl={enhancedUrl}
              manualSettings={manualSettings}
              originalDimensions={
                originalMetadata
                  ? { width: originalMetadata.width, height: originalMetadata.height }
                  : undefined
              }
              enhancedDimensions={
                enhancedMetadata
                  ? { width: enhancedMetadata.width, height: enhancedMetadata.height }
                  : undefined
              }
              isProcessing={isAiProcessing}
            />

            {/* Right: AI & Manual Adjustment Panels */}
            <AdjustmentPanel
              enhancementOptions={enhancementOptions}
              onUpdateEnhancementOptions={setEnhancementOptions}
              onRunAiEnhancement={handleRunAiEnhancement}
              isAiProcessing={isAiProcessing}
              manualSettings={manualSettings}
              onUpdateManualLive={updateManualLive}
              onCommitManual={commitManual}
              onResetManual={resetManual}
            />
          </>
        ) : (
          /* Empty state: Upload Zone */
          <UploadZone onImageSelected={handleImageSelected} />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        originalDimensions={
          originalMetadata
            ? { width: originalMetadata.width, height: originalMetadata.height }
            : undefined
        }
        enhancedDimensions={
          enhancedMetadata
            ? { width: enhancedMetadata.width, height: enhancedMetadata.height }
            : undefined
        }
        hasAiApplied={!!enhancedBlob}
        hasManualApplied={hasManualApplied}
      />
    </div>
  );
}
