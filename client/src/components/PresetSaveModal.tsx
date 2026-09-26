import React, { useState } from 'react';
import { X, BookmarkPlus, Sparkles, Sliders, Check } from 'lucide-react';
import { AdjustmentPreset, ManualAdjustmentSettings, EnhancementOptions, PresetCategory } from '../types';

interface PresetSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualSettings: ManualAdjustmentSettings;
  enhancementOptions: EnhancementOptions;
  onSavePreset: (
    name: string,
    description: string,
    category: PresetCategory,
    manualSettings: Partial<ManualAdjustmentSettings>,
    enhancementOptions?: Partial<EnhancementOptions>,
    existingId?: string,
    tags?: string[]
  ) => void;
  editingPreset?: AdjustmentPreset | null;
}

const CATEGORIES: { id: PresetCategory; label: string }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'monochrome', label: 'B&W' },
];

export const PresetSaveModal: React.FC<PresetSaveModalProps> = ({
  isOpen,
  onClose,
  manualSettings,
  enhancementOptions,
  onSavePreset,
  editingPreset,
}) => {
  const [name, setName] = useState<string>(editingPreset?.name || '');
  const [description, setDescription] = useState<string>(editingPreset?.description || '');
  const [category, setCategory] = useState<PresetCategory>(editingPreset?.category || 'custom');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(editingPreset?.tags || ['Favorite']);
  const [includeManual, setIncludeManual] = useState<boolean>(true);
  const [includeAi, setIncludeAi] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSavePreset(
      name,
      description,
      category,
      includeManual ? manualSettings : {},
      includeAi ? enhancementOptions : undefined,
      editingPreset?.id,
      tags
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-dark-950 border border-dark-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {editingPreset ? 'Edit Preset Configuration' : 'Save Adjustment Preset'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Save your current color grading and AI settings for future one-click use.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Preset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preset Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Golden Amber Sunset, Studio Clean 4K"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Preserves natural melanin warmth with gentle contrast lift..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition border ${
                    category === cat.id
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-bold'
                      : 'bg-dark-900 border-dark-800 text-slate-400 hover:border-dark-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings to include */}
          <div className="space-y-2 pt-1 border-t border-dark-800/80">
            <label className="block text-xs font-semibold text-slate-300">
              Configurations to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIncludeManual(!includeManual)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                  includeManual
                    ? 'border-brand-500 bg-brand-500/10 text-brand-200'
                    : 'border-dark-800 bg-dark-900/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-medium">Pro Grading</span>
                </div>
                {includeManual && <Check className="w-3.5 h-3.5 text-brand-400" />}
              </button>

              <button
                type="button"
                onClick={() => setIncludeAi(!includeAi)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                  includeAi
                    ? 'border-brand-500 bg-brand-500/10 text-brand-200'
                    : 'border-dark-800 bg-dark-900/60 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-medium">AI Enhance</span>
                </div>
                {includeAi && <Check className="w-3.5 h-3.5 text-brand-400" />}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex space-x-1.5 mb-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Portrait, Night, Summer)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-semibold transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 text-[10px] font-mono border border-dark-700"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-dark-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || (!includeManual && !includeAi)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              {editingPreset ? 'Update Preset' : 'Save to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
