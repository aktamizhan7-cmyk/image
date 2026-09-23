import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Eye,
  Move,
} from 'lucide-react';
import { ManualAdjustmentSettings } from '../types';
import { ManualImageProcessor } from '../services/manualEngine';

interface BeforeAfterSliderProps {
  originalUrl: string;
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
  isProcessing,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [holdOriginal, setHoldOriginal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Compute CSS filter for manual enhancements
  const cssFilter = ManualImageProcessor.getCssFilter(manualSettings);

  // Slider dragging logic
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStartSlider = (_e: React.TouchEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderMove(e.clientX);
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPanning(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isPanning, panStart, handleSliderMove]);

  // Pan interaction when zoomed
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Only pan if zoomed and not clicking the slider handle
    if (zoom > 1 && !isDragging) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const effectiveEnhancedUrl = enhancedUrl || originalUrl;
  const isSplitMode = !!enhancedUrl && !holdOriginal;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] relative select-none overflow-hidden">
      {/* Top Floating Viewport Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-dark-900/90 backdrop-blur-md border border-dark-700/80 px-3 py-1.5 rounded-2xl shadow-2xl">
        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium text-slate-300 w-11 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-dark-700 mx-1" />

        <button
          onClick={handleFit}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-dark-800 transition"
          title="Fit to Screen (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {enhancedUrl && (
          <>
            <div className="w-[1px] h-4 bg-dark-700 mx-1" />
            <button
              onMouseDown={() => setHoldOriginal(true)}
              onMouseUp={() => setHoldOriginal(false)}
              onMouseLeave={() => setHoldOriginal(false)}
              onTouchStart={() => setHoldOriginal(true)}
              onTouchEnd={() => setHoldOriginal(false)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                holdOriginal
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-dark-800 text-slate-300 hover:text-white hover:bg-dark-700'
              }`}
              title="Click and hold to view original image"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Hold for Original</span>
            </button>
          </>
        )}
      </div>

      {/* Main Canvas / Image Comparison Area */}
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        className={`flex-1 relative flex items-center justify-center overflow-hidden canvas-checkerboard ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div
          ref={imageWrapperRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-[90%] max-h-[85%] flex items-center justify-center shadow-2xl rounded-lg overflow-hidden"
        >
          {/* Enhanced Image (Background/Right Layer) */}
          <div className="relative">
            <img
              src={effectiveEnhancedUrl}
              alt="Enhanced"
              draggable={false}
              style={{ filter: cssFilter }}
              className="max-w-[85vw] max-h-[75vh] w-auto h-auto object-contain block pointer-events-none select-none"
            />

            {/* Split Mode: Original Image (Foreground/Left Layer with clip-path) */}
            {isSplitMode && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  draggable={false}
                  className="max-w-[85vw] max-h-[75vh] w-auto h-auto object-contain block select-none"
                />
              </div>
            )}
          </div>

          {/* Interactive Split Divider & Handle */}
          {isSplitMode && (
            <div
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDownSlider}
              onTouchStart={handleTouchStartSlider}
              className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-white/80 cursor-ew-resize hover:bg-white z-10 transition-colors shadow-[0_0_12px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-8 h-8 rounded-full bg-dark-900/90 border-2 border-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform">
                <Split className="w-4 h-4 text-white rotate-90" />
              </div>
            </div>
          )}

          {/* Side Labels */}
          {isSplitMode && (
            <>
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-300 pointer-events-none tracking-wide uppercase">
                Original
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-brand-600/80 backdrop-blur-md border border-brand-400/30 text-[11px] font-semibold text-white pointer-events-none tracking-wide uppercase shadow-lg shadow-brand-600/20">
                Enhanced
              </div>
            </>
          )}

          {holdOriginal && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-amber-500/90 text-dark-950 font-bold text-xs pointer-events-none uppercase tracking-wider">
              Showing Original
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-30 select-none animate-fade-in">
              <div className="w-12 h-12 rounded-full border-3 border-brand-500 border-t-transparent animate-spin mb-3 shadow-lg shadow-brand-500/30" />
              <span className="text-white font-semibold text-xs tracking-wider uppercase">
                Enhancing Image...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="h-9 border-t border-dark-800/80 bg-dark-950/80 px-4 flex items-center justify-between text-xs text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-3">
          {originalDimensions && (
            <span>
              Original: <span className="text-slate-200">{originalDimensions.width}×{originalDimensions.height}</span>
            </span>
          )}
          {enhancedDimensions && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-brand-400">
                Enhanced: <span className="font-semibold text-brand-300">{enhancedDimensions.width}×{enhancedDimensions.height}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {zoom > 1 && (
            <span className="flex items-center gap-1 text-slate-400">
              <Move className="w-3 h-3 text-brand-400" /> Click and drag to pan
            </span>
          )}
          <span>{isSplitMode ? 'Drag divider to compare' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
};
