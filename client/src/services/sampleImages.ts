/**
 * Helper to generate diverse benchmark images client-side for testing
 * and batch processing demonstration without needing external network assets.
 */

export async function generateIndianPortraitSample(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1000);
  bgGrad.addColorStop(0, '#1a1008');
  bgGrad.addColorStop(0.5, '#2e180d');
  bgGrad.addColorStop(1, '#0e0804');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 1000);

  // Soft rim light
  const rimGrad = ctx.createRadialGradient(500, 480, 200, 500, 480, 500);
  rimGrad.addColorStop(0, 'rgba(217, 119, 6, 0.22)');
  rimGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.08)');
  rimGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, 1000, 1000);

  // Silk saree drape
  ctx.fillStyle = '#831843';
  ctx.beginPath();
  ctx.moveTo(140, 1000);
  ctx.bezierCurveTo(200, 740, 300, 690, 500, 710);
  ctx.bezierCurveTo(700, 690, 800, 740, 860, 1000);
  ctx.closePath();
  ctx.fill();

  // Golden zari border
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

  // Face oval - South Asian Melanin
  const faceGrad = ctx.createRadialGradient(480, 410, 40, 500, 440, 250);
  faceGrad.addColorStop(0, '#d98e58');
  faceGrad.addColorStop(0.3, '#c27943');
  faceGrad.addColorStop(0.7, '#a25927');
  faceGrad.addColorStop(1, '#723b16');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(500, 440, 190, 240, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks warm blush
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

  // Hair framing
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
    ctx.quadraticCurveTo(cx, cy + 16, cx - 36, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2b1509';
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0503';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawEye(430, 420);
  drawEye(570, 420);

  // Bindi
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(500, 380, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Lips
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

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], '01_indian_portrait_melanin.jpg', { type: 'image/jpeg' }));
      } else {
        reject(new Error('Failed to render sample portrait'));
      }
    }, 'image/jpeg', 0.92);
  });
}

export async function generateLandscapeSample(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Sunset sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 500);
  sky.addColorStop(0, '#0f172a');
  sky.addColorStop(0.4, '#431407');
  sky.addColorStop(0.7, '#ea580c');
  sky.addColorStop(1, '#fde047');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 500);

  // Glowing Sun
  const sunGrad = ctx.createRadialGradient(600, 380, 10, 600, 380, 180);
  sunGrad.addColorStop(0, '#fffbeb');
  sunGrad.addColorStop(0.3, '#fde047');
  sunGrad.addColorStop(0.6, '#f97316');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(600, 380, 180, 0, Math.PI * 2);
  ctx.fill();

  // Mountain ridge 1 (Distant)
  ctx.fillStyle = '#371e30';
  ctx.beginPath();
  ctx.moveTo(0, 480);
  ctx.lineTo(250, 340);
  ctx.lineTo(480, 420);
  ctx.lineTo(720, 320);
  ctx.lineTo(980, 440);
  ctx.lineTo(1200, 350);
  ctx.lineTo(1200, 800);
  ctx.lineTo(0, 800);
  ctx.closePath();
  ctx.fill();

  // Mountain ridge 2 (Mid-ground)
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(0, 540);
  ctx.lineTo(180, 420);
  ctx.lineTo(400, 500);
  ctx.lineTo(600, 410);
  ctx.lineTo(850, 510);
  ctx.lineTo(1100, 430);
  ctx.lineTo(1200, 490);
  ctx.lineTo(1200, 800);
  ctx.lineTo(0, 800);
  ctx.closePath();
  ctx.fill();

  // Lake reflection in foreground
  const lake = ctx.createLinearGradient(0, 550, 0, 800);
  lake.addColorStop(0, '#78350f');
  lake.addColorStop(0.3, '#1e1b4b');
  lake.addColorStop(1, '#090d16');
  ctx.fillStyle = lake;
  ctx.fillRect(0, 550, 1200, 250);

  // Mist on water
  const mist = ctx.createLinearGradient(0, 530, 0, 620);
  mist.addColorStop(0, 'transparent');
  mist.addColorStop(0.5, 'rgba(253, 224, 71, 0.25)');
  mist.addColorStop(1, 'transparent');
  ctx.fillStyle = mist;
  ctx.fillRect(0, 530, 1200, 90);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], '02_golden_hour_landscape.jpg', { type: 'image/jpeg' }));
      } else {
        reject(new Error('Failed to render sample landscape'));
      }
    }, 'image/jpeg', 0.9);
  });
}

export async function generateNeonCyberpunkSample(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Dark rainy city night
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, 900, 900);

  // Background skyscrapers
  const colors = ['#0c1024', '#080d1a', '#10162f'];
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const width = 80 + (i * 27) % 60;
    const height = 400 + (i * 73) % 350;
    const x = i * 95;
    const y = 900 - height;
    ctx.fillRect(x, y, width, height);

    // Glowing windows
    ctx.fillStyle = (i % 2 === 0) ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.35)';
    for (let wy = y + 20; wy < 850; wy += 25) {
      for (let wx = x + 15; wx < x + width - 15; wx += 20) {
        if (Math.sin(wx * wy) > 0.1) {
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
  }

  // Neon signs
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 20;
  ctx.strokeRect(180, 320, 240, 80);

  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(650, 280, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Wet street reflection gradient
  const wetStreet = ctx.createLinearGradient(0, 680, 0, 900);
  wetStreet.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
  wetStreet.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
  wetStreet.addColorStop(1, 'rgba(5, 7, 14, 0.95)');
  ctx.fillStyle = wetStreet;
  ctx.fillRect(0, 680, 900, 220);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], '03_neon_cyberpunk_city.jpg', { type: 'image/jpeg' }));
      } else {
        reject(new Error('Failed to render sample neon cyberpunk'));
      }
    }, 'image/jpeg', 0.9);
  });
}

export async function generateDemoBatch(): Promise<File[]> {
  const [portrait, landscape, cyberpunk] = await Promise.all([
    generateIndianPortraitSample(),
    generateLandscapeSample(),
    generateNeonCyberpunkSample(),
  ]);
  return [portrait, landscape, cyberpunk];
}
