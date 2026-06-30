/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#d4a017', 600: '#b8860b', 700: '#92681a',
          800: '#78511a', 900: '#3d2b00', 950: '#1a1200',
        },
        dark: {
          700: '#2a2200', 800: '#1a1500', 850: '#0f0c00', 900: '#080600', 950: '#040300',
        },
      },
      fontFamily: { arabic: ['Cairo', 'Tajawal', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
