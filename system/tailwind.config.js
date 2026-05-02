/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e4ed2',
        accent: '#a9fd6e',
        success: '#10be5b',
        navy: {
          DEFAULT: '#1a1f36',
          light: '#242a45',
          lighter: '#2e3554',
        },
        lime: {
          DEFAULT: '#a9fd6e',
          dark: '#88dd4e',
        },
        surface: '#ffffff',
        muted: '#94a3b8',
        bg: '#ebf0f5', // Further darkened for maximum contrast
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 40px -4px rgba(0,0,0,0.12)',
        'sidebar': '4px 0 24px 0 rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
