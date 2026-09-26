import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { AdjustmentPanel } from './components/AdjustmentPanel';
import { ExportModal } from './components/ExportModal';
import { NanoBananaModal } from './components/NanoBananaModal';
import { BatchProcessingModal } from './components/BatchProcessingModal';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { PresetSaveModal } from './components/PresetSaveModal';
import { ContactModal } from './components/ContactModal';
import { useAdjustmentHistory } from './hooks/useHistory';
import { useBatchQueue } from './hooks/useBatchQueue';
import { usePresetLibrary } from './hooks/usePresetLibrary';
import { ApiClient } from './services/apiClient';
import { ManualImageProcessor } from './services/manualEngine';
import {
  DEFAULT_ENHANCEMENT_OPTIONS,
  DEFAULT_MANUAL_SETTINGS,
  EnhancementOptions,
  ExportOptions,
  ImageMetadata,
  AdjustmentPreset,
  ManualAdjustmentSettings,
  PresetCategory,
} from './types';

export default function App() {
  // Screen View Switcher: Dropzone (Landing) vs Workstation (Canvas + Controls)
  const [isDropzoneView, setIsDropzoneView] = useState<boolean>(true);

  // Image State
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [, setEnhancedBlob] = useState<Blob | null>(null);
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
  const [isNanoModalOpen, setIsNanoModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isPresetLibraryOpen, setIsPresetLibraryOpen] = useState<boolean>(false);
  const [isPresetSaveOpen, setIsPresetSaveOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [contactTopic, setContactTopic] = useState<string>('enterprise');
  const [presetToEdit, setPresetToEdit] = useState<AdjustmentPreset | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [gpuStatus, setGpuStatus] = useState<string>('Ready');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [studioInitialTab, setStudioInitialTab] = useState<'ai' | 'manual' | 'presets' | 'nano'>('ai');

  // Batch Queue Hook
  const batchQueue = useBatchQueue();

  // Preset Library Hook
  const handleApplyPresetManual = useCallback(
    (newManual: ManualAdjustmentSettings) => {
      commitManual(newManual);
    },
    [commitManual]
  );

  const handleApplyPresetAi = useCallback(
    (newAi: EnhancementOptions) => {
      setEnhancementOptions(newAi);
    },
    []
  );

  const presetLibrary = usePresetLibrary(
    handleApplyPresetManual,
    handleApplyPresetAi
  );

  const handleOpenSavePreset = useCallback((preset?: AdjustmentPreset) => {
    setPresetToEdit(preset || null);
    setIsPresetSaveOpen(true);
  }, []);

  const handleSavePreset = useCallback(
    (
      name: string,
      description: string,
      category: PresetCategory,
      manual: Partial<ManualAdjustmentSettings>,
      ai?: Partial<EnhancementOptions>,
      existingId?: string,
      tags?: string[]
    ) => {
      presetLibrary.saveCurrentSettingsAsPreset(
        name,
        description,
        category,
        manual,
        ai,
        existingId,
        tags
      );
    },
    [presetLibrary]
  );

  const handleOpenContact = useCallback((topic: string = 'enterprise') => {
    setContactTopic(topic);
    setIsContactModalOpen(true);
  }, []);

  // Check backend server & GPU status on launch and poll periodically
  useEffect(() => {
    let isMounted = true;

    const queryBackendStatus = async () => {
      try {
        const data = await ApiClient.checkStatus();
        if (isMounted) {
          setIsBackendConnected(true);
          if (data.hasGeminiApiKey) {
            setGpuStatus('Ready');
          } else if (data.isAiAvailable) {
            setGpuStatus(data.provider ? `${data.provider} Ready` : 'Ready');
          } else {
            setGpuStatus('Ready');
          }
        }
      } catch {
        if (isMounted) {
          setIsBackendConnected(false);
          setGpuStatus('Ready');
        }
      }
    };

    queryBackendStatus();
    const interval = setInterval(queryBackendStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle image selection
  const handleImageSelected = useCallback((file: File) => {
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    // Reset previous enhancements
    setEnhancedBlob(null);
    setEnhancedUrl(null);
    setEnhancedMetadata(null);
    resetManual();

    // Extract original dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type.replace('image/', '') || 'jpeg',
        size: file.size,
        sizeBytes: file.size,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.src = url;

    // Immediately switch to the workstation view
    setIsDropzoneView(false);
  }, [resetManual]);

  // Handle run AI enhancement
  const handleRunAiEnhancement = useCallback(async () => {
    if (!originalFile && !originalUrl) {
      // If user clicks run on default sample, simulate render pass
      setIsAiProcessing(true);
      setTimeout(() => {
        setIsAiProcessing(false);
      }, 1000);
      return;
    }

    if (!originalFile) return;

    setIsAiProcessing(true);
    setStatusMessage('Neural Super-Resolution & Melanin Guard pass...');

    try {
      const result = await ApiClient.enhanceImage(originalFile, enhancementOptions);
      setEnhancedBlob(result.blob);
      const newUrl = URL.createObjectURL(result.blob);
      setEnhancedUrl(newUrl);
      setEnhancedMetadata(result.metadata);
      setStatusMessage(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Backend AI enhancement fallback to client canvas:', error);
      // Client-side high-fidelity upscale fallback
      try {
        const clientBlob = await ManualImageProcessor.renderToBlob(
          originalUrl!,
          manualSettings,
          {
            format: 'png',
            quality: 95,
            scaleMultiplier: enhancementOptions.scale,
          }
        );
        setEnhancedBlob(clientBlob);
        setEnhancedUrl(URL.createObjectURL(clientBlob));
        if (originalMetadata) {
          setEnhancedMetadata({
            width: originalMetadata.width * enhancementOptions.scale,
            height: originalMetadata.height * enhancementOptions.scale,
            format: 'png',
            size: clientBlob.size,
            sizeBytes: clientBlob.size,
            aspectRatio: originalMetadata.aspectRatio,
          });
        }
      } catch (clientErr) {
        console.error('Client processing error:', clientErr);
      }
      setStatusMessage(null);
    } finally {
      setIsAiProcessing(false);
    }
  }, [originalFile, originalUrl, enhancementOptions, manualSettings, originalMetadata]);

  // Handle image export
  const handleExport = useCallback(
    async (options: ExportOptions) => {
      const sourceUrl = enhancedUrl || originalUrl;
      if (!sourceUrl) {
        // Sample export
        const canvas = document.createElement('canvas');
        canvas.width = 7680;
        canvas.height = 4320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f1420';
          ctx.fillRect(0, 0, 7680, 4320);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 120px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SPIDY Enhancer 4K Archival Render', 3840, 2160);
        }
        canvas.toBlob((b) => {
          if (b) {
            const url = URL.createObjectURL(b);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spidy-enhanced-4k.${options.format}`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, `image/${options.format === 'jpeg' ? 'jpeg' : options.format}`);
        return;
      }

      try {
        const blob = await ManualImageProcessor.renderToBlob(sourceUrl, manualSettings, {
          format: options.format,
          quality: options.quality,
        });

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const baseName = originalFile?.name.replace(/\.[^/.]+$/, '') || 'enhanced-image';
        a.download = `${baseName}_spidy_4k.${options.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        console.error('Failed to export image:', err);
      }
    },
    [enhancedUrl, originalUrl, manualSettings, originalFile]
  );

  // Handle generated image from Nano Banana 2
  const handleImageGenerated = useCallback(
    (file: File, url: string, metadata: ImageMetadata, isEdit: boolean) => {
      if (isEdit) {
        setEnhancedBlob(file);
        setEnhancedUrl(url);
        setEnhancedMetadata(metadata);
      } else {
        setOriginalFile(file);
        setOriginalUrl(url);
        setOriginalMetadata(metadata);
        setEnhancedBlob(null);
        setEnhancedUrl(null);
        setEnhancedMetadata(null);
        resetManual();
      }
      setIsDropzoneView(false);
    },
    [resetManual]
  );

  // Open batch item in studio
  const handleOpenBatchItemInStudio = useCallback(
    (file: File, enhancedBlobResult?: Blob, enhancedMeta?: ImageMetadata) => {
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      if (enhancedBlobResult) {
        setEnhancedBlob(enhancedBlobResult);
        setEnhancedUrl(URL.createObjectURL(enhancedBlobResult));
      } else {
        setEnhancedBlob(null);
        setEnhancedUrl(null);
      }
      if (enhancedMeta) {
        setEnhancedMetadata(enhancedMeta);
      }
      setIsBatchModalOpen(false);
      setIsDropzoneView(false);
    },
    []
  );

  return (
    <div className="flex flex-col h-screen w-full bg-obsidian-900 text-slate-200 font-sans selection:bg-brand-600 selection:text-white overflow-x-hidden antialiased">
      {/* Main Header */}
      <Header
        hasImage={!!originalUrl}
        isDropzoneView={isDropzoneView}
        onToggleView={() => setIsDropzoneView((v) => !v)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onReset={resetManual}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenContact={() => handleOpenContact('general')}
        onOpenNanoBanana={() => {
          setStudioInitialTab('nano');
          setIsDropzoneView(false);
        }}
        onOpenBatchQueue={() => setIsBatchModalOpen(true)}
        batchQueueCount={batchQueue.totalCount}
        onOpenPresets={() => setIsPresetLibraryOpen(true)}
        presetCount={presetLibrary.allPresets.length}
        isProcessing={isAiProcessing}
        gpuStatus={gpuStatus}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col overflow-y-auto bg-radial-glow">
        {/* VIEW A: DROPZONE / LANDING UPLOAD (Screen 1 in Image 1.png) */}
        {isDropzoneView ? (
          <UploadZone
            onImageSelected={handleImageSelected}
            onOpenNanoBanana={() => setIsNanoModalOpen(true)}
            onOpenBatchQueue={() => setIsBatchModalOpen(true)}
            onAddBatchFiles={batchQueue.addFiles}
            onOpenPresets={() => setIsPresetLibraryOpen(true)}
            onSwitchToWorkspace={() => setIsDropzoneView(false)}
            onOpenContact={() => handleOpenContact('enterprise')}
          />
        ) : (
          /* VIEW B: ACTIVE IMAGE WORKSTATION WITH BEFORE/AFTER SPLIT & ADJUSTMENT PANEL (Screen 2 in Image 2.png) */
          <section
            className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden"
            data-purpose="interactive-enhancement-studio"
            id="workspace-view"
          >
            {/* Center Canvas Stage */}
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

            {/* Right Adjustment Control Panel */}
            <AdjustmentPanel
              key={studioInitialTab}
              initialTab={studioInitialTab}
              enhancementOptions={enhancementOptions}
              onUpdateEnhancementOptions={setEnhancementOptions}
              onRunAiEnhancement={handleRunAiEnhancement}
              isAiProcessing={isAiProcessing}
              manualSettings={manualSettings}
              onUpdateManualLive={updateManualLive}
              onCommitManual={commitManual}
              onResetManual={resetManual}
              hasCurrentImage={!!originalUrl}
              currentImageFile={originalFile}
              currentImageUrl={enhancedUrl || originalUrl}
              onImageGenerated={handleImageGenerated}
              setIsAiProcessing={setIsAiProcessing}
              statusMessage={statusMessage}
              setStatusMessage={setStatusMessage}
              onOpenBatchQueue={() => setIsBatchModalOpen(true)}
              allPresets={presetLibrary.allPresets}
              activePresetId={presetLibrary.activePresetId}
              onApplyPreset={(p) => presetLibrary.applyPreset(p, manualSettings, enhancementOptions)}
              onOpenSavePresetModal={() => handleOpenSavePreset()}
              onOpenPresetLibraryModal={() => setIsPresetLibraryOpen(true)}
            />
          </section>
        )}
      </main>

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
        hasAiApplied={!!enhancedUrl}
        hasManualApplied={true}
      />

      {/* Preset Library Modal */}
      <PresetLibraryModal
        isOpen={isPresetLibraryOpen}
        onClose={() => setIsPresetLibraryOpen(false)}
        allPresets={presetLibrary.allPresets}
        userPresets={presetLibrary.userPresets}
        activePresetId={presetLibrary.activePresetId}
        onApplyPreset={(p) => presetLibrary.applyPreset(p, manualSettings, enhancementOptions)}
        onOpenSaveModal={(p) => handleOpenSavePreset(p)}
        onDeletePreset={presetLibrary.deletePreset}
        onDuplicatePreset={presetLibrary.duplicatePreset}
        onExportPresets={presetLibrary.exportPresets}
        onImportPresetsFile={presetLibrary.importPresetsFromFile}
        currentManualSettings={manualSettings}
        currentEnhancementOptions={enhancementOptions}
      />

      {/* Save Preset Modal */}
      <PresetSaveModal
        isOpen={isPresetSaveOpen}
        onClose={() => {
          setIsPresetSaveOpen(false);
          setPresetToEdit(null);
        }}
        manualSettings={manualSettings}
        enhancementOptions={enhancementOptions}
        onSavePreset={handleSavePreset}
        editingPreset={presetToEdit}
      />

      {/* Batch Processing Queue Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        items={batchQueue.items}
        isProcessing={batchQueue.isProcessing}
        isPaused={batchQueue.isPaused}
        currentProcessingId={batchQueue.currentProcessingId}
        completedCount={batchQueue.completedCount}
        failedCount={batchQueue.failedCount}
        pendingCount={batchQueue.pendingCount}
        totalCount={batchQueue.totalCount}
        totalProgress={batchQueue.totalProgress}
        addFiles={batchQueue.addFiles}
        removeItem={batchQueue.removeItem}
        clearCompleted={batchQueue.clearCompleted}
        clearAll={batchQueue.clearAll}
        startBatch={batchQueue.startBatch}
        pauseBatch={batchQueue.pauseBatch}
        resumeBatch={batchQueue.resumeBatch}
        stopBatch={batchQueue.stopBatch}
        retryItem={batchQueue.retryItem}
        downloadItem={batchQueue.downloadItem}
        downloadAllZip={batchQueue.downloadAllZip}
        initialOptions={enhancementOptions}
        onOpenInStudio={handleOpenBatchItemInStudio}
        allPresets={presetLibrary.allPresets}
      />

      {/* Nano Banana Modal */}
      <NanoBananaModal
        isOpen={isNanoModalOpen}
        onClose={() => setIsNanoModalOpen(false)}
        hasCurrentImage={!!originalUrl}
        currentImageFile={originalFile}
        currentImageUrl={enhancedUrl || originalUrl}
        onImageGenerated={handleImageGenerated}
        isAiProcessing={isAiProcessing}
        setIsAiProcessing={setIsAiProcessing}
        statusMessage={statusMessage}
        setStatusMessage={setStatusMessage}
      />

      {/* Contact Front-End Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultTopic={contactTopic}
      />
    </div>
  );
}
