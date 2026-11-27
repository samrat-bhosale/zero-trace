/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#EDEDE9',
        card: '#F5EBE0',
        sidebar: '#F5EBE0',
        border: {
          DEFAULT: '#D6CCC2',
          subtle: '#E3D5CA',
          focus: '#746250',
        },
        primary: {
          blue: '#746250',
          indigo: '#746250',
          hover: '#5D4C3E',
        },
        accent: {
          violet: '#746250',
          lavender: '#E3D5CA',
          surface: '#F5EBE0',
        },
        text: {
          primary: '#3D3732',
          secondary: '#766C63',
          muted: '#8D8177',
          dim: '#988B80',
        },
        status: {
          green: '#746250',
          mint: '#E3D5CA',
          orange: '#F59E0B',
          warningBg: '#FFF0DC',
          red: '#EF4444',
          dangerBg: '#FFE4E6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(116, 98, 80, 0.06), 0 1px 3px rgba(61, 55, 50, 0.03)',
        soft: '0 4px 20px rgba(116, 98, 80, 0.10)',
        button: '0 2px 6px rgba(116, 98, 80, 0.24)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
