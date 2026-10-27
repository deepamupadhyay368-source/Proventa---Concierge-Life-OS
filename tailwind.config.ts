import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // THE BUSINESS INDEX — Ink-Black, Warm Paper-Ivory & Acid-Lime tokens
        paper: {
          DEFAULT: '#F4F1EA',
          elevated: '#FAF8F3',
          recessed: '#EAE5DA',
          rule: '#CFCAC0',
        },
        ink: {
          DEFAULT: '#0D0E11',
          muted: '#52514E',
          subtle: '#78756F',
        },
        lime: {
          DEFAULT: '#C8F904',
          muted: '#B5E200',
        },
        brand: {
          50: '#FAF8F3',
          100: '#F4F1EA',
          200: '#EAE5DA',
          300: '#CFCAC0',
          400: '#9E998E',
          500: '#78756F',
          600: '#52514E',
          700: '#333330',
          800: '#1D1E22',
          900: '#131417',
          950: '#0D0E11',
        },
        neutral: {
          0: '#FAF8F3',
          50: '#F4F1EA',
          100: '#EAE5DA',
          200: '#DCD6C8',
          300: '#CFCAC0',
          400: '#9E998E',
          500: '#78756F',
          600: '#52514E',
          700: '#333330',
          800: '#1D1E22',
          900: '#131417',
          950: '#0D0E11',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
      boxShadow: {
        subtle: 'none',
        card: 'none',
        elevated: '4px 4px 0px 0px #0D0E11',
        hard: '3px 3px 0px 0px #0D0E11',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
