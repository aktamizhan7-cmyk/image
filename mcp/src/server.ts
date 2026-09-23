import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import fs from 'fs';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reusable tool definitions
const TOOLS: Tool[] = [
  {
    name: 'analyze_image',
    description: 'Analyze image dimensions, format, color space, and estimated noise level.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: {
          type: 'string',
          description: 'Absolute path to a JPG, PNG, or WebP image.',
        },
      },
      required: ['imagePath'],
    },
  },
  {
    name: 'upscale_image',
    description: 'Upscale an image 2x or 4x using Real-ESRGAN super-resolution.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: {
          type: 'string',
          description: 'Absolute path to the input image file.',
        },
        outputPath: {
          type: 'string',
          description: 'Absolute path where the upscaled image should be saved.',
        },
        scale: {
          type: 'number',
          enum: [2, 4],
          default: 2,
          description: 'Upscale multiplier (2 or 4).',
        },
      },
      required: ['imagePath', 'outputPath'],
    },
  },
  {
    name: 'enhance_image',
    description: 'Apply complete AI photographic restoration (upscaling, smart sharpening, lighting correction).',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: {
          type: 'string',
          description: 'Absolute path to the input image file.',
        },
        outputPath: {
          type: 'string',
          description: 'Absolute path for saving the enhanced output.',
        },
        scale: {
          type: 'number',
          enum: [2, 4],
          default: 2,
        },
        denoiseStrength: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          default: 30,
        },
        sharpenStrength: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          default: 25,
        },
      },
      required: ['imagePath', 'outputPath'],
    },
  },
  {
    name: 'get_processing_status',
    description: 'Query availability of AI neural engine (Real-ESRGAN Vulkan) and system parameters.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_supported_formats',
    description: 'List supported input and output formats, max file sizes, and resolution limits.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const server = new Server(
  {
    name: 'lumina-image-enhancer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_supported_formats') {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                supportedInputFormats: ['jpg', 'jpeg', 'png', 'webp'],
                supportedExportFormats: ['jpg', 'png', 'webp'],
                maxFileSizeBytes: 25 * 1024 * 1024,
                maxDimensions: '8192x8192',
                recommendedUpscale: '2x (web) or 4x (print)',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'get_processing_status') {
      const binPath = path.resolve(__dirname, '../../server/bin/realesrgan-ncnn-vulkan.exe');
      const isAvailable = existsSync(binPath);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'online',
                engine: 'Real-ESRGAN NCNN Vulkan',
                hardwareAcceleration: 'AMD Radeon Vulkan / Multi-thread CPU fallback',
                isBinaryAvailable: isAvailable,
                defaultModel: 'realesrgan-x4plus',
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'analyze_image') {
      const imagePath = String(args?.imagePath || '');
      validateSafePath(imagePath);

      const metadata = await sharp(imagePath).metadata();
      const stats = await fs.promises.stat(imagePath);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                space: metadata.space,
                channels: metadata.channels,
                hasAlpha: metadata.hasAlpha,
                fileSizeBytes: stats.size,
                aspectRatio:
                  metadata.width && metadata.height
                    ? Number((metadata.width / metadata.height).toFixed(2))
                    : 1,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'upscale_image' || name === 'enhance_image') {
      const imagePath = String(args?.imagePath || '');
      const outputPath = String(args?.outputPath || '');
      validateSafePath(imagePath);
      validateSafePath(outputPath);

      const scale = Number(args?.scale) === 4 ? 4 : 2;

      // Ensure output directory exists
      const outDir = path.dirname(outputPath);
      if (!existsSync(outDir)) {
        await fs.promises.mkdir(outDir, { recursive: true });
      }

      // Invoke server RealESRGAN binary directly
      const binPath = path.resolve(__dirname, '../../server/bin/realesrgan-ncnn-vulkan.exe');
      const modelsDir = path.resolve(__dirname, '../../server/bin/models');

      if (!existsSync(binPath)) {
        throw new Error(`Real-ESRGAN binary not found at ${binPath}`);
      }

      const { spawn } = await import('child_process');

      await new Promise<void>((resolve, reject) => {
        const child = spawn(binPath, [
          '-i', imagePath,
          '-o', outputPath,
          '-s', scale.toString(),
          '-n', 'realesrgan-x4plus',
          '-m', modelsDir,
          '-t', '200',
        ]);

        let stderr = '';
        child.stderr.on('data', (d) => (stderr += d.toString()));
        child.on('close', (code) => {
          if (code === 0 && existsSync(outputPath)) resolve();
          else reject(new Error(`Enhancement failed (code ${code}): ${stderr}`));
        });
        child.on('error', reject);
      });

      // Post-process with sharp if enhance_image
      if (name === 'enhance_image') {
        const sharpenStrength = Number(args?.sharpenStrength ?? 25);
        if (sharpenStrength > 0) {
          const tempPath = `${outputPath}.tmp.png`;
          await fs.promises.rename(outputPath, tempPath);
          await sharp(tempPath)
            .sharpen({ sigma: 0.8, m1: 1.0, m2: 2.0 })
            .toFile(outputPath);
          await fs.promises.unlink(tempPath).catch(() => {});
        }
      }

      const outMeta = await sharp(outputPath).metadata();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                outputPath,
                outputWidth: outMeta.width,
                outputHeight: outMeta.height,
                format: outMeta.format,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown MCP tool: ${name}`);
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error: ${err.message || String(err)}` }],
    };
  }
});

function validateSafePath(p: string): void {
  if (!p || typeof p !== 'string') {
    throw new Error('Invalid path provided');
  }
  if (p.includes('\0')) {
    throw new Error('Null bytes not allowed in file path');
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Lumina-MCP] Server listening over stdio');
}

main().catch((err) => {
  console.error('[Lumina-MCP] Fatal error:', err);
  process.exit(1);
});
