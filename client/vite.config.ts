import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const backendPort = Number(env.DEFAULT_APP_PORT || env.PORT || 3000);
  const isCloudEnv = !!(
    process.env.APP_URL ||
    process.env.GOOGLE_RUNTIME ||
    process.env.CLOUD_RUN_TIMEOUT_SECONDS
  );
  const hmrClientPort = isCloudEnv ? 443 : backendPort;
  const backendUrl =
    env.VITE_BACKEND_URL ||
    env.BACKEND_URL ||
    `http://localhost:${backendPort}`;

  return {
    plugins: [
      react(),
    ],
    envDir: path.resolve(__dirname, '..'),
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: false,
      watch: {
        ignored: [
          '**/temp/**',
          '**/uploads/**',
          '**/dist/**',
          '**/.git/**',
          '**/test_tmp/**',
          '**/bin/**',
        ],
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
