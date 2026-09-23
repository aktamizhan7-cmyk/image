# Lumina AI & Pro Manual Image Enhancer

A high-performance, production-quality AI + Manual Image Enhancement web application built for **Antigravity IDE**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![AI Engine](https://img.shields.io/badge/AI%20Engine-Real--ESRGAN%20(Vulkan)-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Tailwind%20CSS-61dafb)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20Sharp-339933)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 🌟 Overview

Lumina Image Enhancer unites **state-of-the-art neural super-resolution (Real-ESRGAN)** with a **client-side 60fps manual grading suite**. Whether upscaling low-resolution photographs or color-grading high-resolution captures, the entire workflow operates with zero privacy compromises directly on your local system.

```
UPLOAD  ──►  AI / MANUAL ENHANCE  ──►  INTERACTIVE BEFORE/AFTER  ──►  ADJUST  ──►  EXPORT
```

---

## ✨ Key Features

### 🧠 Real AI Enhancement (Real-ESRGAN)
* **2× and 4× Super-Resolution**: Uses official photographic model weights (`RealESRGAN_x4plus`) — never anime models for photographic enhancement.
* **Hardware GPU Acceleration**: Directly leverages AMD Radeon / Intel / NVIDIA GPU hardware acceleration via the **Vulkan API**, with automatic multi-threaded CPU fallback (`-g -1`).
* **Noise & Artifact Suppression**: Eliminates compression artifacts, blocking, and sensor grain.
* **Detail Recovery & Smart Sharpening**: Adaptive Laplacian edge enhancement without haloing.
* **Adaptive Lighting & Color Correction**: Tone-maps underexposed shots and restores natural vibrance.

### 🎛️ Pro Manual Adjustment Engine
* **Instant 60fps Canvas/WebGL Previews**: Zero-latency live adjustments without server round-trips.
* **Light Suite**: Exposure, Brightness, Contrast, Highlights, Shadows.
* **Color Suite**: Saturation, Temperature (Cool ↔ Warm), Tint (Green ↔ Magenta).
* **Detail Suite**: Sharpness, Clarity, Noise Reduction, Blur.
* **Undo / Redo / Reset**: Complete 30-step history stack (`Ctrl+Z`, `Ctrl+Y`).
* **Non-Destructive Pipeline**: Strictly protects original image data; maintains `originalImage`, `enhancedImage`, and `currentImage`.

### 🔍 Interactive Before/After Comparison
* **Split Comparison Slider**: Smooth mouse and touch dragging.
* **Zoom & Pan**: Inspect fine pixel details up to 400% zoom with drag-to-pan.
* **Instant Toggle**: Hold to preview the original image at any time.

### 💾 High-Fidelity Export Pipeline
* **Multiple Formats**: JPG/JPEG, PNG (Lossless), WebP.
* **Quality Control**: 10% to 100% fine-grained compression.
* **Server-Side Sharp Precision**: Matches client canvas adjustments with pixel-perfect C++ execution.

### 🛠️ Developer MCP Server
* Optional Model Context Protocol server exposing standard image enhancement and inspection tools.

---

## 🏗️ Architecture

```
d:/antigravity/AI/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Header, UploadZone, BeforeAfterSlider, AdjustmentPanel, ExportModal
│   │   ├── hooks/              # useHistory (undo/redo), useImageEnhancer
│   │   ├── services/           # apiClient, manualEngine (Canvas/WebGL filters)
│   │   ├── types/              # Enhancement & state definitions
│   │   ├── App.tsx             # Main orchestrator
│   │   └── main.tsx
│   ├── vite.config.ts          # Vite configuration with /api proxy
│   └── package.json
│
├── server/                     # Backend Processing Engine
│   ├── src/
│   │   ├── controllers/        # imageController
│   │   ├── routes/             # imageRoutes
│   │   ├── services/
│   │   │   ├── ai/             # RealESRGANProvider, RealESRGANModelManager
│   │   │   ├── image/          # manualImageProcessor (Sharp export), imageAnalyzer
│   │   │   └── providers/      # Modular ImageProcessingProvider interface & registry
│   │   ├── middleware/         # Multer upload validation, size caps, integrity checks
│   │   └── server.ts           # Express entrypoint
│   ├── bin/                    # Real-ESRGAN NCNN Vulkan binary & models
│   │   ├── realesrgan-ncnn-vulkan.exe
│   │   └── models/             # realesrgan-x4plus weights
│   └── package.json
│
├── mcp/                        # Standard MCP Server
│   ├── src/
│   │   └── server.ts           # Stdio MCP Server (tools: analyze_image, upscale_image, enhance_image)
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js**: v20+ or v24 LTS (installed)
* **npm**: v10+ or v11+
* **OS**: Windows 10/11 (AMD/Intel/NVIDIA GPU supported via Vulkan)

### 2. Installation
From the root workspace directory:
```bash
npm install
```

### 3. Start Development Servers
To start both backend and frontend concurrently:
```bash
npm run dev
```

Or start them individually:
```bash
# Terminal 1: Backend Server (runs on http://localhost:3001)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 🔒 Security & Privacy Notes

* **100% Local Processing**: All AI super-resolution and image grading occurs locally on your machine.
* **Zero Cloud Leakage**: No images or personal telemetry are transmitted to third-party endpoints.
* **Ephemeral Storage**: All temporary image files created during enhancement or export are strictly cleaned up via guaranteed `try/finally` unlinking.
* **Strict Validation**: Uploads are verified via Sharp magic byte inspection and restricted to 25MB max size and 8192×8192 px max dimensions.

---

## 🤖 MCP Server Setup

The workspace includes a standalone Model Context Protocol (MCP) server located in `mcp/`.

### Available MCP Tools
* `analyze_image`: Extracts dimensions, format, color space, and estimated noise level.
* `upscale_image`: Performs 2× or 4× Real-ESRGAN super-resolution.
* `enhance_image`: Executes the complete photographic restoration pipeline.
* `get_processing_status`: Returns hardware acceleration and binary readiness.
* `get_supported_formats`: Reports supported input and output MIME types and limits.

### MCP Configuration
Add the following to your Antigravity or Claude Code MCP configuration file:
```json
{
  "mcpServers": {
    "image-enhancer": {
      "command": "node",
      "args": ["d:/antigravity/AI/mcp/dist/server.js"]
    }
  }
}
```

---

## 🧪 Testing & Verification

Run the automated integration test suite:
```bash
npm run test
```

This verifies:
1. `ImageAnalyzer` metadata and aspect ratio resolution.
2. `RealESRGANProvider` binary and model availability.
3. 2× AI Super-Resolution execution.
4. Full AI Enhancement pipeline (denoise, smart sharpen, lighting).
5. Manual Image Processor multi-format export (JPG, WebP, PNG).

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `npm.ps1 cannot be loaded` | Windows PowerShell execution policy | Run commands with `npm.cmd` instead of `npm`. |
| `Vulkan device error` | GPU driver update or low VRAM | The `RealESRGANModelManager` automatically falls back to CPU mode (`-g -1`) with multi-threading. |
| `Image dimensions exceed limit` | Image is larger than 8192×8192 | Resize the image below 8192px before uploading. |
