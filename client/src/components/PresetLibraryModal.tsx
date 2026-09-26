import React, { useState, useRef } from 'react';
import {
  Bookmark,
  X,
  Search,
  Check,
  Trash2,
  Copy,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Plus,
  Edit2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import {
  AdjustmentPreset,
  ManualAdjustmentSettings,
  EnhancementOptions,
} from '../types';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPresets: AdjustmentPreset[];
  userPresets: AdjustmentPreset[];
  activePresetId: string | null;
  onApplyPreset: (preset: AdjustmentPreset) => void;
  onOpenSaveModal: (presetToEdit?: AdjustmentPreset) => void;
  onDeletePreset: (id: string) => void;
  onDuplicatePreset: (id: string) => void;
  onExportPresets: (presetsToExport?: AdjustmentPreset[]) => void;
  onImportPresetsFile: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  currentManualSettings: ManualAdjustmentSettings;
  currentEnhancementOptions: EnhancementOptions;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Presets' },
  { id: 'custom', label: 'My Custom' },
  { id: 'portrait', label: 'Portrait & Skin' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'monochrome', label: 'B&W' },
];

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  allPresets,
  userPresets,
  activePresetId,
  onApplyPreset,
  onOpenSaveModal,
  onDeletePreset,
  onDuplicatePreset,
  onExportPresets,
  onImportPresetsFile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter presets by category and search
  const filteredPresets = allPresets.filter((preset) => {
    if (selectedCategory === 'custom' && preset.isBuiltIn) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'custom' && preset.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = preset.name.toLowerCase().includes(q);
      const matchDesc = preset.description?.toLowerCase().includes(q);
      const matchTag = preset.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const res = await onImportPresetsFile(file);
      if (res.success) {
        setFeedbackMsg({
          text: `Successfully imported ${res.count} ${res.count === 1 ? 'preset' : 'presets'}!`,
          type: 'success',
        });
      } else {
        setFeedbackMsg({
          text: res.error || 'Failed to import preset file',
          type: 'error',
        });
      }
      setTimeout(() => setFeedbackMsg(null), 4000);
      e.target.value = '';
    }
  };

  const renderPresetSummaryPills = (preset: AdjustmentPreset) => {
    const pills: string[] = [];
    const m = preset.manualSettings;
    const ai = preset.enhancementOptions;

    if (m?.temperature) pills.push(`Temp ${m.temperature > 0 ? '+' : ''}${m.temperature}`);
    if (m?.contrast) pills.push(`Contrast ${m.contrast > 0 ? '+' : ''}${m.contrast}`);
    if (m?.saturation) pills.push(`Sat ${m.saturation > 0 ? '+' : ''}${m.saturation}`);
    if (m?.clarity) pills.push(`Clarity ${m.clarity > 0 ? '+' : ''}${m.clarity}`);
    if (m?.melaninWarmth) pills.push(`Melanin ${m.melaninWarmth}%`);
    if (m?.sharpness) pills.push(`Sharp ${m.sharpness}%`);
    if (ai?.scale) pills.push(`${ai.scale}× Scale`);
    if (ai?.sharpenStrength) pills.push(`Sharp ${ai.sharpenStrength}%`);

    return pills.slice(0, 4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-dark-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-dark-950 border border-dark-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">Preset Library</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {allPresets.length} Configs Available
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse, load, save, and export your favorite color grading & AI enhancement presets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenSaveModal()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-brand-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2 text-xs font-medium border-b flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="hover:opacity-75">
              ×
            </button>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-dark-800/80 bg-dark-900/40 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search presets by name, category, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-900 border border-dark-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Backup / Export / Import buttons */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 border border-dark-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Import Presets from JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={() => onExportPresets()}
              className="px-3 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 border border-dark-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Export all custom presets as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Export Presets</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Tabs */}
        <div className="px-6 py-2 border-b border-dark-800 bg-dark-900/20 overflow-x-auto flex items-center space-x-1 scrollbar-none text-xs">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Preset Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-dark-600" />
              <div className="text-xs font-semibold text-slate-400">No presets matched your filter</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Try selecting a different category, clearing search terms, or save your current settings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => {
                const isActive = activePresetId === preset.id;
                const pills = renderPresetSummaryPills(preset);

                return (
                  <div
                    key={preset.id}
                    className={`relative rounded-2xl border p-4 flex flex-col justify-between transition group ${
                      isActive
                        ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
                        : 'border-dark-800 bg-dark-900/40 hover:bg-dark-900/70 hover:border-dark-700'
                    }`}
                  >
                    <div>
                      {/* Top row: badge & category & actions */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          {preset.isBuiltIn ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Pro Built-in
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Custom Preset
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-mono text-slate-400">
                            • {preset.category}
                          </span>
                        </div>

                        {/* Top-Right Preset Options */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onDuplicatePreset(preset.id)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-dark-800 transition"
                            title="Duplicate as new preset"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {!preset.isBuiltIn && (
                            <>
                              <button
                                onClick={() => onOpenSaveModal(preset)}
                                className="p-1 rounded text-slate-500 hover:text-brand-300 hover:bg-dark-800 transition"
                                title="Edit preset details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeletePreset(preset.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-dark-800 transition"
                                title="Delete preset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{preset.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500 text-white font-bold">
                            Active
                          </span>
                        )}
                      </h4>

                      {preset.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      )}

                      {/* Summary Parameter Pills */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {pills.map((pill, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 border border-dark-700"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>

                      {/* Tags */}
                      {preset.tags && preset.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2 text-[10px] text-slate-400">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{preset.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Apply Button */}
                    <div className="mt-4 pt-3 border-t border-dark-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        {preset.manualSettings && (
                          <span className="flex items-center gap-1" title="Includes Pro Grading">
                            <Sliders className="w-3 h-3 text-brand-400" />
                            <span>Grading</span>
                          </span>
                        )}
                        {preset.enhancementOptions && (
                          <span className="flex items-center gap-1" title="Includes AI Settings">
                            <Sparkles className="w-3 h-3 text-brand-400" />
                            <span>AI Enhance</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          onApplyPreset(preset);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'bg-dark-800 hover:bg-brand-600 hover:text-white text-slate-200 border border-dark-700'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <span>Apply Preset</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-800 bg-dark-900/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            {userPresets.length} Custom / {allPresets.length} Total Presets
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 font-medium transition"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
};
