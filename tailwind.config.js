/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef0ff', 100: '#dfe2ff', 200: '#c4c8ff', 400: '#8b8cff', 500: '#6c63ff', 600: '#5a48f5', 700: '#4a37d8', 900: '#2a1f7a' },
        mint: { 100: '#d5fbef', 400: '#2ee6b0', 500: '#14c99a', 600: '#0ea47e' },
        coral: { 100: '#ffe3dc', 400: '#ff8a6b', 500: '#ff6b47', 600: '#e8502b' },
        sun: { 100: '#fff3c4', 400: '#ffc93c', 500: '#f5b400' },
        sky: { 100: '#d9f1ff', 500: '#1fa3f0' },
        ink: '#1e1b4b',
      },
      fontFamily: { sans: ['"Nunito"', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(90, 72, 245, 0.25)',
        pop: '0 14px 30px -10px rgba(90, 72, 245, 0.45)',
        coral: '0 10px 24px -8px rgba(255, 107, 71, 0.5)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
