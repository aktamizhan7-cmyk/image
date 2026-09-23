# 🌌 Lumina AI & Anti-Gravity Image Enhancer

> **Next-Generation Neural Super-Resolution & Client-Side 60fps Image Grading Engine**  
> *Engineered for Antigravity IDE with Zero Privacy Compromises, Vulkan GPU Acceleration, and South Asian Melanin Guard.*

---

[![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Real--ESRGAN%20(Vulkan%20NCNN)-7928CA?logo=vulkan&logoColor=white)](https://github.com/xinntao/Real-ESRGAN)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%206%20%7C%20TailwindCSS-0070F3?logo=react&logoColor=white)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2024%20%7C%20Express%20%7C%20Sharp-10B981?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Hardware](https://img.shields.io/badge/Acceleration-AMD%20%7C%20NVIDIA%20%7C%20Intel%20GPU-FF5722)](#hardware-acceleration)
[![Melanin Guard](https://img.shields.io/badge/Color%20Science-South%20Asian%20Melanin%20Guard-F59E0B)](#-south-asian-skin-tone-optimization-melanin-guard)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [AI Enhancement & Super-Resolution](#-ai-enhancement--super-resolution)
  - [South Asian Melanin Guard](#-south-asian-skin-tone-optimization-melanin-guard)
  - [Client-Side Manual Grading Suite](#-client-side-manual-grading-suite)
  - [Split Before/After Comparison](#-interactive-beforeafter-comparison)
  - [High-Fidelity Export Pipeline](#-high-fidelity-export-pipeline)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Prerequisites & Installation](#-prerequisites--installation)
- [Running the Project](#-running-the-project)
- [Hardware Acceleration & Vulkan](#-hardware-acceleration--vulkan)
- [Model Context Protocol (MCP) Server](#-mcp-server)
- [Pushing to GitHub](#-pushing-to-github)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🌟 Overview

Lumina Image Enhancer is a full-stack, production-grade visual processing workstation designed to bridge cutting-edge neural super-resolution with real-time browser canvas color science.

```
┌────────────┐       ┌──────────────────────┐       ┌─────────────────────┐       ┌────────────┐
│   UPLOAD   │  ──►  │ AI / MANUAL ENHANCE  │  ──►  │ 60FPS BEFORE/AFTER  │  ──►  │   EXPORT   │
│ JPEG/PNG/WEBP      │ Vulkan NCNN + Sharp  │       │ Split Slider & Zoom │       │ Lossless   │
└────────────┘       └──────────────────────┘       └─────────────────────┘       └────────────┘
```

All AI processing runs **100% locally** on your machine using optimized native C++ binaries with Vulkan hardware shaders — your images never leave your local environment.

---

## ✨ Key Features

### 🧠 AI Enhancement & Super-Resolution
- **2× and 4× Neural Upscaling**: Powered by official `RealESRGAN_x4plus` photographic model weights (never anime models for real-world photos).
- **Detail Synthesis**: Reconstructs high-frequency textures (hair, fabric, architectural lines) lost in compressed inputs.
- **Smart Adaptive Sharpening**: Multi-frequency Laplacian unsharp masking that prevents haloing and noise amplification.
- **Sensor Noise & Grain Suppression**: Removes low-light CMOS sensor noise and JPEG block compression artifacts.
- **Auto Lighting & Dynamic Range Recovery**: Enhances shadow details while protecting highlights from clipping.

### 🛡️ South Asian Skin Tone Optimization ("Melanin Guard")
Standard AI upscaling models frequently suffer from ethnic bias, washing out or graying South Asian, Indian, and deeper skin tones (Fitzpatrick Types III–VI). Lumina integrates an intelligent **Melanin Guard Engine**:
- **Fitzpatrick Types III–VI Chromatic Preservation**: Locks and preserves warm carotene, melanin, and golden undertones during upscaling.
- **One-Click Presets**:
  - *Golden Hour*: Boosts luminous amber warmth and soft highlights.
  - *Wheatish Natural*: Calibrates natural sub-surface scattering for Type IV tones.
  - *Dusky Rich*: Deepens rich umber tones without clipping or muddying shadows.
  - *Warm Glow*: Gently elevates midtone warmth.
- **Dual-Stage Protection**: Automatic server-side chromatic recovery during AI inference + interactive client-side fine-tuning sliders.

### 🎛️ Client-Side Manual Grading Suite
- **Zero-Latency 60fps Previews**: Utilizes an accelerated HTML5 Canvas filter pipeline.
- **Light Controls**: Exposure, Brightness, Contrast, Highlights, Shadows.
- **Color Controls**: Saturation, Color Temperature (Cool ↔ Warm), Tint (Green ↔ Magenta).
- **Detail Controls**: Sharpness, Clarity, Local Contrast, Blur.
- **Undo / Redo / Reset**: Full 30-step immutable history stack (`Ctrl+Z`, `Ctrl+Y`).
- **Non-Destructive Workflow**: Preserves original raw buffers throughout all adjustments.

### 🔍 Interactive Before/After Comparison
- **Split-Screen Slider**: Smooth drag and touch-enabled comparison curtain.
- **Deep Zoom & Pan**: Inspect micro-textures up to 400% with smooth pan navigation.
- **Instant Peek**: Press-and-hold to view the unedited original image instantly.

### 💾 High-Fidelity Export Pipeline
- **Formats**: Lossless PNG, High-Efficiency WebP, Optimized JPEG.
- **Precision Matching**: Server-side Sharp C++ image pipeline precisely replicates client canvas filter math.
- **Custom Quality & Resizing**: Configurable output dimensions and compression quality (10% to 100%).

---

## 🏗️ Architecture

```
d:/antigravity/AI/
├── client/                     # Frontend Application (React 18 + Vite 6 + TailwindCSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdjustmentPanel.tsx   # Manual grading & Melanin Guard controls
│   │   │   ├── BeforeAfterSlider.tsx # Interactive split comparison & zoom engine
│   │   │   ├── ExportModal.tsx       # Multi-format export dialog
│   │   │   ├── Header.tsx            # Navigation, status, and theme controls
│   │   │   └── UploadZone.tsx        # Drag-and-drop ingestion & validation
│   │   ├── hooks/
│   │   │   └── useHistory.ts         # Undo/redo state management
│   │   ├── services/
│   │   │   ├── apiClient.ts          # REST client communicating with backend
│   │   │   └── manualEngine.ts       # 60fps canvas rendering & color math
│   │   ├── types/                    # Shared TypeScript interfaces
│   │   ├── App.tsx                   # Main state machine & workspace orchestrator
│   │   └── main.tsx
│   ├── vite.config.ts                # Vite config with backend API proxy
│   └── package.json
│
├── server/                     # Backend Engine (Express 4 + Sharp + Real-ESRGAN Vulkan)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── imageController.ts    # Request handlers & validation
│   │   ├── middleware/
│   │   │   └── upload.ts             # Multer upload limits & Sharp magic-byte checks
│   │   ├── routes/
│   │   │   └── imageRoutes.ts        # REST API route definitions
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── RealESRGANModelManager.ts # Process queue & Vulkan subprocess pool
│   │   │   │   └── RealESRGANProvider.ts     # Neural enhancement & upscaling provider
│   │   │   ├── image/
│   │   │   │   ├── imageAnalyzer.ts          # Metadata, color space, & noise metrics
│   │   │   │   ├── manualImageProcessor.ts   # Server-side Sharp export processor
│   │   │   │   └── skinToneOptimizer.ts      # South Asian Melanin Guard algorithms
│   │   │   └── providers/
│   │   │       ├── ImageProcessingProvider.ts# Modular provider interface
│   │   │       └── providerRegistry.ts       # Dynamic provider registry
│   │   ├── server.ts                 # Express initialization & graceful shutdown
│   │   └── types/                    # Server interfaces and DTOs
│   ├── bin/                          # Standalone Real-ESRGAN Vulkan NCNN Binaries
│   │   ├── realesrgan-ncnn-vulkan.exe
│   │   ├── vcomp140.dll
│   │   └── models/                   # realesrgan-x4plus weights & parameters
│   └── package.json
│
├── mcp/                        # Model Context Protocol (MCP) Server
│   ├── src/server.ts                 # Standard Stdio MCP server exposing image tools
│   └── package.json
│
├── .env.example                # Documented configuration template
├── .gitignore                  # Security-first git exclusion rules
└── README.md
```

---

## 📡 API Reference

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/image/upload` | Upload & validate image | `multipart/form-data` with `image` file |
| `POST` | `/api/image/enhance` | Run AI photographic enhancement | `{ imageId, options: { denoise, sharpen, lighting, skinTone } }` |
| `POST` | `/api/image/upscale` | Run Real-ESRGAN 2×/4× super-resolution | `{ imageId, scale: 2 \| 4, skinTone }` |
| `POST` | `/api/image/export` | Apply manual grades & export | `{ imageId, adjustments, format, quality }` |
| `POST` | `/api/image/analyze` | Extract resolution, aspect ratio, noise | `{ imageId }` |
| `GET` | `/api/image/health` | Inspect server readiness & GPU status | Returns `{ status, gpuAvailable, provider }` |

---

## 🚀 Prerequisites & Installation

### Requirements
* **Operating System**: Windows 10/11 (64-bit)
* **Node.js**: v20.x or v24.x LTS ([Download Node.js](https://nodejs.org/))
* **GPU**: AMD Radeon, NVIDIA GeForce, or Intel Arc/Iris Xe (DirectX 12 / Vulkan compatible)
  *(Automatic CPU fallback is supported for systems without dedicated GPUs)*

### 1. Clone or Open Workspace
```bash
cd d:\antigravity\AI
```

### 2. Install Dependencies
```bash
npm.cmd install
```
*(Uses workspaces to automatically link `client`, `server`, and `mcp`)*

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```powershell
Copy-Item .env.example .env
```

Key configuration options in `.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
IMAGE_PROVIDER=realesrgan
REAL_ESRGAN_DEVICE=auto
REAL_ESRGAN_TILE_SIZE=200
MAX_FILE_SIZE_MB=25
```

---

## 🏃 Running the Project

### Simultaneous Development (Frontend + Backend)
```bash
npm.cmd run dev
```

### Or Run Services Individually

**Backend Server** (`http://localhost:3001`):
```bash
npm.cmd run dev:server
```

**Frontend Client** (`http://localhost:5173`):
```bash
npm.cmd run dev:client
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to access the Lumina workstation.

---

## ⚡ Hardware Acceleration & Vulkan

The AI engine uses **NCNN Vulkan**, which executes neural tensor operations on modern GPUs without requiring bulky CUDA toolkits or Python runtimes:
- **Auto-Detection**: The server probes for Vulkan physical devices at startup.
- **Tile Sizing**: Set `REAL_ESRGAN_TILE_SIZE=200` in `.env` for GPUs with 2GB–4GB VRAM to eliminate out-of-memory errors.
- **CPU Fallback**: If no compatible GPU is detected, the engine transparently switches to multi-threaded CPU processing (`-g -1`) without failing requests.

---

## 🤖 MCP Server Setup

Lumina includes a Model Context Protocol (MCP) server for integration with **Antigravity IDE**, **Claude Code**, or **Cursor**:

### Tools Exposed
- `analyze_image`: Inspect dimensions, color spaces, and noise distribution.
- `upscale_image`: Perform 2× or 4× super-resolution programmatically.
- `enhance_image`: Execute photographic neural restoration.
- `get_processing_status`: Check Vulkan readiness and system load.

### MCP Configuration Entry
Add to your IDE's `mcp_config.json`:
```json
{
  "mcpServers": {
    "lumina-image-enhancer": {
      "command": "node",
      "args": ["d:/antigravity/AI/mcp/dist/server.js"]
    }
  }
}
```

---

## 📤 Pushing to GitHub

To push this repository to your GitHub account:

```powershell
# 1. Add your remote repository origin
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git

# 2. Rename branch to main (if not already set)
git branch -M main

# 3. Push code to GitHub
git push -u origin main
```

> **Security Note:** Sensitive `.env` files, uploaded files in `temp/`, and `node_modules` are safely shielded by `.gitignore`.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `npm.ps1 cannot be loaded` | PowerShell execution policy restriction | Execute scripts with `npm.cmd` instead of `npm`. |
| `Vulkan device error (-1)` | Missing Vulkan runtime or outdated graphics driver | Update your GPU driver, or set `REAL_ESRGAN_DEVICE=cpu` in `.env`. |
| `Server port 3001 in use` | Previous server instance still bound to port | Run `Get-NetTCPConnection -LocalPort 3001 \| Stop-Process -Id {$_.OwningProcess} -Force` in PowerShell. |
| `Max file size exceeded` | Image exceeds 25MB upload limit | Increase `MAX_FILE_SIZE_MB` in `.env` if desired. |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
