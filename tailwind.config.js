/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F7',
        card: '#FFFFFF',
        primary: '#E4222A',
        'text-base': '#1A1A1A',
        'text-muted': '#3A3A3A',
        border: '#E2E2E2',
        'input-bg': '#FAFAFA',
        'hover-bg': '#F0F0F0'
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 12px 32px rgba(12, 16, 24, 0.08)'
      }
    }
  },
  plugins: []
};
