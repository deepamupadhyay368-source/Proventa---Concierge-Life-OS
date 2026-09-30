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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // Proventa Slate + Silver + White Color System
        proventa: {
          bg: '#FFFFFF',
          'bg-subtle': '#F7F8FA',
          surface: '#F1F3F5',
          border: '#E1E5E8',
          silver: '#A7B0B8',
          'silver-soft': '#E5E9ED',
          'text-secondary': '#66717C',
          slate: '#303942',
          'slate-primary': '#1F2933',
          'slate-deep': '#111820',
        },
        brand: {
          50: '#F7F8FA',
          100: '#F1F3F5',
          200: '#E5E9ED',
          300: '#E1E5E8',
          400: '#A7B0B8',
          500: '#66717C',
          600: '#485460',
          700: '#303942',
          800: '#1F2933',
          900: '#1F2933',
          950: '#111820',
        },
        slate: {
          50: '#F7F8FA',
          100: '#F1F3F5',
          200: '#E5E9ED',
          300: '#E1E5E8',
          400: '#A7B0B8',
          500: '#66717C',
          600: '#485460',
          700: '#303942',
          800: '#1F2933',
          900: '#1F2933',
          950: '#111820',
        },
        silver: {
          50: '#FAFAFB',
          100: '#F7F8FA',
          200: '#F1F3F5',
          300: '#E5E9ED',
          400: '#E1E5E8',
          500: '#A7B0B8',
          600: '#8795A1',
          700: '#66717C',
          800: '#485460',
          900: '#1F2933',
        },
        // Slate-based neutral
        neutral: {
          0: '#ffffff',
          50: '#f7f8fa',
          100: '#f1f3f5',
          200: '#e5e9ed',
          300: '#e1e5e8',
          400: '#a7b0b8',
          500: '#8795a1',
          600: '#66717c',
          700: '#485460',
          800: '#303942',
          900: '#1f2933',
          950: '#111820',
        },
        // Semantic
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
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: {
        brand: {
          css: {
            '--tw-prose-body': '#303942',
            '--tw-prose-headings': '#111820',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
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
