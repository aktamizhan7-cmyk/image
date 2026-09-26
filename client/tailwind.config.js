import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090e',
          900: '#0a0d14',
          850: '#0f1420',
          800: '#131929',
          700: '#1e263d',
          600: '#2d3752',
        },
        obsidian: {
          950: '#07090e',
          900: '#0a0d14',
          850: '#0f1420',
          800: '#131929',
          700: '#1e263d',
          600: '#2d3752',
        },
        brand: {
          50: '#eef6ff',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        melanin: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        accent: {
          500: '#8b5cf6',
          400: '#a78bfa',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 25px -4px rgba(37, 99, 235, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.48)',
      },
    },
  },
  plugins: [],
}
