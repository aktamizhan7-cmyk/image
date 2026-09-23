import { useState, useRef } from 'react';
import { UploadCloud, Sparkles, AlertCircle, FileCheck } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
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
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  // Create a high quality built-in demo image using canvas if user wants to test right away without finding an image
  const handleLoadDemoImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Atmospheric photo simulation gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#1a103c');
    grad.addColorStop(0.3, '#321d5a');
    grad.addColorStop(0.6, '#b84457');
    grad.addColorStop(0.85, '#e27b4b');
    grad.addColorStop(1, '#f9c57d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Sun orb
    ctx.beginPath();
    ctx.arc(600, 480, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#fff4d0';
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = 60;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mountain silhouettes with fine details
    ctx.fillStyle = '#181226';
    ctx.beginPath();
    ctx.moveTo(0, 800);
    ctx.lineTo(0, 520);
    ctx.lineTo(220, 390);
    ctx.lineTo(440, 550);
    ctx.lineTo(700, 360);
    ctx.lineTo(950, 580);
    ctx.lineTo(1200, 440);
    ctx.lineTo(1200, 800);
    ctx.closePath();
    ctx.fill();

    // Foreground ridge
    ctx.fillStyle = '#0a0714';
    ctx.beginPath();
    ctx.moveTo(0, 800);
    ctx.lineTo(0, 680);
    ctx.lineTo(350, 590);
    ctx.lineTo(600, 670);
    ctx.lineTo(900, 610);
    ctx.lineTo(1200, 720);
    ctx.lineTo(1200, 800);
    ctx.closePath();
    ctx.fill();

    // Fine text detail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lumina AI Enhancement Benchmark', 600, 180);

    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('High-Fidelity Detail Recovery & Super-Resolution Test', 600, 220);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sunset_benchmark.jpg', { type: 'image/jpeg' });
        onImageSelected(file);
      }
    }, 'image/jpeg', 0.85);
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

    // Silk saree drape across shoulders with rich royal marigold & maroon
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

    // Neck with rich golden wheatish tone
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

    // Face oval with genuine South Asian melanin gradient (Fitzpatrick Type IV-V)
    const faceGrad = ctx.createRadialGradient(480, 410, 40, 500, 440, 250);
    faceGrad.addColorStop(0, '#d98e58'); // Warm golden wheatish highlight (cheek/nose)
    faceGrad.addColorStop(0.3, '#c27943'); // Radiant midtone amber
    faceGrad.addColorStop(0.7, '#a25927'); // Rich warm bronze
    faceGrad.addColorStop(1, '#723b16'); // Jawline contour shadow
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(500, 440, 190, 240, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks warm blush (warm terracotta/rose)
    const blushGradL = ctx.createRadialGradient(380, 460, 10, 380, 460, 65);
    blushGradL.addColorStop(0, 'rgba(180, 60, 40, 0.26)');
    blushGradL.addColorStop(1, 'transparent');
    ctx.fillStyle = blushGradL;
    ctx.beginPath();
    ctx.arc(380, 460, 65, 0, Math.PI * 2);
    ctx.fill();

    const blushGradR = ctx.createRadialGradient(620, 460, 10, 620, 460, 65);
    blushGradR.addColorStop(0, 'rgba(180, 60, 40, 0.26)');
    blushGradR.addColorStop(1, 'transparent');
    ctx.fillStyle = blushGradR;
    ctx.beginPath();
    ctx.arc(620, 460, 65, 0, Math.PI * 2);
    ctx.fill();

    // Dark lustrous hair framing
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

    // Almond eyes with deep brown iris and kajal
    const drawEye = (cx: number, cy: number) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.quadraticCurveTo(cx, cy - 18, cx + 36, cy);
      ctx.quadraticCurveTo(cx, cy + 16, cx - 36, cy);
      ctx.closePath();
      ctx.fill();

      // Iris - rich dark brown
      ctx.fillStyle = '#2b1509';
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0a0503';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Kajal
      ctx.strokeStyle = '#050208';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 1);
      ctx.quadraticCurveTo(cx, cy - 20, cx + 40, cy - 2);
      ctx.stroke();
    };

    drawEye(430, 410);
    drawEye(570, 410);

    // Eyebrows
    ctx.strokeStyle = '#181016';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(385, 385);
    ctx.quadraticCurveTo(430, 370, 475, 385);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(525, 385);
    ctx.quadraticCurveTo(570, 370, 615, 385);
    ctx.stroke();

    // Traditional Bindi
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(500, 380, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nose bridge and warm shadow
    ctx.fillStyle = 'rgba(120, 53, 15, 0.22)';
    ctx.beginPath();
    ctx.moveTo(492, 405);
    ctx.lineTo(486, 475);
    ctx.lineTo(514, 475);
    ctx.lineTo(508, 405);
    ctx.closePath();
    ctx.fill();

    // Lips: Natural terracotta rose with golden undertone
    const lipGrad = ctx.createLinearGradient(460, 520, 540, 550);
    lipGrad.addColorStop(0, '#9f2e3e');
    lipGrad.addColorStop(0.5, '#b93b4a');
    lipGrad.addColorStop(1, '#831e2c');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(460, 530);
    ctx.quadraticCurveTo(500, 515, 540, 530);
    ctx.quadraticCurveTo(500, 555, 460, 530);
    ctx.closePath();
    ctx.fill();

    // Title & subtitle text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('South Asian & Indian Melanin Benchmark', 500, 80);
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.fillText('Fitzpatrick IV-V Wheatish & Dusky Melanin Radiance', 500, 112);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'indian_portrait_benchmark.jpg', {
          type: 'image/jpeg',
        });
        onImageSelected(file);
      }
    }, 'image/jpeg', 0.9);
  };


  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 select-none">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01] shadow-2xl shadow-brand-500/20'
            : 'border-dark-700 hover:border-brand-500/50 bg-dark-900/60 hover:bg-dark-900/80 shadow-xl'
        }`}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700/80 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-brand-500/50 transition duration-300 shadow-lg">
          <UploadCloud className="w-10 h-10 text-brand-400 group-hover:text-brand-300 transition" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Drag & Drop your image here
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Supports <span className="text-slate-200 font-medium">JPG, JPEG, PNG, WebP</span> up to 25MB for real-time AI super-resolution & manual grading.
        </p>

        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-lg shadow-brand-500/25 transition group-hover:shadow-brand-500/40"
        >
          Browse Files
        </button>

        {/* Format Badges */}
        <div className="flex items-center gap-2 mt-8 text-[11px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-dark-800/80 border border-dark-700">JPG</span>
          <span className="px-2.5 py-1 rounded-md bg-dark-800/80 border border-dark-700">PNG</span>
          <span className="px-2.5 py-1 rounded-md bg-dark-800/80 border border-dark-700">WEBP</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-sans text-xs">
            <FileCheck className="w-3.5 h-3.5" /> 100% Private & Local
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center space-x-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Demo sample launchers */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span>No image at hand?</span>
        <button
          onClick={handleLoadIndianPortraitBenchmark}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 text-amber-200 border border-amber-500/40 hover:border-amber-400 transition shadow-md shadow-amber-500/10"
        >
          <span className="text-sm">🇮🇳</span>
          <span className="font-semibold">Load Indian Melanin Portrait</span>
        </button>
        <button
          onClick={handleLoadDemoImage}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 border border-dark-700/80 hover:border-brand-500/40 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Landscape Demo</span>
        </button>
      </div>
    </div>
  );
};

