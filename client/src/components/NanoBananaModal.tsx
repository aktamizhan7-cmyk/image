import React from 'react';
import { X } from 'lucide-react';
import { NanoBananaPanel } from './NanoBananaPanel';
import { ImageMetadata } from '../types';

interface NanoBananaModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCurrentImage: boolean;
  currentImageFile: File | null;
  currentImageUrl: string | null;
  onImageGenerated: (file: File, url: string, metadata: ImageMetadata, isEdit: boolean) => void;
  isAiProcessing: boolean;
  setIsAiProcessing: (v: boolean) => void;
  statusMessage: string | null;
  setStatusMessage: (msg: string | null) => void;
}

export const NanoBananaModal: React.FC<NanoBananaModalProps> = ({
  isOpen,
  onClose,
  hasCurrentImage,
  currentImageFile,
  currentImageUrl,
  onImageGenerated,
  isAiProcessing,
  setIsAiProcessing,
  statusMessage,
  setStatusMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-dark-950 border border-dark-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-900/60">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🍌</span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Nano Banana Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Gemini Native Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Multi-Reference Editing • 4K Real-ESRGAN • Melanin Calibration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Panel */}
        <div className="p-6 overflow-y-auto flex-1">
          <NanoBananaPanel
            hasCurrentImage={hasCurrentImage}
            currentImageFile={currentImageFile}
            currentImageUrl={currentImageUrl}
            onImageGenerated={(file, url, meta, isEdit) => {
              onImageGenerated(file, url, meta, isEdit);
              onClose();
            }}
            isAiProcessing={isAiProcessing}
            setIsAiProcessing={setIsAiProcessing}
            statusMessage={statusMessage}
            setStatusMessage={setStatusMessage}
          />
        </div>
      </div>
    </div>
  );
};
