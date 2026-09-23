import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const backendUrl =
    env.VITE_BACKEND_URL ||
    env.BACKEND_URL ||
    (env.PORT ? `http://localhost:${env.PORT}` : 'http://localhost:3001');

  return {
    plugins: [react()],
    envDir: path.resolve(__dirname, '..'),
    server: {
      port: 5173,
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

