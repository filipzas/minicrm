/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        slate: '#3B4959',
        clay: '#F4F1EC',
        sand: '#E8DFD1',
        mint: '#2BB673',
        coral: '#FF6B4A',
        sky: '#6ED3F2'
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
        body: ['"Archivo"', '"Helvetica Neue"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 40px rgba(16, 24, 40, 0.12)'
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        glow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' }
        }
      },
      animation: {
        floatIn: 'floatIn 0.6s ease-out forwards',
        glow: 'glow 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
