import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Layers,
  Bookmark,
  Cpu,
} from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  onOpenNanoBanana?: () => void;
  onOpenBatchQueue?: () => void;
  onAddBatchFiles?: (files: FileList | File[]) => void;
  onOpenPresets?: () => void;
  onSwitchToWorkspace?: () => void;
  onOpenContact?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onImageSelected,
  onOpenNanoBanana,
  onOpenBatchQueue,
  onAddBatchFiles,
  onOpenPresets,
  onSwitchToWorkspace,
  onOpenContact,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPass = (file: File) => {
    setErrorMsg(null);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validMimes.includes(file.type) && !validExts.includes(ext)) {
      setErrorMsg('Unsupported file format. Please upload JPG, PNG, or WebP.');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 25MB limit. Please choose a smaller file.');
      return;
    }

    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1 && onAddBatchFiles) {
        onAddBatchFiles(e.dataTransfer.files);
        onOpenBatchQueue?.();
      } else {
        validateAndPass(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1 && onAddBatchFiles) {
        onAddBatchFiles(e.target.files);
        onOpenBatchQueue?.();
      } else {
        validateAndPass(e.target.files[0]);
      }
      e.target.value = '';
    }
  };

  // High-fidelity South Asian & Indian Portrait Benchmark (Wheatish & Dusky Melanin)
  const handleLoadIndianPortraitBenchmark = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Atmospheric studio portrait background
    const bgGrad = ctx.createRadialGradient(500, 450, 80, 500, 500, 700);
    bgGrad.addColorStop(0, '#2d1a24');
    bgGrad.addColorStop(0.5, '#180f1b');
    bgGrad.addColorStop(1, '#09050d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Warm ambient rim light
    const rimGrad = ctx.createLinearGradient(0, 0, 1000, 1000);
    rimGrad.addColorStop(0, 'rgba(217, 119, 6, 0.28)');
    rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Silk drape across shoulders
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.moveTo(140, 1000);
    ctx.bezierCurveTo(200, 740, 300, 690, 500, 710);
    ctx.bezierCurveTo(700, 690, 800, 740, 860, 1000);
    ctx.closePath();
    ctx.fill();

    // Golden embroidered zari border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Neck
    const neckGrad = ctx.createLinearGradient(400, 530, 600, 720);
    neckGrad.addColorStop(0, '#b87333');
    neckGrad.addColorStop(0.5, '#99582a');
    neckGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(420, 510);
    ctx.lineTo(400, 720);
    ctx.lineTo(600, 720);
    ctx.lineTo(580, 510);
    ctx.closePath();
    ctx.fill();

    // Face oval with genuine South Asian melanin tone
    const faceGrad = ctx.createRadialGradient(480, 410, 40, 500, 440, 250);
    faceGrad.addColorStop(0, '#d98e58');
    faceGrad.addColorStop(0.3, '#c27943');
    faceGrad.addColorStop(0.7, '#a25927');
    faceGrad.addColorStop(1, '#723b16');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(500, 440, 190, 240, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark lustrous hair
    ctx.fillStyle = '#120d18';
    ctx.beginPath();
    ctx.moveTo(310, 450);
    ctx.bezierCurveTo(280, 260, 340, 150, 500, 150);
    ctx.bezierCurveTo(660, 150, 720, 260, 690, 450);
    ctx.bezierCurveTo(720, 600, 710, 800, 680, 950);
    ctx.lineTo(630, 950);
    ctx.bezierCurveTo(660, 750, 650, 550, 640, 460);
    ctx.bezierCurveTo(600, 300, 400, 300, 360, 460);
    ctx.bezierCurveTo(350, 550, 340, 750, 370, 950);
    ctx.lineTo(320, 950);
    ctx.bezierCurveTo(290, 800, 280, 600, 310, 450);
    ctx.closePath();
    ctx.fill();

    // Eyes
    const drawEye = (cx: number, cy: number) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.quadraticCurveTo(cx, cy - 18, cx + 36, cy);
      ctx.quadraticCurveTo(cx, cy + 18, cx - 36, cy);
      ctx.closePath();
      ctx.fill();

      // Iris
      ctx.fillStyle = '#3e2112';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 4, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eyeliner / Kajal
      ctx.strokeStyle = '#050308';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy);
      ctx.quadraticCurveTo(cx, cy - 20, cx + 42, cy - 3);
      ctx.stroke();
    };

    drawEye(435, 420);
    drawEye(565, 420);

    // Bindi
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(500, 375, 7, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = 'rgba(114, 59, 22, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(495, 410);
    ctx.lineTo(495, 480);
    ctx.bezierCurveTo(480, 495, 520, 495, 505, 480);
    ctx.stroke();

    // Lips
    const lipGrad = ctx.createLinearGradient(460, 525, 540, 565);
    lipGrad.addColorStop(0, '#9f2e46');
    lipGrad.addColorStop(0.5, '#b93a55');
    lipGrad.addColorStop(1, '#7e2034');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(460, 538);
    ctx.quadraticCurveTo(480, 530, 500, 535);
    ctx.quadraticCurveTo(520, 530, 540, 538);
    ctx.quadraticCurveTo(500, 568, 460, 538);
    ctx.fill();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'indian-melanin-benchmark-portrait.png', {
          type: 'image/png',
        });
        validateAndPass(file);
      }
    }, 'image/png');
  };

  // Landscape demo generator
  const handleLoadLandscapeDemo = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.3, '#1e293b');
    grad.addColorStop(0.6, '#334155');
    grad.addColorStop(0.85, '#e2e8f0');
    grad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Mountain silhouettes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 800);
    ctx.lineTo(200, 450);
    ctx.lineTo(450, 600);
    ctx.lineTo(750, 380);
    ctx.lineTo(1000, 550);
    ctx.lineTo(1200, 420);
    ctx.lineTo(1200, 800);
    ctx.closePath();
    ctx.fill();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'nordic-mist-landscape-demo.png', {
          type: 'image/png',
        });
        validateAndPass(file);
      }
    }, 'image/png');
  };

  return (
    <section
      className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 lg:py-16 flex flex-col items-center justify-center transition-all duration-300 select-none"
      data-purpose="initial-upload-screen"
    >
      {/* Status pill aligned top right like snapshot */}
      <div className="w-full flex justify-end mb-2 pr-6">
        <div className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Ready to enhance</span>
        </div>
      </div>

      {/* Large Obsidian Dashed Dropzone Card */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-4xl bg-obsidian-950/60 backdrop-blur-2xl dashed-border-pulse p-10 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:bg-obsidian-850/50 group ${
          isDragging ? 'border-blue-500 bg-obsidian-800/80' : ''
        }`}
      >
        {/* Cloud Icon */}
        <div className="w-20 h-20 rounded-2xl bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-blue-400 shadow-xl mb-6 group-hover:scale-110 group-hover:text-blue-300 group-hover:border-blue-500/50 transition-all duration-300">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          Drag & Drop your image here
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-md mb-6 leading-relaxed">
          Supports <strong className="text-slate-200">JPG, JPEG, PNG, WebP</strong> up to 25MB for real-time
          AI super-resolution & manual grading.
        </p>

        {/* Hidden input for file browse */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInput}
          multiple
        />

        {/* Browse Files CTA & Quick Tool Triggers */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-8 py-2.5 rounded-lg shadow-glow-blue transition-transform active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Browse Files</span>
          </button>

          {/* Nano Banana Direct Trigger */}
          {onOpenNanoBanana && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenNanoBanana();
              }}
              className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-medium text-sm px-5 py-2.5 rounded-lg transition active:scale-95 flex items-center gap-2 shadow-sm"
              title="Open Nano Banana 2 Generative AI"
            >
              <span>🍌</span>
              <span>Nano Banana AI</span>
            </button>
          )}
        </div>

        {/* Badge row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
          <span className="bg-obsidian-850 px-2.5 py-1 rounded border border-obsidian-700/80 font-mono">
            JPG
          </span>
          <span className="bg-obsidian-850 px-2.5 py-1 rounded border border-obsidian-700/80 font-mono">
            PNG
          </span>
          <span className="bg-obsidian-850 px-2.5 py-1 rounded border border-obsidian-700/80 font-mono">
            WEBP
          </span>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Private & Local</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 px-4 py-2 rounded-xl animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Instant Demo Launchers */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-slate-400 mr-1">Instant Test Benchmarks:</span>

        {/* Melanin Demo Trigger */}
        <button
          type="button"
          onClick={handleLoadIndianPortraitBenchmark}
          className="flex items-center gap-2 bg-melanin-500/10 hover:bg-melanin-500/20 border border-melanin-500/40 text-amber-300 text-xs px-4 py-2 rounded-lg font-medium transition shadow-glow-amber/10 active:scale-95"
          title="Load Wheatish & Dusky Melanin Portrait benchmark"
        >
          <span className="font-bold text-[10px] bg-melanin-500/30 px-1 rounded text-amber-200">IN</span>
          <span>Load Indian Melanin Portrait</span>
        </button>

        {/* Landscape Demo Trigger */}
        <button
          type="button"
          onClick={handleLoadLandscapeDemo}
          className="flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium transition active:scale-95"
          title="Load Nordic mist landscape demo"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Landscape Demo</span>
        </button>

        {/* Presets Trigger */}
        {onOpenPresets && (
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg font-medium transition active:scale-95"
            title="Browse Presets Library"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Browse Presets</span>
          </button>
        )}

        {/* Batch Processing Trigger */}
        {onOpenBatchQueue && (
          <button
            type="button"
            onClick={onOpenBatchQueue}
            className="flex items-center gap-1.5 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg font-medium transition active:scale-95"
            title="Open Batch Upscaler Queue"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Batch Queue</span>
          </button>
        )}
      </div>

      {/* Feature Capability Highlights */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full max-w-4xl text-left">
        <div
          onClick={() => {
            if (onSwitchToWorkspace) onSwitchToWorkspace();
            else handleLoadIndianPortraitBenchmark();
          }}
          className="bg-obsidian-950/40 hover:bg-obsidian-900/70 border border-obsidian-800/80 hover:border-obsidian-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">Real-ESRGAN Vulkan</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Neural 2x & 4x super-resolution with fast GPU accelerated edge reconstruction.
          </p>
        </div>

        <div
          onClick={handleLoadIndianPortraitBenchmark}
          className="bg-obsidian-950/40 hover:bg-obsidian-900/70 border border-obsidian-800/80 hover:border-obsidian-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 font-mono">IN</span>
            <h4 className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">Melanin Guard</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Anti-chalkiness calibration preserving rich warm undertones for South Asian skin.
          </p>
        </div>

        <div
          onClick={() => onOpenNanoBanana && onOpenNanoBanana()}
          className="bg-obsidian-950/40 hover:bg-obsidian-900/70 border border-obsidian-800/80 hover:border-obsidian-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🍌</span>
            <h4 className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">Nano Banana AI</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Generative lighting, cinematic edits, anime styling, and prompt transformations.
          </p>
        </div>

        <div
          onClick={() => onOpenBatchQueue && onOpenBatchQueue()}
          className="bg-obsidian-950/40 hover:bg-obsidian-900/70 border border-obsidian-800/80 hover:border-obsidian-700 p-3.5 rounded-xl cursor-pointer transition group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">Batch & 4K Export</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Queue multi-image workflows with high-bitrate PNG and JPEG instant downloads.
          </p>
        </div>
      </div>

      {/* Enterprise & Custom Inquiries */}
      {onOpenContact && (
        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400">
            Need custom Vulkan clusters or specialized Melanin Guard dataset fine-tuning?{' '}
            <button
              type="button"
              onClick={onOpenContact}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition"
            >
              Contact Studio Engineering →
            </button>
          </p>
        </div>
      )}
    </section>
  );
};
