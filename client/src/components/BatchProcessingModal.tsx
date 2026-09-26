import React, { useState, useRef } from 'react';
import {
  Layers,
  X,
  Play,
  Pause,
  Square,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  Image as ImageIcon,
  Bookmark,
} from 'lucide-react';
import { BatchQueueItem, EnhancementOptions, ImageMetadata, AdjustmentPreset } from '../types';
import { generateDemoBatch } from '../services/sampleImages';

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Queue state and controls from useBatchQueue hook
  items: BatchQueueItem[];
  isProcessing: boolean;
  isPaused: boolean;
  currentProcessingId: string | null;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  totalCount: number;
  totalProgress: number;
  addFiles: (files: FileList | File[]) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startBatch: (options: EnhancementOptions) => void;
  pauseBatch: () => void;
  resumeBatch: () => void;
  stopBatch: () => void;
  retryItem: (id: string, options: EnhancementOptions) => void;
  downloadItem: (id: string) => void;
  downloadAllZip: () => Promise<void>;
  // Active studio enhancement options
  initialOptions: EnhancementOptions;
  // Callback to load an item into the main workspace
  onOpenInStudio: (file: File, enhancedBlob?: Blob, enhancedMeta?: ImageMetadata) => void;
  allPresets?: AdjustmentPreset[];
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
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
  initialOptions,
  onOpenInStudio,
  allPresets,
}) => {
  const [options, setOptions] = useState<EnhancementOptions>({ ...initialOptions });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState<boolean>(false);
  const [activePreviewItem, setActivePreviewItem] = useState<BatchQueueItem | null>(null);
  const [previewSliderPos, setPreviewSliderPos] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleLoadDemoSamples = async () => {
    try {
      setIsGeneratingSamples(true);
      const sampleFiles = await generateDemoBatch();
      addFiles(sampleFiles);
    } catch (err) {
      console.error('Failed to load demo samples:', err);
    } finally {
      setIsGeneratingSamples(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadAllZip();
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-dark-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-dark-950 border border-dark-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-accent-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Batch Processing Queue
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Sequential AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enhance multiple images with identical AI settings, skin tone protection & super-resolution.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick summary badges */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono">
              <span className="px-2 py-1 rounded-lg bg-dark-900 border border-dark-800 text-slate-300">
                Total: <strong className="text-white">{totalCount}</strong>
              </span>
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Done: <strong>{completedCount}</strong>
              </span>
              {failedCount > 0 && (
                <span className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  Failed: <strong>{failedCount}</strong>
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (if processing or items finished) */}
        {totalCount > 0 && (
          <div className="w-full bg-dark-900 border-b border-dark-800/80 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 flex-1 mr-4">
              <div className="flex-1 bg-dark-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-accent-500 h-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
              <span className="text-slate-300 font-mono text-[11px] whitespace-nowrap">
                {totalProgress}% ({completedCount}/{totalCount})
              </span>
            </div>

            {isProcessing && (
              <span className="text-xs text-amber-300 font-mono flex items-center space-x-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span>Processing sequentially...</span>
              </span>
            )}
          </div>
        )}

        {/* Settings Bar & Accordion */}
        <div className="border-b border-dark-800 bg-dark-900/40 px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-400" />
                <span>Applied Settings:</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-dark-800 text-brand-300 font-mono text-[11px] border border-dark-700">
                {options.scale}× Super-Res
              </span>
              {options.skinToneProtection && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-[11px] border border-amber-500/25 flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>Melanin Warmth ({options.melaninWarmth}%)</span>
                </span>
              )}
              <span className="hidden md:inline px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 font-mono text-[11px] border border-dark-700">
                Sharp: {options.sharpenStrength}% | Denoise: {options.denoiseStrength}%
              </span>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-dark-800 transition"
            >
              <span>{showSettingsDrawer ? 'Hide Settings' : 'Customize Settings'}</span>
              {showSettingsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expandable Settings Drawer */}
          {showSettingsDrawer && (
            <div className="mt-3 pt-3 border-t border-dark-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Preset Quick Loader */}
              {allPresets && allPresets.length > 0 && (
                <div className="md:col-span-3 flex items-center space-x-2 pb-2.5 border-b border-dark-800/80 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                    <Bookmark className="w-3.5 h-3.5 text-brand-400" />
                    <span>Apply Preset:</span>
                  </span>
                  {allPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (p.enhancementOptions) {
                          setOptions((prev) => ({ ...prev, ...p.enhancementOptions }));
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 hover:border-brand-500/50 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition active:scale-95 flex items-center space-x-1"
                      title={p.description || p.name}
                    >
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Scale & Model */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300">Super-Resolution Scale</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOptions({ ...options, scale: 2 })}
                    className={`py-1.5 px-3 rounded-lg border text-center transition ${
                      options.scale === 2
                        ? 'border-brand-500 bg-brand-500/20 text-white font-bold'
                        : 'border-dark-700 bg-dark-900/60 text-slate-400 hover:border-dark-600'
                    }`}
                  >
                    2× Scale (Fast)
                  </button>
                  <button
                    onClick={() => setOptions({ ...options, scale: 4 })}
                    className={`py-1.5 px-3 rounded-lg border text-center transition ${
                      options.scale === 4
                        ? 'border-brand-500 bg-brand-500/20 text-white font-bold'
                        : 'border-dark-700 bg-dark-900/60 text-slate-400 hover:border-dark-600'
                    }`}
                  >
                    4× Ultra Scale
                  </button>
                </div>
              </div>

              {/* Indian Melanin Protection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <span>🇮🇳</span>
                    <span>Melanin Guard</span>
                  </label>
                  <button
                    onClick={() =>
                      setOptions({ ...options, skinToneProtection: !options.skinToneProtection })
                    }
                    className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
                      options.skinToneProtection
                        ? 'bg-amber-500 text-dark-950 font-bold'
                        : 'bg-dark-800 text-slate-400'
                    }`}
                  >
                    {options.skinToneProtection ? 'ON' : 'OFF'}
                  </button>
                </div>
                {options.skinToneProtection && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Warmth Radiance</span>
                      <span className="font-mono text-amber-300">{options.melaninWarmth}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={options.melaninWarmth}
                      onChange={(e) =>
                        setOptions({ ...options, melaninWarmth: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Denoise & Sharpness */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Denoise Strength</span>
                  <span className="font-mono text-brand-300">{options.denoiseStrength}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={options.denoiseStrength}
                  onChange={(e) =>
                    setOptions({ ...options, denoiseStrength: Number(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-slate-300 mt-1">
                  <span>Sharpen Strength</span>
                  <span className="font-mono text-brand-300">{options.sharpenStrength}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={options.sharpenStrength}
                  onChange={(e) =>
                    setOptions({ ...options, sharpenStrength: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area: Drag & Drop + Queue List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Multi-File Upload Dropzone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 relative group ${
              isDragOver
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : 'border-dark-700 hover:border-brand-500/40 bg-dark-900/40 hover:bg-dark-900/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">
                  Drop multiple images here or <span className="text-brand-400 underline">browse files</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Select several JPG, PNG, or WebP images to batch process sequentially
                </div>
              </div>
              <div className="sm:ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadDemoSamples();
                  }}
                  disabled={isGeneratingSamples}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  {isGeneratingSamples ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>+ Load 3 Test Images</span>
                </button>
              </div>
            </div>
          </div>

          {/* Queue Items List */}
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Layers className="w-10 h-10 mx-auto mb-2 text-dark-600" />
              <div className="text-xs font-semibold text-slate-400">The batch queue is empty</div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Add multiple files above or click "+ Load 3 Test Images" to test the sequential batch pipeline immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span>Queue Items ({items.length})</span>
                <div className="space-x-3">
                  {completedCount > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="hover:text-slate-200 transition text-[11px]"
                    >
                      Clear Completed
                    </button>
                  )}
                  {!isProcessing && (
                    <button
                      onClick={clearAll}
                      className="hover:text-rose-400 transition text-[11px]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-dark-800/60 border border-dark-800 rounded-2xl bg-dark-900/30 overflow-hidden">
                {items.map((item, index) => {
                  const isCurrent = item.id === currentProcessingId;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center justify-between gap-3 transition ${
                        isCurrent
                          ? 'bg-brand-500/10 border-l-4 border-l-brand-500'
                          : item.status === 'completed'
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'hover:bg-dark-900/50'
                      }`}
                    >
                      {/* Left: Index & Thumbnails */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-[11px] font-mono text-slate-400 w-4 text-center">
                          {index + 1}
                        </span>

                        {/* Image Preview thumbnail */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-dark-700 bg-dark-950 flex-shrink-0">
                          <img
                            src={item.enhancedUrl || item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.status === 'completed' && (
                            <div className="absolute bottom-0 right-0 bg-emerald-500 text-dark-950 p-0.5 rounded-tl">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* File Details */}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span>{formatFileSize(item.size)}</span>
                            {item.enhancedMeta && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-emerald-300">
                                  {item.enhancedMeta.width}×{item.enhancedMeta.height}
                                </span>
                              </>
                            )}
                            {item.processingTimeMs && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-brand-300">
                                  {(item.processingTimeMs / 1000).toFixed(1)}s
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {item.status === 'pending' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-800 text-slate-400 border border-dark-700">
                            Queued
                          </span>
                        )}

                        {item.status === 'processing' && (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center gap-1.5 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-brand-400" />
                            <span>Enhancing...</span>
                          </span>
                        )}

                        {item.status === 'completed' && (
                          <>
                            <button
                              onClick={() => {
                                setActivePreviewItem(item);
                                setPreviewSliderPos(50);
                              }}
                              className="text-xs text-brand-400 hover:text-white px-2 py-1 rounded bg-dark-800 hover:bg-dark-700 border border-dark-700 transition hidden sm:inline-flex items-center gap-1"
                              title="Compare Before & After"
                            >
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => onOpenInStudio(item.file, item.enhancedBlob, item.enhancedMeta)}
                              className="text-xs text-emerald-300 hover:text-white px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition flex items-center gap-1"
                              title="Open this enhanced image in the main studio canvas"
                            >
                              <span>Studio</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => downloadItem(item.id)}
                              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white transition"
                              title="Download Enhanced Image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {item.status === 'failed' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                              <span className="truncate max-w-[100px]">{item.error || 'Failed'}</span>
                            </span>
                            <button
                              onClick={() => retryItem(item.id, options)}
                              className="p-1 rounded bg-dark-800 hover:bg-dark-700 text-amber-300 transition text-xs flex items-center gap-1"
                              title="Retry item"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span className="text-[10px]">Retry</span>
                            </button>
                          </div>
                        )}

                        {/* Remove item button (if not currently processing) */}
                        {!isCurrent && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-dark-800 transition"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Before / After Inline Preview Modal */}
          {activePreviewItem && activePreviewItem.enhancedUrl && (
            <div className="mt-4 p-4 border border-dark-700 rounded-2xl bg-dark-900/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Before / After Preview:</span>
                  <span className="text-xs text-brand-300 font-mono truncate max-w-xs">
                    {activePreviewItem.name}
                  </span>
                </div>
                <button
                  onClick={() => setActivePreviewItem(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Preview
                </button>
              </div>

              {/* Split Slider Preview */}
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden bg-dark-950 border border-dark-800 select-none">
                {/* Enhanced Image (Background) */}
                <img
                  src={activePreviewItem.enhancedUrl}
                  alt="Enhanced"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Original Image (Clipped Left Side) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${previewSliderPos}%` }}
                >
                  <img
                    src={activePreviewItem.previewUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                </div>

                {/* Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                  style={{ left: `${previewSliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg text-[9px] font-bold">
                    ⇄
                  </div>
                </div>

                {/* Slider Input overlay */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={previewSliderPos}
                  onChange={(e) => setPreviewSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-dark-950/80 text-[10px] text-slate-300 border border-dark-700 pointer-events-none">
                  Original
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/80 text-[10px] text-white font-bold pointer-events-none">
                  AI Enhanced
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="px-6 py-4 border-t border-dark-800 bg-dark-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {completedCount > 0 && (
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
              >
                {isZipping ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderArchive className="w-3.5 h-3.5" />
                )}
                <span>Download All ({completedCount}) as ZIP</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* If Processing: Pause / Resume / Stop */}
            {isProcessing ? (
              <>
                <button
                  onClick={isPaused ? resumeBatch : pauseBatch}
                  className="px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-amber-300 border border-dark-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={stopBatch}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Batch</span>
                </button>
              </>
            ) : (
              /* If Idle: Start Processing */
              <button
                onClick={() => startBatch(options)}
                disabled={pendingCount === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-lg ${
                  pendingCount === 0
                    ? 'bg-dark-800 text-slate-500 cursor-not-allowed border border-dark-700'
                    : 'bg-gradient-to-r from-brand-500 via-accent-500 to-indigo-600 text-white shadow-brand-500/25 hover:brightness-110 active:scale-95'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {pendingCount === 0 && completedCount > 0
                    ? 'All Images Processed'
                    : `Process ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'} Sequentially`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
