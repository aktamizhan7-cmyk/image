import React from 'react';
import {
  Sparkles,
  UploadCloud,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  hasImage: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onNewImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onOpenExport: () => void;
  isProcessing: boolean;
  gpuStatus?: string;
  statusMessage?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  hasImage,
  canUndo,
  canRedo,
  onNewImage,
  onUndo,
  onRedo,
  onReset,
  onOpenExport,
  isProcessing,
  gpuStatus = 'Vulkan GPU Active',
  statusMessage,
}) => {
  return (
    <header className="h-16 border-b border-dark-700/60 bg-dark-950/80 backdrop-blur-md px-5 flex items-center justify-between z-30 select-none">
      {/* Brand & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Lumina<span className="text-brand-400 font-extrabold">Enhance</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                AI + Pro Manual
              </span>
            </h1>
          </div>
        </div>

        {/* Hardware badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-dark-900 border border-dark-700/60 text-xs text-slate-300 font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-400">Engine:</span>
          <span className="text-emerald-300 text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {gpuStatus}
          </span>
        </div>

        {/* Indian Skin Tone & Melanin Protection badge */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
          <span>🇮🇳</span>
          <span className="text-[11px] font-semibold text-amber-200">Melanin Guard:</span>
          <span className="text-amber-300 text-[11px] font-medium">Active</span>
        </div>

        {statusMessage && (
          <div className="hidden lg:flex items-center px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] font-mono">
            {statusMessage}
          </div>
        )}
      </div>


      {/* Center Actions: History Controls */}
      {hasImage && (
        <div className="flex items-center space-x-1 bg-dark-900/90 border border-dark-700/70 p-1 rounded-xl shadow-inner">
          <button
            onClick={onUndo}
            disabled={!canUndo || isProcessing}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || isProcessing}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-dark-700 mx-1" />
          <button
            onClick={onReset}
            disabled={isProcessing}
            title="Reset All Adjustments"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-dark-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {hasImage ? (
          <>
            <button
              onClick={onNewImage}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-300 hover:text-white bg-dark-900 hover:bg-dark-800 border border-dark-700/80 transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>New Image</span>
            </button>
            <button
              onClick={onOpenExport}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-1.5 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 shadow-md shadow-brand-500/20 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500">Ready to enhance</span>
        )}
      </div>
    </header>
  );
};
