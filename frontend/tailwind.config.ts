import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        g: {
          50:  '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d0',
          300: '#86efad',
          400: '#4ade81',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        sage: {
          50:  '#f6f9f7',
          100: '#eaf0ec',
          200: '#d1e4d8',
          300: '#a8c9b5',
        },
        mint: {
          50:  '#f0fbf7',
          100: '#d5f5e8',
        },
        text: {
          900: '#111b14',
          700: '#1e3326',
          500: '#3d5a46',
          300: '#7b9282',
          100: '#b4c4bc',
        },
        ivory: '#faf9f6',
        warm:  '#fafaf8',
        card:  '#edf8f2',
      },
      borderColor: {
        DEFAULT: 'rgba(134,239,172,0.22)',
      },
      maxWidth: {
        container: '448px',
      },
      fontFamily: {
        sans:    ['var(--font-noto)', 'sans-serif'],
        display: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        xs:   '0 1px 8px rgba(21,128,61,0.05)',
        sm:   '0 2px 16px rgba(21,128,61,0.08)',
        md:   '0 6px 32px rgba(21,128,61,0.12)',
        lg:   '0 12px 48px rgba(21,128,61,0.18)',
        card: '0 4px 24px rgba(21,128,61,0.12), 0 1px 8px rgba(21,128,61,0.07)',
        'card-hover': '0 8px 40px rgba(21,128,61,0.18), 0 2px 10px rgba(21,128,61,0.10)',
        hero: '0 10px 40px rgba(21,128,61,0.28)',
        'player-hero': '0 12px 44px rgba(21,128,61,0.32)',
        tab:  '0 4px 18px rgba(21,128,61,0.22), 0 1px 4px rgba(21,128,61,0.12)',
      },
      keyframes: {
        sparkle: {
          '0%,100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '33%':     { opacity: '.8', transform: 'scale(1.15) rotate(5deg)' },
          '66%':     { opacity: '.9', transform: 'scale(1.07) rotate(-3deg)' },
        },
      },
      animation: {
        sparkle: 'sparkle 3s ease-in-out infinite',
      },
      borderRadius: {
        '14': '14px',
        '20': '20px',
        '24': '24px',
        '28': '28px',
      },
    },
  },
  plugins: [],
}

export default config
