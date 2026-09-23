/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#090a0f',
          900: '#0f111a',
          850: '#151824',
          800: '#1b1f2e',
          700: '#282d42',
          600: '#383f5c',
        },
        brand: {
          500: '#3b82f6',
          600: '#2563eb',
          400: '#60a5fa',
        },
        accent: {
          500: '#8b5cf6',
          400: '#a78bfa',
        }
      },
    },
  },
  plugins: [],
}
