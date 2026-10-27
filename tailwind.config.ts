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
        serif: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // PROVENTA Core Design System Tokens
        proventa: {
          bg: '#FAFAF8',
          surface: '#FFFFFF',
          subtle: '#F2F3F6',
          text: '#15171B',
          muted: '#696D76',
          accent: '#304FFE',
          'accent-hover': '#243FE0',
          'accent-soft': '#EEF1FF',
          dark: '#101319',
          'dark-surface': '#181C24',
          'dark-border': '#252A36',
          border: '#E8E9ED',
          success: '#16845B',
          'success-bg': '#ECFDF5',
          warning: '#B7791F',
          'warning-bg': '#FFFBEB',
          error: '#C53B43',
          'error-bg': '#FEF2F2',
        },
        // Brand scale aligned with modern slate/electric-blue architecture
        brand: {
          50: '#FAFAF8',
          100: '#F2F3F6',
          200: '#E8E9ED',
          300: '#D1D4DC',
          400: '#9CA1AE',
          500: '#696D76',
          600: '#4B4F58',
          700: '#32363E',
          800: '#1E2128',
          900: '#15171B',
          950: '#101319',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAF8',
          100: '#F2F3F6',
          200: '#E8E9ED',
          300: '#D5D7DE',
          400: '#A0A4B0',
          500: '#696D76',
          600: '#4E525B',
          700: '#353840',
          800: '#21242B',
          900: '#15171B',
          950: '#101319',
        },
        // Semantic Shadcn / Radix mappings
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
        xl: '0.875rem', // 14px
        lg: '0.625rem', // 10px
        md: '0.5rem',   // 8px
        sm: '0.375rem', // 6px
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(16, 19, 25, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(16, 19, 25, 0.07), 0 2px 6px -1px rgba(16, 19, 25, 0.04)',
        'elevated': '0 12px 32px -8px rgba(16, 19, 25, 0.10), 0 4px 12px -2px rgba(16, 19, 25, 0.05)',
      },
      typography: {
        brand: {
          css: {
            '--tw-prose-body': '#15171B',
            '--tw-prose-headings': '#15171B',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
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
