import { useState } from 'react';
import { X, Download, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  originalDimensions?: { width: number; height: number };
  enhancedDimensions?: { width: number; height: number };
  hasAiApplied: boolean;
  hasManualApplied: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  originalDimensions,
  enhancedDimensions,
  hasAiApplied,
  hasManualApplied,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentDims = enhancedDimensions || originalDimensions || { width: 0, height: 0 };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await onExport({ format, quality });
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-brand-400" />
          Export Enhanced Image
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          High-resolution rendering with all AI enhancements & manual color grades baked in.
        </p>

        {/* Image Spec summary */}
        <div className="p-3 rounded-2xl bg-dark-950 border border-dark-800 mb-6 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">OUTPUT RESOLUTION</span>
            <span className="text-brand-300 font-bold text-sm">
              {currentDims.width} × {currentDims.height} px
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasAiApplied && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-sans font-semibold border border-brand-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI 4K
              </span>
            )}
            {hasManualApplied && (
              <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 text-[10px] font-sans font-semibold border border-accent-500/30 flex items-center gap-1">
                <Sliders className="w-2.5 h-2.5" /> Graded
              </span>
            )}
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition ${
                  format === 'png'
                    ? 'border-brand-500 bg-brand-500/15 text-white shadow-md shadow-brand-500/10'
                    : 'border-dark-700 bg-dark-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>PNG</span>
                <span className="text-[10px] font-normal text-slate-400">Lossless</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition ${
                  format === 'jpeg'
                    ? 'border-brand-500 bg-brand-500/15 text-white shadow-md shadow-brand-500/10'
                    : 'border-dark-700 bg-dark-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>JPG / JPEG</span>
                <span className="text-[10px] font-normal text-slate-400">Compact</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('webp')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition ${
                  format === 'webp'
                    ? 'border-brand-500 bg-brand-500/15 text-white shadow-md shadow-brand-500/10'
                    : 'border-dark-700 bg-dark-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>WebP</span>
                <span className="text-[10px] font-normal text-slate-400">Modern Web</span>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPG & WebP) */}
          {format !== 'png' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Export Quality</span>
                <span className="font-mono text-brand-400 text-xs font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>Smaller File</span>
                <span>Maximum Quality</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-slate-200 bg-dark-800 hover:bg-dark-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-[2] py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 active:scale-[0.98] shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering High-Res Export...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
