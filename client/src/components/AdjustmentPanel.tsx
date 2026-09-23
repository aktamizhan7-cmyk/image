import { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Sun,
  Palette,
  Layers,
  Wand2,
  RefreshCw,
  Zap,
  CheckCircle,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { EnhancementOptions, ManualAdjustmentSettings, SKIN_TONE_PRESETS } from '../types';



interface AdjustmentPanelProps {
  enhancementOptions: EnhancementOptions;
  onUpdateEnhancementOptions: (opts: EnhancementOptions) => void;
  onRunAiEnhancement: () => void;
  isAiProcessing: boolean;
  manualSettings: ManualAdjustmentSettings;
  onUpdateManualLive: (settings: ManualAdjustmentSettings) => void;
  onCommitManual: (settings: ManualAdjustmentSettings) => void;
  onResetManual: () => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const updateManualField = (key: keyof ManualAdjustmentSettings, val: number) => {
    const updated = { ...manualSettings, [key]: val };
    onUpdateManualLive(updated);
  };

  const commitManualField = (key: keyof ManualAdjustmentSettings, val: number) => {
    const updated = { ...manualSettings, [key]: val };
    onCommitManual(updated);
  };

  const resetManualField = (key: keyof ManualAdjustmentSettings) => {
    const updated = { ...manualSettings, [key]: 0 };
    onCommitManual(updated);
  };

  return (
    <div className="w-80 md:w-96 border-l border-dark-700/60 bg-dark-950/90 backdrop-blur-xl flex flex-col h-full z-20 select-none">
      {/* Top Tab Bar */}
      <div className="p-3 border-b border-dark-800/80 grid grid-cols-2 gap-1.5 bg-dark-900/50">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Enhance</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'manual'
              ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Manual Pro</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'ai' ? (
          /* ================= AI ENHANCE PANEL ================= */
          <div className="space-y-6">
            {/* Upscaling Scale Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                  AI Super-Resolution Scale
                </span>
                <span className="text-[11px] font-mono text-brand-400 font-bold">
                  {enhancementOptions.scale}× Upscale
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateEnhancementOptions({ ...enhancementOptions, scale: 2 })}
                  className={`p-3 rounded-xl border text-left transition ${
                    enhancementOptions.scale === 2
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-md shadow-brand-500/10'
                      : 'border-dark-700/80 bg-dark-900/60 text-slate-400 hover:border-dark-600 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-sm">2× Upscale</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Ultra-fast, ideal for web & social</div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateEnhancementOptions({ ...enhancementOptions, scale: 4 })}
                  className={`p-3 rounded-xl border text-left transition ${
                    enhancementOptions.scale === 4
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-md shadow-brand-500/10'
                      : 'border-dark-700/80 bg-dark-900/60 text-slate-400 hover:border-dark-600 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-sm">4× Upscale</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Max resolution for printing & large displays</div>
                </button>
              </div>
            </div>

            {/* Neural Model Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                <span>Photographic Model</span>
                <span className="text-[11px] text-emerald-400 font-mono">Real-ESRGAN</span>
              </label>
              <div className="p-2.5 rounded-xl bg-dark-900 border border-dark-700/70 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">RealESRGAN_x4plus</div>
                  <div className="text-[11px] text-slate-400">General photo restoration & noise reduction</div>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Sliders: Denoise & Smart Sharpening */}
            <div className="space-y-4 pt-2 border-t border-dark-800">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Artifact & Noise Reduction</span>
                  <span className="font-mono text-brand-400 text-[11px] font-semibold">
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

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Smart Edge Sharpening</span>
                  <span className="font-mono text-brand-400 text-[11px] font-semibold">
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

            {/* Toggles: Lighting & Color */}
            <div className="space-y-2.5 pt-2 border-t border-dark-800">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-dark-700 cursor-pointer transition">
                <span className="text-xs text-slate-200 font-medium">Adaptive Lighting Correction</span>
                <input
                  type="checkbox"
                  checked={enhancementOptions.lightingCorrection}
                  onChange={(e) =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      lightingCorrection: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-brand-500 focus:ring-0 focus:ring-offset-0 bg-dark-800 border-dark-700 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-dark-700 cursor-pointer transition">
                <span className="text-xs text-slate-200 font-medium">Natural Color Vibrance</span>
                <input
                  type="checkbox"
                  checked={enhancementOptions.colorCorrection}
                  onChange={(e) =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      colorCorrection: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-brand-500 focus:ring-0 focus:ring-offset-0 bg-dark-800 border-dark-700 cursor-pointer"
                />
              </label>
            </div>

            {/* South Asian / Indian Skin Tone Optimization Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-dark-900 to-dark-950 border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇮🇳</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Indian Skin Tone Optimization
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-semibold border border-amber-500/30">
                        Melanin Guard
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Prevents AI whitewashing & restores warm golden-amber radiance
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={enhancementOptions.skinToneProtection}
                  onChange={(e) =>
                    onUpdateEnhancementOptions({
                      ...enhancementOptions,
                      skinToneProtection: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-dark-800 border-dark-700 cursor-pointer"
                />
              </div>

              {enhancementOptions.skinToneProtection && (
                <div className="space-y-3 pt-2 border-t border-amber-500/20 animate-fade-in">
                  {/* Skin Tone Mode Pills */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Select Skin Tone Profile:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SKIN_TONE_PRESETS.map((preset) => {
                        const isSelected = enhancementOptions.skinToneMode === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              onUpdateEnhancementOptions({
                                ...enhancementOptions,
                                skinToneMode: preset.id,
                                melaninWarmth: preset.aiOptions.melaninWarmth ?? enhancementOptions.melaninWarmth,
                                antiAshiness: preset.aiOptions.antiAshiness ?? enhancementOptions.antiAshiness,
                              })
                            }
                            className={`p-2 rounded-xl border text-left transition ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500/20 text-white shadow-sm shadow-amber-500/10'
                                : 'border-dark-700/80 bg-dark-900/80 text-slate-400 hover:text-slate-200 hover:border-dark-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold truncate">{preset.label}</span>
                              <span className="text-[8px] font-medium px-1 rounded bg-dark-800 text-amber-300">
                                {preset.badge}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                              {preset.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Melanin Warmth Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Melanin Warmth (Golden Amber)
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        {enhancementOptions.melaninWarmth}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={enhancementOptions.melaninWarmth}
                      onChange={(e) =>
                        onUpdateEnhancementOptions({
                          ...enhancementOptions,
                          melaninWarmth: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Anti-Ashiness Filter Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Anti-Ashiness / De-Greying
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {enhancementOptions.antiAshiness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={enhancementOptions.antiAshiness}
                      onChange={(e) =>
                        onUpdateEnhancementOptions({
                          ...enhancementOptions,
                          antiAshiness: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= MANUAL PRO PANEL ================= */
          <div className="space-y-6">
            {/* Quick Skin Tone Presets Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-dark-900 to-dark-950 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <span className="text-base">🇮🇳</span> Indian Skin Tone Presets
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">1-Click Melanin Match</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SKIN_TONE_PRESETS.map((preset) => {
                  const isActive = manualSettings.skinToneMode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...manualSettings,
                          ...preset.manualSettings,
                        };
                        onCommitManual(updated);
                      }}
                      className={`p-2 rounded-xl text-left border transition ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/20 text-white shadow-sm'
                          : 'border-dark-700/70 bg-dark-900/70 text-slate-300 hover:border-amber-500/40 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-amber-300">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 line-clamp-1">{preset.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 1: Light */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-dark-800">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
                </span>
                <span className="text-[10px] font-normal text-slate-500">Double click slider to reset</span>
              </div>


              <SliderItem
                label="Exposure"
                value={manualSettings.exposure}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('exposure', v)}
                onCommit={(v) => commitManualField('exposure', v)}
                onReset={() => resetManualField('exposure')}
              />

              <SliderItem
                label="Brightness"
                value={manualSettings.brightness}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('brightness', v)}
                onCommit={(v) => commitManualField('brightness', v)}
                onReset={() => resetManualField('brightness')}
              />

              <SliderItem
                label="Contrast"
                value={manualSettings.contrast}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('contrast', v)}
                onCommit={(v) => commitManualField('contrast', v)}
                onReset={() => resetManualField('contrast')}
              />

              <SliderItem
                label="Highlights"
                value={manualSettings.highlights}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('highlights', v)}
                onCommit={(v) => commitManualField('highlights', v)}
                onReset={() => resetManualField('highlights')}
              />

              <SliderItem
                label="Shadows"
                value={manualSettings.shadows}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('shadows', v)}
                onCommit={(v) => commitManualField('shadows', v)}
                onReset={() => resetManualField('shadows')}
              />
            </div>

            {/* Section 2: Color */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-dark-800">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-400" /> Color
                </span>
              </div>

              <SliderItem
                label="Saturation"
                value={manualSettings.saturation}
                min={-100}
                max={100}
                onChange={(v) => updateManualField('saturation', v)}
                onCommit={(v) => commitManualField('saturation', v)}
                onReset={() => resetManualField('saturation')}
              />

              <SliderItem
                label="Temperature"
                value={manualSettings.temperature}
                min={-100}
                max={100}
                hint="Cool / Warm"
                onChange={(v) => updateManualField('temperature', v)}
                onCommit={(v) => commitManualField('temperature', v)}
                onReset={() => resetManualField('temperature')}
              />

              <SliderItem
                label="Tint"
                value={manualSettings.tint}
                min={-100}
                max={100}
                hint="Green / Magenta"
                onChange={(v) => updateManualField('tint', v)}
                onCommit={(v) => commitManualField('tint', v)}
                onReset={() => resetManualField('tint')}
              />

              <SliderItem
                label="Melanin Warmth"
                value={manualSettings.melaninWarmth ?? 0}
                min={0}
                max={100}
                hint="Golden Glow"
                onChange={(v) => updateManualField('melaninWarmth', v)}
                onCommit={(v) => commitManualField('melaninWarmth', v)}
                onReset={() => resetManualField('melaninWarmth')}
              />

              <SliderItem
                label="Anti-Ashiness"
                value={manualSettings.antiAshiness ?? 0}
                min={0}
                max={100}
                hint="De-Greying"
                onChange={(v) => updateManualField('antiAshiness', v)}
                onCommit={(v) => commitManualField('antiAshiness', v)}
                onReset={() => resetManualField('antiAshiness')}
              />
            </div>


            {/* Section 3: Detail */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-dark-800">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Detail
                </span>
              </div>

              <SliderItem
                label="Sharpness"
                value={manualSettings.sharpness}
                min={0}
                max={100}
                onChange={(v) => updateManualField('sharpness', v)}
                onCommit={(v) => commitManualField('sharpness', v)}
                onReset={() => resetManualField('sharpness')}
              />

              <SliderItem
                label="Clarity"
                value={manualSettings.clarity}
                min={0}
                max={100}
                onChange={(v) => updateManualField('clarity', v)}
                onCommit={(v) => commitManualField('clarity', v)}
                onReset={() => resetManualField('clarity')}
              />

              <SliderItem
                label="Noise Reduction"
                value={manualSettings.noiseReduction}
                min={0}
                max={100}
                onChange={(v) => updateManualField('noiseReduction', v)}
                onCommit={(v) => commitManualField('noiseReduction', v)}
                onReset={() => resetManualField('noiseReduction')}
              />

              <SliderItem
                label="Blur"
                value={manualSettings.blur}
                min={0}
                max={100}
                onChange={(v) => updateManualField('blur', v)}
                onCommit={(v) => commitManualField('blur', v)}
                onReset={() => resetManualField('blur')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Area */}
      <div className="p-4 border-t border-dark-800 bg-dark-950">
        {activeTab === 'ai' ? (
          <button
            type="button"
            onClick={onRunAiEnhancement}
            disabled={isAiProcessing}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition duration-200"
          >
            {isAiProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Enhancing with Neural AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-white" />
                <span>Apply AI Enhancement</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetManual}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-300 bg-dark-900 hover:bg-dark-800 border border-dark-700/80 active:scale-[0.98] transition flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Manual Adjustments</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface SliderItemProps {
  label: string;
  value: number;
  min: number;
  max: number;
  hint?: string;
  onChange: (val: number) => void;
  onCommit: (val: number) => void;
  onReset: () => void;
}

const SliderItem: React.FC<SliderItemProps> = ({
  label,
  value,
  min,
  max,
  hint,
  onChange,
  onCommit,
  onReset,
}) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between text-xs mb-1">
        <span
          onDoubleClick={onReset}
          className="text-slate-300 font-medium cursor-pointer hover:text-white flex items-center gap-1"
          title="Double click to reset to 0"
        >
          {label}
          {hint && <span className="text-[10px] text-slate-500 font-normal">({hint})</span>}
        </span>
        <span
          onDoubleClick={onReset}
          className={`font-mono text-[11px] font-semibold cursor-pointer ${
            value !== 0 ? 'text-brand-400' : 'text-slate-500'
          }`}
        >
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => onCommit(Number((e.target as HTMLInputElement).value))}
        onDoubleClick={onReset}
        className="w-full"
      />
    </div>
  );
};
