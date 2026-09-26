import React, { useState } from 'react';
import { X, Download, CheckCircle2 } from 'lucide-react';
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
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(98);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentDims = enhancedDimensions || originalDimensions || { width: 7680, height: 4320 };
  const width = currentDims.width || 7680;
  const height = currentDims.height || 4320;
  const estMb = ((quality / 100) * 18.8).toFixed(1);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity duration-300 select-none"
      data-purpose="export-configuration-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-obsidian-900 border border-obsidian-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden transform scale-100 transition-all">
        {/* Top glowing ambient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-brand-400 to-amber-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Export Enhanced Image</h3>
              <p className="text-xs text-slate-400">Archival 4K Super-Resolution Render</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Output Summary Box */}
        <div className="bg-obsidian-950/80 border border-obsidian-800 rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Target Resolution:</span>
            <span className="font-mono text-white font-semibold">
              {width} × {height} px <span className="text-blue-400">(4K Ultra)</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Color Spectrum:</span>
            <span className="font-mono text-amber-400 font-semibold">DCI-P3 10-Bit Indian Melanin Safe</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Active Passes:</span>
            <div className="flex gap-1.5">
              <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-700/50">
                AI 4X
              </span>
              <span className="bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-700/50">
                Graded
              </span>
            </div>
          </div>
        </div>

        {/* Export Format Selector */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Output Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat('png')}
              className={`export-format-btn p-3 text-center rounded-xl border transition ${
                format === 'png'
                  ? 'active border-brand-500 bg-brand-600/20 text-white'
                  : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-bold text-sm">PNG</div>
              <div className="text-[10px] text-blue-300">Lossless Archival</div>
            </button>
            <button
              type="button"
              onClick={() => setFormat('jpeg')}
              className={`export-format-btn p-3 text-center rounded-xl border transition ${
                format === 'jpeg'
                  ? 'active border-brand-500 bg-brand-600/20 text-white'
                  : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-bold text-sm">JPEG</div>
              <div className="text-[10px] text-slate-400">Adjustable Q</div>
            </button>
            <button
              type="button"
              onClick={() => setFormat('webp')}
              className={`export-format-btn p-3 text-center rounded-xl border transition ${
                format === 'webp'
                  ? 'active border-brand-500 bg-brand-600/20 text-white'
                  : 'border-obsidian-700 bg-obsidian-850 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-bold text-sm">WebP</div>
              <div className="text-[10px] text-slate-400">High Efficiency</div>
            </button>
          </div>
        </div>

        {/* Quality Slider */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Export Quality</span>
            <span className="font-mono text-blue-400" id="export-quality-val">
              {quality}%
            </span>
          </div>
          <input
            className="w-full"
            max="100"
            min="60"
            type="range"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Smaller footprint</span>
            <span className="text-slate-300 font-mono" id="est-size">
              Est. size: ~{estMb} MB
            </span>
          </div>
        </div>

        {/* Engine Status Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 text-xs mb-6">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Real-time Canvas + Vulkan Neural Pass Baking ready</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-obsidian-700 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>Packaging Lossless 4K...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download 4K Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
