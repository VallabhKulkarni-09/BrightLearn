import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        zinc: colors.zinc,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 0 40px -10px rgba(0,0,0,0.05)',
        'elevated': '0 20px 40px -15px rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#000000' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
