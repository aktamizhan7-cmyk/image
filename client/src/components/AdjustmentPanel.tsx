import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Bookmark,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  EnhancementOptions,
  ManualAdjustmentSettings,
  ImageMetadata,
  AdjustmentPreset,
} from '../types';
import { NanoBananaPanel } from './NanoBananaPanel';

interface AdjustmentPanelProps {
  enhancementOptions: EnhancementOptions;
  onUpdateEnhancementOptions: (opts: EnhancementOptions) => void;
  onRunAiEnhancement: () => void;
  isAiProcessing: boolean;
  manualSettings: ManualAdjustmentSettings;
  onUpdateManualLive: (settings: ManualAdjustmentSettings) => void;
  onCommitManual: (settings: ManualAdjustmentSettings) => void;
  onResetManual: () => void;
  hasCurrentImage: boolean;
  currentImageFile: File | null;
  currentImageUrl: string | null;
  onImageGenerated: (file: File, url: string, metadata: ImageMetadata, isEdit: boolean) => void;
  setIsAiProcessing: (v: boolean) => void;
  statusMessage: string | null;
  setStatusMessage: (msg: string | null) => void;
  initialTab?: 'ai' | 'manual' | 'presets' | 'nano';
  onOpenBatchQueue?: () => void;
  allPresets?: AdjustmentPreset[];
  activePresetId?: string | null;
  onApplyPreset?: (preset: AdjustmentPreset) => void;
  onOpenSavePresetModal?: () => void;
  onOpenPresetLibraryModal?: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  enhancementOptions,
  onUpdateEnhancementOptions,
  onRunAiEnhancement,
  isAiProcessing,
  manualSettings,
  onUpdateManualLive,
  onCommitManual,
  onResetManual,
  hasCurrentImage,
  currentImageFile,
  currentImageUrl,
  onImageGenerated,
  setIsAiProcessing,
  statusMessage,
  setStatusMessage,
  initialTab = 'ai',
  allPresets = [],
  activePresetId = null,
  onApplyPreset,
  onOpenSavePresetModal,
  onOpenPresetLibraryModal,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'presets' | 'nano'>(initialTab);
  const [selectedMelaninPreset, setSelectedMelaninPreset] = useState<string>('golden-glow');

  // Handle Melanin Presets
  const applyMelaninPreset = (presetKey: string) => {
    setSelectedMelaninPreset(presetKey);
    let updatedManual: Partial<ManualAdjustmentSettings> = {};
    let updatedAi: Partial<EnhancementOptions> = {};

    if (presetKey === 'golden-glow') {
      updatedManual = {
        melaninWarmth: 35,
        contrast: 12,
        antiAshiness: 40,
        brightness: 2,
        highlights: -8,
        shadows: 14,
        skinToneMode: 'wheatish_golden',
      };
      updatedAi = {
        melaninWarmth: 35,
        antiAshiness: 40,
        skinToneMode: 'wheatish_golden',
      };
    } else if (presetKey === 'deep-bronze') {
      updatedManual = {
        melaninWarmth: 50,
        contrast: 18,
        antiAshiness: 65,
        brightness: 4,
        highlights: -14,
        shadows: 20,
        skinToneMode: 'dusky_bronze',
      };
      updatedAi = {
        melaninWarmth: 50,
        antiAshiness: 65,
        skinToneMode: 'dusky_bronze',
      };
    } else if (presetKey === 'warm-olive') {
      updatedManual = {
        melaninWarmth: 20,
        contrast: 8,
        antiAshiness: 50,
        temperature: 6,
        tint: -4,
        highlights: -6,
        shadows: 10,
        skinToneMode: 'warm_olive',
      };
      updatedAi = {
        melaninWarmth: 20,
        antiAshiness: 50,
        skinToneMode: 'warm_olive',
      };
    } else if (presetKey === 'anti-bleach') {
      updatedManual = {
        melaninWarmth: 55,
        contrast: 5,
        antiAshiness: 80,
        highlights: -24,
        shadows: 18,
        saturation: 8,
        skinToneMode: 'deep_rich',
      };
      updatedAi = {
        melaninWarmth: 55,
        antiAshiness: 80,
        skinToneMode: 'deep_rich',
      };
    }

    onCommitManual({ ...manualSettings, ...updatedManual });
    onUpdateEnhancementOptions({ ...enhancementOptions, ...updatedAi });
  };

  // Helper for manual adjustments
  const handleManualChange = (key: keyof ManualAdjustmentSettings, value: number) => {
    onUpdateManualLive({
      ...manualSettings,
      [key]: value,
    });
  };

  const handleManualCommit = (key: keyof ManualAdjustmentSettings, value: number) => {
    onCommitManual({
      ...manualSettings,
      [key]: value,
    });
  };

  return (
    <aside
      className="w-full lg:w-[410px] xl:w-[450px] bg-obsidian-900 border-l border-obsidian-800 flex flex-col h-full select-none"
      data-purpose="control-panel"
    >
      {/* Tab Header Selector */}
      <div className="p-2 border-b border-obsidian-800 bg-obsidian-950/50 flex gap-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
            activeTab === 'ai'
              ? 'bg-obsidian-800 text-white border-obsidian-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border-transparent'
          }`}
          id="tab-ai-btn"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-ESRGAN</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
            activeTab === 'manual'
              ? 'bg-obsidian-800 text-white border-obsidian-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border-transparent'
          }`}
          id="tab-manual-btn"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Manual</span>
        </button>

        {/* Secondary tabs for Presets & Banana 2 */}
        <button
          onClick={() => setActiveTab('presets')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center border transition ${
            activeTab === 'presets'
              ? 'bg-obsidian-800 text-white border-obsidian-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border-transparent'
          }`}
          title="Presets"
        >
          <Bookmark className="w-3.5 h-3.5 text-brand-400" />
        </button>

        <button
          onClick={() => setActiveTab('nano')}
          className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center border transition ${
            activeTab === 'nano'
              ? 'bg-obsidian-800 text-white border-obsidian-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border-transparent'
          }`}
          title="Nano Banana Generative Engine"
        >
          <span className="text-xs">🍌</span>
        </button>
      </div>

      {/* Scrollable Adjustment Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ================= TAB CONTENT 1: AI SUPER-RES & MELANIN GUARD ================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6" id="panel-ai-tab">
            {/* Model Card Picker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Neural Model Architecture
                </label>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  GPU Accelerated
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Model 1 */}
                <div
                  onClick={() =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      model: 'realesrgan-x4plus',
                      scale: 4,
                    })
                  }
                  className={`model-option border p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition ${
                    enhancementOptions.model === 'realesrgan-x4plus'
                      ? 'border-blue-500 bg-blue-950/20 active'
                      : 'border-obsidian-700 bg-obsidian-850/60 hover:border-obsidian-600'
                  }`}
                  data-model="realesrgan-x4plus"
                >
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>realesrgan-x4plus-anime</span>
                      <span className="text-[10px] bg-blue-600/40 text-blue-200 px-1.5 py-0.2 rounded font-mono">
                        4x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Optimal high-fidelity clarity for human skin pores & fabrics.
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 ml-2">
                    {enhancementOptions.model === 'realesrgan-x4plus' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>

                {/* Model 2 */}
                <div
                  onClick={() =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      model: 'realesrnet-x4plus',
                      scale: 4,
                    })
                  }
                  className={`model-option border p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition ${
                    enhancementOptions.model === 'realesrnet-x4plus'
                      ? 'border-blue-500 bg-blue-950/20 active'
                      : 'border-obsidian-700 bg-obsidian-850/60 hover:border-obsidian-600'
                  }`}
                  data-model="realesr-animevideov3-x4"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>realesr-animevideov3-x4</span>
                      <span className="text-[10px] bg-obsidian-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                        4x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ultra-fast temporal stabilization model (Vulkan stream).
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-obsidian-600 flex items-center justify-center shrink-0 ml-2">
                    {enhancementOptions.model === 'realesrnet-x4plus' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>

                {/* Model 3 */}
                <div
                  onClick={() =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      model: 'realesrgan-x4plus-anime',
                      scale: 2,
                    })
                  }
                  className={`model-option border p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition ${
                    enhancementOptions.model === 'realesrgan-x4plus-anime'
                      ? 'border-blue-500 bg-blue-950/20 active'
                      : 'border-obsidian-700 bg-obsidian-850/60 hover:border-obsidian-600'
                  }`}
                  data-model="realesr-animevideov3-x2"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span>realesr-animevideov3-x2</span>
                      <span className="text-[10px] bg-obsidian-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                        2x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Low-latency lightweight pass for quick turnaround.
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-obsidian-600 flex items-center justify-center shrink-0 ml-2">
                    {enhancementOptions.model === 'realesrgan-x4plus-anime' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upscale Multiplier Factor */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Scale Factor
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateEnhancementOptions({ ...enhancementOptions, scale: 2 })
                  }
                  className={`py-2 text-xs font-mono font-medium rounded-lg border transition ${
                    enhancementOptions.scale === 2
                      ? 'border-brand-500 bg-brand-600/20 text-blue-300 shadow-glow-blue font-semibold'
                      : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  2x HD
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateEnhancementOptions({ ...enhancementOptions, scale: 4 })
                  }
                  className={`py-2 text-xs font-mono font-medium rounded-lg border transition ${
                    enhancementOptions.scale === 4
                      ? 'border-brand-500 bg-brand-600/20 text-blue-300 shadow-glow-blue font-semibold'
                      : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  4x Ultra 4K
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateEnhancementOptions({ ...enhancementOptions, scale: 8 })
                  }
                  className={`py-2 text-xs font-mono font-medium rounded-lg border transition ${
                    enhancementOptions.scale === 8
                      ? 'border-brand-500 bg-brand-600/20 text-blue-300 shadow-glow-blue font-semibold'
                      : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  8x 8K Master
                </button>
              </div>
            </div>

            {/* Denoise & Smart Sharpen Sliders */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Neural Denoise Level</span>
                  <span className="text-blue-400 font-mono" id="denoise-val">
                    {enhancementOptions.denoiseStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={enhancementOptions.denoiseStrength}
                  onChange={(e) =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      denoiseStrength: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Smart Edge Sharpen</span>
                  <span className="text-blue-400 font-mono" id="sharpen-val">
                    {enhancementOptions.sharpenStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={enhancementOptions.sharpenStrength}
                  onChange={(e) =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      sharpenStrength: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* South Asian Melanin Guard Preset Selector */}
            <div className="pt-3 border-t border-obsidian-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[10px] bg-melanin-500/20 border border-melanin-500/40 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                    IN
                  </span>
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Melanin Guard Presets
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Anti-Whitewash v3.2</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Maintains authentic deep golden undertones and restores natural contrast without blanching dark skin textures.
              </p>

              {/* Preset Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Preset 1 */}
                <button
                  type="button"
                  onClick={() => applyMelaninPreset('golden-glow')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedMelaninPreset === 'golden-glow'
                      ? 'border-amber-500 bg-melanin-500/15'
                      : 'border-obsidian-700 bg-obsidian-850 hover:border-amber-500/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-amber-300">Wheatish & Golden</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Warm honey/amber undertone</div>
                </button>

                {/* Preset 2 */}
                <button
                  type="button"
                  onClick={() => applyMelaninPreset('deep-bronze')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedMelaninPreset === 'deep-bronze'
                      ? 'border-amber-500 bg-melanin-500/15'
                      : 'border-obsidian-700 bg-obsidian-850 hover:border-amber-500/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Dusky & Deep Bronze</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Lifts shadows, 0% ashiness</div>
                </button>

                {/* Preset 3 */}
                <button
                  type="button"
                  onClick={() => applyMelaninPreset('warm-olive')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedMelaninPreset === 'warm-olive'
                      ? 'border-amber-500 bg-melanin-500/15'
                      : 'border-obsidian-700 bg-obsidian-850 hover:border-amber-500/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Warm Olive Radiance</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Neutralizes grey camera casts</div>
                </button>

                {/* Preset 4 */}
                <button
                  type="button"
                  onClick={() => applyMelaninPreset('anti-bleach')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    selectedMelaninPreset === 'anti-bleach'
                      ? 'border-amber-500 bg-melanin-500/15'
                      : 'border-obsidian-700 bg-obsidian-850 hover:border-amber-500/60'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">Anti-Bleach & True Tone</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Prevents white AI highlights</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 2: PRO MANUAL COLOR & TONAL GRADING ================= */}
        {activeTab === 'manual' && (
          <div className="space-y-5" id="panel-manual-tab">
            <div className="text-xs text-slate-400 leading-relaxed bg-obsidian-850 p-2.5 rounded-lg border border-obsidian-800">
              Live non-destructive parameter pipeline baked via WebGL shaders on top of the upscaled layer.
            </div>

            {/* Tonal Sliders Group */}
            <div className="space-y-4">
              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Exposure (EV)</span>
                  <span className="text-slate-400 font-mono">
                    {manualSettings.exposure > 0 ? `+${(manualSettings.exposure / 100).toFixed(2)}` : (manualSettings.exposure / 100).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualSettings.exposure}
                  onChange={(e) => handleManualChange('exposure', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('exposure', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Brightness</span>
                  <span className="text-slate-400 font-mono">
                    {100 + manualSettings.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={manualSettings.brightness}
                  onChange={(e) => handleManualChange('brightness', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('brightness', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Contrast</span>
                  <span className="text-slate-400 font-mono">
                    {100 + manualSettings.contrast}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={manualSettings.contrast}
                  onChange={(e) => handleManualChange('contrast', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('contrast', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Highlights Recovery</span>
                  <span className="text-slate-400 font-mono">
                    {manualSettings.highlights > 0 ? `+${manualSettings.highlights}` : manualSettings.highlights}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualSettings.highlights}
                  onChange={(e) => handleManualChange('highlights', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('highlights', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Shadows */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Shadow Lift</span>
                  <span className="text-slate-400 font-mono">
                    {manualSettings.shadows > 0 ? `+${manualSettings.shadows}` : manualSettings.shadows}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualSettings.shadows}
                  onChange={(e) => handleManualChange('shadows', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('shadows', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Melanin Warmth Slider (Amber Themed) */}
              <div className="space-y-1 pt-2 border-t border-obsidian-800">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-300 font-medium flex items-center gap-1">
                    Melanin Warmth (Golden Shift)
                  </span>
                  <span className="text-amber-400 font-mono">
                    +{manualSettings.melaninWarmth || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualSettings.melaninWarmth || 0}
                  onChange={(e) => handleManualChange('melaninWarmth', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('melaninWarmth', Number((e.target as HTMLInputElement).value))}
                  className="w-full melanin-slider"
                />
              </div>

              {/* Anti-Ashiness Defog */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-300 font-medium">Anti-Ashiness Neutralizer</span>
                  <span className="text-amber-400 font-mono">
                    {manualSettings.antiAshiness || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualSettings.antiAshiness || 0}
                  onChange={(e) => handleManualChange('antiAshiness', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('antiAshiness', Number((e.target as HTMLInputElement).value))}
                  className="w-full melanin-slider"
                />
              </div>

              {/* Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Clarity & Micro-Texture</span>
                  <span className="text-slate-400 font-mono">
                    {manualSettings.clarity > 0 ? `+${manualSettings.clarity}` : manualSettings.clarity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualSettings.clarity}
                  onChange={(e) => handleManualChange('clarity', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('clarity', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Vibrance & Saturation</span>
                  <span className="text-slate-400 font-mono">
                    {100 + manualSettings.saturation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={manualSettings.saturation}
                  onChange={(e) => handleManualChange('saturation', Number(e.target.value))}
                  onMouseUp={(e) => handleManualCommit('saturation', Number((e.target as HTMLInputElement).value))}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onResetManual}
                  className="w-full py-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 text-xs rounded-lg border border-obsidian-700 transition"
                >
                  Reset Manual Tonal Grading
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 3: PRESETS LIBRARY ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-obsidian-950/60 border border-obsidian-800">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-brand-400" />
                  <span>Preset Library</span>
                </h4>
                <p className="text-[10px] text-slate-400">Save & load instant looks</p>
              </div>
              <div className="flex items-center space-x-1.5">
                {onOpenSavePresetModal && (
                  <button
                    onClick={onOpenSavePresetModal}
                    className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-obsidian-700 text-[11px] font-semibold transition"
                    title="Save Current Settings as New Preset"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenPresetLibraryModal && (
                  <button
                    onClick={onOpenPresetLibraryModal}
                    className="px-2 py-1 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-obsidian-700 text-[10px] font-semibold transition"
                  >
                    Manage
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {allPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset?.(preset)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                    activePresetId === preset.id
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-obsidian-800 bg-obsidian-950/40 hover:border-obsidian-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
                      {preset.description}
                    </div>
                  </div>
                  {preset.isBuiltIn && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-400 border border-obsidian-700">
                      Pro
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 4: NANO BANANA ================= */}
        {activeTab === 'nano' && (
          <NanoBananaPanel
            hasCurrentImage={hasCurrentImage}
            currentImageFile={currentImageFile}
            currentImageUrl={currentImageUrl}
            onImageGenerated={onImageGenerated}
            isAiProcessing={isAiProcessing}
            setIsAiProcessing={setIsAiProcessing}
            statusMessage={statusMessage}
            setStatusMessage={setStatusMessage}
          />
        )}
      </div>

      {/* Panel Footer Batch Apply (Matching Image 2) */}
      <div className="p-3 bg-obsidian-950/80 border-t border-obsidian-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onRunAiEnhancement}
          disabled={isAiProcessing}
          className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-glow-blue transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          id="apply-ai-pass-btn"
        >
          {isAiProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Synthesizing 4K Pass...</span>
            </>
          ) : (
            <span>Re-render Real-ESRGAN Pass</span>
          )}
        </button>
      </div>
    </aside>
  );
};
