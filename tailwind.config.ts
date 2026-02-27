import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0d1b2a',
        teal: {
          DEFAULT: '#0a7ea4',
          dark: '#0E7490',
          light: '#0891B2',
        },
        blue: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        sky: '#e0f4f6',
        warm: '#fde8d0',
        mist: '#F2F7FF',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(13,27,42,0.08)',
        elevated: '0 8px 40px rgba(13,27,42,0.12)',
        glow: '0 0 60px rgba(10,126,164,0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        'fade-up-delay-1': 'fadeUp 0.7s ease-out 0.1s both',
        'fade-up-delay-2': 'fadeUp 0.7s ease-out 0.2s both',
        'fade-up-delay-3': 'fadeUp 0.7s ease-out 0.3s both',
        'fade-up-delay-4': 'fadeUp 0.7s ease-out 0.4s both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.6)' },
          '50%': { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
