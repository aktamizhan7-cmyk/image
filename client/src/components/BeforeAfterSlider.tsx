import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ManualAdjustmentSettings } from '../types';
import { ManualImageProcessor } from '../services/manualEngine';

// Default mock SVGs from the design specification when no image is loaded
const DEFAULT_ENHANCED_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='860' height='540' viewBox='0 0 860 540'%3E%3Cdefs%3E%3ClinearGradient id='skin' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23884d28'/%3E%3Cstop offset='50%25' stop-color='%23b26c39'/%3E%3Cstop offset='100%25' stop-color='%23643419'/%3E%3C/linearGradient%3E%3CradialGradient id='rim' cx='70%25' cy='30%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23f59e0b' stop-opacity='0.4'/%3E%3Cstop offset='100%25' stop-color='%230a0d14' stop-opacity='0.9'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='860' height='540' fill='%230f1420'/%3E%3Ccircle cx='430' cy='240' r='180' fill='url(%23skin)'/%3E%3Ccircle cx='430' cy='240' r='220' fill='url(%23rim)'/%3E%3Ctext x='430' y='245' font-family='sans-serif' font-size='22' font-weight='700' fill='%23ffffff' text-anchor='middle'%3E4K Neural Enhanced &amp; Melanin Preserved%3C/text%3E%3Ctext x='430' y='280' font-family='monospace' font-size='14' fill='%23fbbf24' text-anchor='middle'%3ETrue Melanin Radiance (Zero Chalkiness)%3C/text%3E%3C/svg%3E`;

const DEFAULT_ORIGINAL_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='860' height='540' viewBox='0 0 860 540'%3E%3Cdefs%3E%3Cfilter id='blur-noise'%3E%3CfeGaussianBlur stdDeviation='2.5'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='860' height='540' fill='%23182133'/%3E%3Ccircle cx='430' cy='240' r='180' fill='%23704222' filter='url(%23blur-noise)'/%3E%3Ctext x='430' y='245' font-family='sans-serif' font-size='22' font-weight='600' fill='%2394a3b8' text-anchor='middle'%3EOriginal Low-Res / Chalky 1080p%3C/text%3E%3Ctext x='430' y='280' font-family='monospace' font-size='14' fill='%2364748b' text-anchor='middle'%3EStandard Camera Output (Compressed)%3C/text%3E%3C/svg%3E`;

interface BeforeAfterSliderProps {
  originalUrl?: string | null;
  enhancedUrl?: string | null;
  manualSettings: ManualAdjustmentSettings;
  originalDimensions?: { width: number; height: number };
  enhancedDimensions?: { width: number; height: number };
  isProcessing?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  enhancedUrl,
  manualSettings,
  originalDimensions,
  enhancedDimensions,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);

  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Compute CSS filter for manual enhancements
  const cssFilter = ManualImageProcessor.getCssFilter(manualSettings);

  const displayOriginal = originalUrl || DEFAULT_ORIGINAL_SVG;
  const displayEnhanced = enhancedUrl || originalUrl || DEFAULT_ENHANCED_SVG;

  // Split handle drag logic
  const updateSplitPosition = useCallback((clientX: number) => {
    if (!imageWrapperRef.current) return;
    const rect = imageWrapperRef.current.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    const percentage = (offsetX / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateSplitPosition(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      updateSplitPosition(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, updateSplitPosition]);

  // Zoom controls
  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(250, prev + 20));
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(50, prev - 20));
  };

  const handleZoomFit = () => {
    setCurrentZoom(100);
  };

  // Dimensions formatted
  const origDimStr = originalDimensions
    ? `${originalDimensions.width}×${originalDimensions.height}`
    : '1920×1080';
  const enhDimStr = enhancedDimensions
    ? `${enhancedDimensions.width}×${enhancedDimensions.height}`
    : '7680×4320';

  return (
    <div
      className="flex-1 flex flex-col bg-obsidian-950/90 relative border-r border-obsidian-800/80 overflow-hidden select-none"
      data-purpose="viewport-container"
    >
      {/* Canvas Toolbar */}
      <div className="h-10 bg-obsidian-900/90 border-b border-obsidian-800 px-4 flex items-center justify-between z-20 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>4K Vulkan Canvas Stream</span>
          </span>
          <span className="bg-obsidian-800 text-[11px] px-2 py-0.5 rounded border border-obsidian-700 text-slate-400 font-mono">
            60 FPS
          </span>
        </div>

        {/* Split View Info */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Left: Original (1080p)
          </span>
          <span className="text-blue-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span> Right: Super-Res (4K AI) + Graded
          </span>
        </div>

        {/* Zoom / Fit Controls */}
        <div className="flex items-center gap-1 bg-obsidian-850 p-0.5 rounded border border-obsidian-700">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-obsidian-700 rounded text-slate-300 transition"
            title="Zoom Out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="5" x2="19" y1="12" y2="12"></line>
            </svg>
          </button>
          <span className="px-1.5 text-[11px] font-mono text-slate-300 min-w-[3rem] text-center">
            {currentZoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-obsidian-700 rounded text-slate-300 transition"
            title="Zoom In"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" x2="12" y1="5" y2="19"></line>
              <line x1="5" x2="19" y1="12" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={handleZoomFit}
            className="px-2 py-0.5 text-[10px] font-semibold bg-obsidian-700 hover:bg-obsidian-600 rounded text-blue-300 ml-1 transition"
          >
            FIT
          </button>
        </div>
      </div>

      {/* Interactive Split Canvas Stage */}
      <div
        className="flex-1 relative w-full h-full flex items-center justify-center p-4 select-none overflow-hidden bg-[radial-gradient(#1e263d_1px,transparent_1px)] [background-size:16px_16px]"
        id="split-stage"
      >
        <div
          ref={imageWrapperRef}
          style={{
            transform: `scale(${currentZoom / 100})`,
            width: '860px',
            height: '540px',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="relative rounded-lg overflow-hidden shadow-2xl border border-obsidian-700/80 transition-transform duration-100"
        >
          {/* Layer 1: Enhanced (Right Side under-layer with CSS filters) */}
          <div className="absolute inset-0 w-full h-full overflow-hidden" id="enhanced-layer">
            <img
              src={displayEnhanced}
              alt="Enhanced 4K Preview"
              style={{ filter: cssFilter }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Enhanced Overlay Badge */}
            <span className="absolute top-4 right-4 bg-brand-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg backdrop-blur-md border border-blue-400/40">
              Enhanced 4K (Melanin Safe)
            </span>
          </div>

          {/* Layer 2: Original (Left Side clipped by slider percentage) */}
          <div
            className="absolute inset-0 h-full overflow-hidden border-r-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={displayOriginal}
              alt="Original Raw Preview"
              style={{ width: '860px', maxWidth: 'none' }}
              className="absolute top-0 left-0 h-full object-cover select-none pointer-events-none"
            />
            {/* Original Overlay Badge */}
            <span className="absolute top-4 left-4 bg-obsidian-950/80 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg backdrop-blur-md border border-obsidian-700">
              Original 1080p
            </span>
          </div>

          {/* Slider Divider Handle */}
          <div
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="absolute top-0 bottom-0 cursor-ew-resize flex items-center justify-center -ml-4 w-8 z-30 select-none"
          >
            <div className="w-7 h-7 rounded-full bg-white text-obsidian-900 shadow-glow-blue flex items-center justify-center border-2 border-brand-500 transform active:scale-110 transition-transform hover:scale-105">
              <svg className="w-3.5 h-3.5 text-obsidian-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m9 18-6-6 6-6M15 6l6 6-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Bottom Status Bar */}
      <div className="h-9 bg-obsidian-950 border-t border-obsidian-800 px-4 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-400">
            Dim: <strong className="text-slate-200">{origDimStr}</strong> →{' '}
            <strong className="text-blue-400">{enhDimStr}</strong>
          </span>
          <span className="text-obsidian-700">|</span>
          <span className="font-mono">
            Color: <strong className="text-amber-400">DCI-P3 10-bit Melanin Calibrated</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> NCNN Vulkan GPU Active
          </span>
        </div>
      </div>
    </div>
  );
};
