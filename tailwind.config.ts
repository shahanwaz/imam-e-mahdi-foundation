import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep Forest Green Primary & Secondary System
        forest: {
          50: '#EEF5F1',
          100: '#D2F0E6',
          200: '#A5E1CD',
          300: '#6CC8AC',
          400: '#38A787',
          500: '#1A8768',
          600: '#116E53',
          700: '#0B5D46', // Secondary Green Base
          800: '#084836',
          900: '#063B2E', // Primary Deep Forest Green Base
          950: '#032119',
        },
        // Emerald alias aligned with Forest theme
        emerald: {
          50: '#EEF5F1',
          100: '#D2F0E6',
          200: '#A5E1CD',
          300: '#6CC8AC',
          400: '#38A787',
          500: '#1A8768',
          600: '#116E53',
          700: '#0B5D46',
          800: '#084836',
          900: '#063B2E',
          950: '#032119',
        },
        // Muted Gold Accent
        gold: {
          50: '#FAF7EE',
          100: '#F4ECD4',
          200: '#EADAA9',
          300: '#DFC47E',
          400: '#C9A24A', // Muted Gold Accent Base
          500: '#B89238',
          600: '#997629',
          700: '#7A5B1D',
          800: '#5F4616',
          900: '#3E2E0D',
          950: '#231906',
        },
        // Theme Surfaces & Text Colors
        surface: {
          bg: '#FCFBF7', // Soft Cream
          cream: '#FCFBF7',
          ivory: '#F7F5EF', // Warm Ivory
          card: '#FFFFFF',
          border: '#E5E7E2',
          muted: '#EEF5F1', // Soft Green
          dark: '#063B2E',
        },
        charcoal: {
          DEFAULT: '#17201C', // Primary Text
          muted: '#64706A', // Secondary Text
          light: '#8E9A94',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        arabic: ['Amiri', 'Noto Naskh Arabic', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(6, 59, 46, 0.04)',
        card: '0 4px 20px -2px rgba(6, 59, 46, 0.06), 0 2px 6px -1px rgba(6, 59, 46, 0.03)',
        elevated: '0 20px 30px -10px rgba(6, 59, 46, 0.12), 0 8px 10px -6px rgba(6, 59, 46, 0.05)',
        gold: '0 0 15px rgba(201, 162, 74, 0.25)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
