import React from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Cpu,
  Layers,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import { SpidyLogo } from './SpidyLogo';

interface HeaderProps {
  hasImage: boolean;
  isDropzoneView: boolean;
  onToggleView: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onOpenExport: () => void;
  onOpenContact?: () => void;
  onOpenNanoBanana?: () => void;
  onOpenBatchQueue?: () => void;
  batchQueueCount?: number;
  onOpenPresets?: () => void;
  presetCount?: number;
  isProcessing: boolean;
  gpuStatus?: string;
  isBackendConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasImage,
  isDropzoneView,
  onToggleView,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onOpenExport,
  onOpenContact,
  onOpenNanoBanana,
  onOpenBatchQueue,
  batchQueueCount = 0,
  onOpenPresets,
  presetCount,
  isProcessing,
  gpuStatus = 'Ready',
}) => {
  return (
    <header
      className="w-full h-16 border-b border-obsidian-700/60 bg-obsidian-950/80 backdrop-blur-xl px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none"
      data-purpose="primary-navigation"
    >
      {/* Left Logo & Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 min-w-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => {
            if (!isDropzoneView) onToggleView();
          }}
          title="SPIDY Enhancer Home"
        >
          <div className="w-9 h-9 rounded-xl bg-black border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-white/40">
            <SpidyLogo className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-extrabold text-base sm:text-lg tracking-wider">SPIDY</span>
            <span className="text-white font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Enhancer</span>
          </div>
        </div>

        {/* Mode Badge Pill */}
        <div className="hidden sm:flex items-center bg-obsidian-800 border border-obsidian-700/80 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-300 gap-1.5 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="tracking-wide text-[11px]">AI + PRO MANUAL</span>
        </div>

        {/* Pipeline Status Chips */}
        <div className="hidden lg:flex items-center gap-2 ml-1">
          {/* Vulkan Engine Badge */}
          <div className="flex items-center gap-1.5 bg-obsidian-850/90 border border-emerald-900/40 text-slate-300 text-xs px-2.5 py-1 rounded-full">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">Engine:</span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">
              Real-ESRGAN (NCNN)
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">{gpuStatus}</span>
          </div>

          {/* Melanin Guard Badge */}
          <div className="flex items-center gap-1.5 bg-melanin-500/10 border border-melanin-500/30 text-melanin-400 text-xs px-2.5 py-1 rounded-full shadow-glow-amber/20">
            <span className="font-bold text-[9px] bg-melanin-500/20 px-1 py-0.5 rounded text-amber-300 font-mono">
              IN
            </span>
            <span className="text-amber-200/90 font-medium text-[11px]">Melanin Guard:</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Active</span>
          </div>
        </div>
      </div>

      {/* Center/Right Workstation Actions & Modal Triggers */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Undo / Redo / Reset Group (Shown when on Workstation) */}
        {!isDropzoneView && (
          <div className="hidden sm:flex items-center bg-obsidian-850 border border-obsidian-700/60 rounded-lg p-0.5 text-slate-300 shadow-sm">
            <button
              aria-label="Undo action"
              onClick={onUndo}
              disabled={!canUndo || isProcessing}
              className="p-1.5 hover:bg-obsidian-700 hover:text-white rounded text-slate-400 transition disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              aria-label="Redo action"
              onClick={onRedo}
              disabled={!canRedo || isProcessing}
              className="p-1.5 hover:bg-obsidian-700 hover:text-white rounded text-slate-400 transition disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-obsidian-700 mx-0.5"></div>
            <button
              onClick={onReset}
              disabled={isProcessing}
              className="px-2 py-1 text-xs font-medium hover:bg-obsidian-700 hover:text-white rounded text-slate-400 transition"
              title="Reset All Adjustments"
            >
              Reset
            </button>
          </div>
        )}

        {/* View Switcher (Workspace vs Reference Dropzone) */}
        <button
          onClick={onToggleView}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 hover:text-white border border-obsidian-700 rounded-lg transition shadow-sm"
          title="Toggle between Upload Landing & Workspace"
        >
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="hidden xs:inline sm:inline">{isDropzoneView ? 'Studio Workspace' : 'Dropzone View'}</span>
        </button>

        {/* Presets Button */}
        {onOpenPresets && (
          <button
            onClick={onOpenPresets}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-obsidian-700 rounded-lg transition"
            title="Preset Library"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Presets</span>
            {presetCount !== undefined && presetCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-obsidian-700 text-slate-300 font-mono text-[10px]">
                {presetCount}
              </span>
            )}
          </button>
        )}

        {/* Batch Queue Button */}
        {onOpenBatchQueue && (
          <button
            onClick={onOpenBatchQueue}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-obsidian-700 rounded-lg transition"
            title="Batch Processing Queue"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Batch</span>
            {batchQueueCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold">
                {batchQueueCount}
              </span>
            )}
          </button>
        )}

        {/* Nano Banana 2 Button */}
        {onOpenNanoBanana && (
          <button
            onClick={onOpenNanoBanana}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg transition shadow-sm"
            title="Nano Banana 2 Generation"
          >
            <span>🍌</span>
            <span className="hidden sm:inline">Nano Banana</span>
          </button>
        )}

        {/* Contact Front-End Trigger */}
        {onOpenContact && (
          <button
            onClick={onOpenContact}
            className="hidden xl:inline-flex px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 rounded-lg transition items-center gap-1.5"
            title="Contact Support & Engineering"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Contact</span>
          </button>
        )}

        {/* Primary Glowing Export CTA */}
        <button
          onClick={onOpenExport}
          disabled={isProcessing || !hasImage}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-brand-600 to-blue-500 hover:from-brand-500 hover:to-blue-400 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-glow-blue transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K</span>
        </button>
      </div>
    </header>
  );
};
