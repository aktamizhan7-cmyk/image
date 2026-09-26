import React, { useState, useRef } from 'react';
import {
  Wand2,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Compass,
  Layers,
  Plus,
  X,
  Lock,
} from 'lucide-react';
import { ApiClient } from '../services/apiClient';
import {
  ImageMetadata,
  NanoBananaModelId,
  NANO_BANANA_MODELS,
  ReferenceImageSlot,
} from '../types';

interface NanoBananaPanelProps {
  hasCurrentImage: boolean;
  currentImageFile: File | null;
  currentImageUrl: string | null;
  onImageGenerated: (file: File, url: string, metadata: ImageMetadata, isEdit: boolean) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (v: boolean) => void;
  statusMessage: string | null;
  setStatusMessage: (msg: string | null) => void;
}

const ASPECT_RATIOS = [
  { label: '1:1', name: 'Square', value: '1:1' },
  { label: '16:9', name: 'Wide', value: '16:9' },
  { label: '9:16', name: 'Story', value: '9:16' },
  { label: '4:3', name: 'Photo', value: '4:3' },
  { label: '3:4', name: 'Portrait', value: '3:4' },
];

const RESOLUTIONS = [
  { label: '512px', desc: 'Fast' },
  { label: '1K', desc: 'Standard' },
  { label: '2K', desc: 'High-Res' },
  { label: '4K', desc: 'Ultra-HD' },
];

const STYLES = [
  { label: 'Photorealistic', prompt: 'photorealistic, ultra-detailed 8k, natural lighting, sharp focus' },
  { label: 'Cinematic', prompt: 'cinematic lighting, 35mm film still, anamorphic lens flare, moody color grading' },
  { label: 'Studio Portrait', prompt: 'masterpiece studio photography, softbox lighting, shallow depth of field, 85mm f/1.4' },
  { label: 'Anime / Manga', prompt: 'high-quality modern anime key visual, Makoto Shinkai style, vibrant colors' },
  { label: 'Digital Art', prompt: 'digital concept art, intricate details, trending on ArtStation, trending aesthetic' },
  { label: 'Cyberpunk', prompt: 'cyberpunk neon aesthetic, reflections, rainy night, volumetric fog' },
];

const QUICK_CREATE_PROMPTS = [
  'A majestic golden eagle perched on a mountain peak at sunrise, volumetric fog, 8k',
  'A cozy retro coffee shop in rainy Tokyo with glowing warm lanterns and reflections',
  'Futuristic electric sports car cruising through a neon desert highway at twilight',
  'A high-fashion studio portrait of a woman in an emerald green silk dress, dramatic rim lighting',
];

const QUICK_EDIT_PROMPTS = [
  'Add cinematic golden hour sunset lighting with soft amber rim lights and lens flare',
  'Change the background to a breathtaking modern minimalist architecture luxury studio',
  'Transform this into a vibrant Japanese anime illustration with rich hand-drawn aesthetics',
  'Add stylish modern aviator sunglasses and enhance portrait contrast',
];

export const NanoBananaPanel: React.FC<NanoBananaPanelProps> = ({
  hasCurrentImage,
  currentImageFile,
  currentImageUrl,
  onImageGenerated,
  isAiProcessing,
  setIsAiProcessing,
  setStatusMessage,
}) => {
  const [tab, setTab] = useState<'create' | 'edit'>(hasCurrentImage ? 'edit' : 'create');
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<NanoBananaModelId>('gemini-3.1-flash-image');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [autoSuperResolution, setAutoSuperResolution] = useState(true);
  const [superResScale, setSuperResScale] = useState<2 | 4>(2);
  const [melaninGuardEnabled, setMelaninGuardEnabled] = useState(true);
  const [recentCreations, setRecentCreations] = useState<
    Array<{ url: string; prompt: string; blob: Blob; meta: ImageMetadata }>
  >([]);

  // Reference images
  const [references, setReferences] = useState<ReferenceImageSlot[]>([
    { id: 'ref1', label: 'Reference 1 (Clothing/Subject)', roleHint: 'clothing' },
    { id: 'ref2', label: 'Reference 2 (Background Setting)', roleHint: 'background' },
    { id: 'ref3', label: 'Reference 3 (Lighting/Palette)', roleHint: 'lighting' },
  ]);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const handleRefFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setReferences((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], file, previewUrl };
      return copy;
    });
  };

  const removeReference = (index: number) => {
    setReferences((prev) => {
      const copy = [...prev];
      if (copy[index].previewUrl) {
        URL.revokeObjectURL(copy[index].previewUrl!);
      }
      copy[index] = { ...copy[index], file: undefined, previewUrl: undefined };
      return copy;
    });
  };

  const handleGenerate = async (overridePrompt?: string) => {
    const textToUse = (overridePrompt || prompt || QUICK_CREATE_PROMPTS[0]).trim();
    if (!textToUse) return;

    setIsAiProcessing(true);
    setStatusMessage('Nano Banana is generating your image...');

    try {
      let finalPrompt = textToUse;
      if (selectedStyle) {
        const styleObj = STYLES.find((s) => s.label === selectedStyle);
        if (styleObj) finalPrompt += `, ${styleObj.prompt}`;
      }

      const result = await ApiClient.generateNanoBanana({
        prompt: finalPrompt,
        aspectRatio,
        imageSize,
        model: selectedModel,
        autoSuperResolution,
        scale: superResScale,
        skinToneProtection: melaninGuardEnabled,
      });

      const newUrl = URL.createObjectURL(result.blob);
      const generatedFile = new File([result.blob], `nano_banana_${Date.now()}.png`, {
        type: 'image/png',
      });

      setRecentCreations((prev) => [
        { url: newUrl, prompt: finalPrompt, blob: result.blob, meta: result.metadata },
        ...prev.slice(0, 9),
      ]);

      onImageGenerated(generatedFile, newUrl, result.metadata, false);
      setStatusMessage(
        `✓ Generated in ${(result.processingTimeMs / 1000).toFixed(1)}s using ${
          result.provider || 'Nano Banana'
        }`
      );
    } catch (err: any) {
      console.error('[NanoBanana] Generation error:', err);
      setStatusMessage(`Generation failed: ${err.message || err}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleEdit = async (overridePrompt?: string) => {
    const textToUse = (overridePrompt || prompt || QUICK_EDIT_PROMPTS[0]).trim();
    if (!textToUse) return;

    let targetFile = currentImageFile;
    if (!targetFile && currentImageUrl) {
      try {
        const resp = await fetch(currentImageUrl);
        const b = await resp.blob();
        targetFile = new File([b], 'current_image.png', { type: b.type || 'image/png' });
      } catch (e) {
        console.warn('Could not read current image:', e);
      }
    }

    if (!targetFile) {
      setStatusMessage('Please load or upload an image first.');
      return;
    }

    setIsAiProcessing(true);
    setStatusMessage('Nano Banana is editing your image...');

    try {
      const activeRefs = references
        .filter((r): r is ReferenceImageSlot & { file: File } => Boolean(r.file))
        .map((r) => ({ file: r.file, label: `${r.label} (${r.roleHint})` }));

      const result = await ApiClient.editNanoBanana({
        file: targetFile,
        prompt: textToUse,
        model: selectedModel,
        references: activeRefs.length > 0 ? activeRefs : undefined,
        autoSuperResolution,
        scale: superResScale,
        skinToneProtection: melaninGuardEnabled,
      });

      const newUrl = URL.createObjectURL(result.blob);
      const editedFile = new File([result.blob], `nano_edit_${Date.now()}.png`, {
        type: 'image/png',
      });

      setRecentCreations((prev) => [
        { url: newUrl, prompt: textToUse, blob: result.blob, meta: result.metadata },
        ...prev.slice(0, 9),
      ]);

      onImageGenerated(editedFile, newUrl, result.metadata, true);
      setStatusMessage(
        `✓ Edited in ${(result.processingTimeMs / 1000).toFixed(1)}s using ${
          result.provider || 'Nano Banana'
        }`
      );
    } catch (err: any) {
      console.error('[NanoBanana] Edit error:', err);
      setStatusMessage(`Edit failed: ${err.message || err}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const activeModelMeta =
    NANO_BANANA_MODELS.find((m) => m.id === selectedModel) || NANO_BANANA_MODELS[1];

  return (
    <div className="space-y-5">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍌</span>
            <span className="text-sm font-bold text-amber-300 font-mono tracking-wide">
              Nano Banana Generative Engine
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Google Gemini native generative & editing engine with multi-reference composition and 4K super-resolution.
        </p>
      </div>

      {/* Model Selector Card */}
      <div className="p-3 bg-dark-900/90 border border-dark-700/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Model Selection
          </span>
          <span className="text-[11px] text-amber-400 font-mono font-medium">
            {activeModelMeta.speed}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {NANO_BANANA_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m.id)}
              className={`py-2 px-2 rounded-lg text-left transition border ${
                selectedModel === m.id
                  ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-sm'
                  : 'bg-dark-800/60 border-dark-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-[11px] font-bold truncate">{m.name}</div>
              <div className="text-[9px] text-amber-400/90 truncate">{m.badge}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 leading-tight pt-1">
          {activeModelMeta.description}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-dark-900/80 p-1 rounded-xl border border-dark-700/60">
        <button
          onClick={() => setTab('edit')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition ${
            tab === 'edit'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Edit Image</span>
        </button>
        <button
          onClick={() => setTab('create')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition ${
            tab === 'create'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Text-to-Image</span>
        </button>
      </div>

      {/* Multi-Image Reference Slots (shown for both create and edit) */}
      <div className="p-3 bg-dark-900/70 border border-dark-700/70 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Reference Images (Up to 3 Slots)
          </span>
          <span className="text-[10px] text-slate-400">e.g., Image 1: Clothing • Image 2: Background</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {references.map((slot, idx) => (
            <div
              key={slot.id}
              className={`relative border rounded-lg p-1.5 flex flex-col items-center justify-center transition min-h-[64px] ${
                slot.previewUrl
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-dashed border-dark-700 hover:border-dark-600 bg-dark-800/40'
              }`}
            >
              {slot.previewUrl ? (
                <div className="w-full flex items-center gap-1.5">
                  <img
                    src={slot.previewUrl}
                    alt={slot.label}
                    className="w-10 h-10 object-cover rounded border border-dark-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-slate-200 block truncate">
                      Ref {idx + 1}
                    </span>
                    <span className="text-[9px] text-amber-400/90 block truncate">
                      {slot.roleHint}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReference(idx)}
                    className="p-0.5 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (idx === 0) fileInputRef1.current?.click();
                    if (idx === 1) fileInputRef2.current?.click();
                    if (idx === 2) fileInputRef3.current?.click();
                  }}
                  className="w-full flex flex-col items-center justify-center py-0.5 text-slate-400 hover:text-slate-200 transition"
                >
                  <Plus className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-400">Ref {idx + 1}</span>
                </button>
              )}
            </div>
          ))}

          <input
            ref={fileInputRef1}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleRefFileChange(0, e)}
          />
          <input
            ref={fileInputRef2}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleRefFileChange(1, e)}
          />
          <input
            ref={fileInputRef3}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleRefFileChange(2, e)}
          />
        </div>
      </div>

      {/* Tab: Create New */}
      {tab === 'create' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Prompt</label>
              {prompt && (
                <button
                  onClick={() => setPrompt('')}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create with Nano Banana..."
              rows={3}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`py-1.5 rounded-lg text-center transition border ${
                    aspectRatio === ar.value
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-dark-900 border-dark-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-mono">{ar.label}</div>
                  <div className="text-[9px] opacity-75">{ar.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolutions */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Resolution</label>
            <div className="grid grid-cols-4 gap-1.5">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.label}
                  onClick={() => setImageSize(res.label)}
                  className={`py-1.5 rounded-lg text-center transition border ${
                    imageSize === res.label
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-dark-900 border-dark-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-mono">{res.label}</div>
                  <div className="text-[9px] opacity-75">{res.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetic Styles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Style Preset</label>
              {selectedStyle && (
                <button
                  type="button"
                  onClick={() => setSelectedStyle(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {STYLES.map((st) => (
                <button
                  key={st.label}
                  type="button"
                  onClick={() => setSelectedStyle(selectedStyle === st.label ? null : st.label)}
                  className={`py-1.5 px-2 rounded-lg text-left text-xs transition border truncate ${
                    selectedStyle === st.label
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-dark-900 border-dark-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Melanin Guard Toggle */}
          <div className="p-2.5 bg-dark-900 border border-dark-700 rounded-xl flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={melaninGuardEnabled}
                onChange={(e) => setMelaninGuardEnabled(e.target.checked)}
                className="rounded bg-dark-800 border-dark-700 text-amber-500 w-3.5 h-3.5"
              />
              <span className="text-amber-300/90 font-medium">Melanin Guard Calibration</span>
            </label>
          </div>

          {/* Chained Super-Resolution */}
          <div className="p-2.5 bg-dark-900 border border-dark-700 rounded-xl flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={autoSuperResolution}
                onChange={(e) => setAutoSuperResolution(e.target.checked)}
                className="rounded bg-dark-800 border-dark-700 text-amber-500 w-3.5 h-3.5"
              />
              <span>Auto Real-ESRGAN Super-Res</span>
            </label>
            {autoSuperResolution && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSuperResScale(2)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    superResScale === 2 ? 'bg-amber-500 text-white' : 'bg-dark-800 text-slate-400'
                  }`}
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={() => setSuperResScale(4)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    superResScale === 4 ? 'bg-amber-500 text-white' : 'bg-dark-800 text-slate-400'
                  }`}
                >
                  4x
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isAiProcessing}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
              isAiProcessing
                ? 'bg-dark-800 text-slate-500 cursor-not-allowed border border-dark-700'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20 hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            {isAiProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Generating with Nano Banana...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Image</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab: Edit Image */}
      {tab === 'edit' && (
        <div className="space-y-4">
          {!hasCurrentImage && !currentImageUrl ? (
            <div className="p-4 bg-dark-900 border border-dark-700 rounded-xl text-center space-y-2">
              <span className="text-2xl">🖼️</span>
              <div className="text-xs font-semibold text-slate-300">No Image Selected</div>
              <p className="text-[11px] text-slate-400">
                Please upload or select an image in the workspace to perform natural-language edits.
              </p>
            </div>
          ) : (
            <>
              {currentImageUrl && (
                <div className="flex items-center space-x-3 p-2.5 bg-dark-900 border border-dark-700 rounded-xl">
                  <img
                    src={currentImageUrl}
                    alt="Active target"
                    className="w-14 h-14 rounded-lg object-cover border border-dark-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {currentImageFile?.name || 'Active Canvas Image'}
                    </div>
                    <div className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Subject locked for preservation
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Edit Instructions</label>
                  {prompt && (
                    <button
                      onClick={() => setPrompt('')}
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Add warm golden hour lighting, sunglasses, change background to a luxury studio, or 'Use Ref 1 for clothing, Ref 2 for background'..."
                  rows={3}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* Chained Super-Resolution */}
              <div className="p-2.5 bg-dark-900 border border-dark-700 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoSuperResolution}
                    onChange={(e) => setAutoSuperResolution(e.target.checked)}
                    className="rounded bg-dark-800 border-dark-700 text-amber-500 w-3.5 h-3.5"
                  />
                  <span>Chained Real-ESRGAN Super-Res</span>
                </label>
                {autoSuperResolution && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSuperResScale(2)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        superResScale === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      2x
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuperResScale(4)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        superResScale === 4
                          ? 'bg-amber-500 text-white'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      4x
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Edit Ideas</span>
                </div>
                <div className="space-y-1">
                  {QUICK_EDIT_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(p)}
                      className="text-left w-full text-[11px] text-slate-400 hover:text-amber-300 bg-dark-900/30 hover:bg-dark-800/60 p-1.5 rounded-lg border border-dark-800 transition line-clamp-1"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleEdit()}
                disabled={isAiProcessing}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
                  isAiProcessing
                    ? 'bg-dark-800 text-slate-500 cursor-not-allowed border border-dark-700'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20 hover:brightness-110 active:scale-[0.99]'
                }`}
              >
                {isAiProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                    <span>Modifying with Nano Banana...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Apply Nano Banana Edit</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Recent History Strip */}
      {recentCreations.length > 0 && (
        <div className="pt-2 border-t border-dark-800">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Session Generations</span>
            <span className="text-[10px] text-amber-400 font-mono">{recentCreations.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {recentCreations.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const file = new File([item.blob], `nano_banana_${idx}.png`, {
                    type: 'image/png',
                  });
                  onImageGenerated(file, item.url, item.meta, false);
                }}
                className="group relative rounded-lg overflow-hidden border border-dark-700 aspect-square hover:border-amber-500 transition"
                title={item.prompt}
              >
                <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-[10px] text-amber-300 font-bold">Use</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
