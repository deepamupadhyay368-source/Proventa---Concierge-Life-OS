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
        display: ['var(--font-display)', 'Georgia', ' Cambria', 'serif'],
        serif: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // PROVENTA Architectural Editorial Design Tokens
        arch: {
          bg: '#171A14',
          charcoal: '#20211C',
          elevated: '#262821',
          ivory: '#F5F0E5',
          cream: '#E9DFCC',
          terracotta: '#B94E2D',
          'terracotta-hover': '#A14122',
          bronze: '#A98253',
          'text-dark': '#F6F0E4',
          'text-light': '#181914',
          muted: '#A7A194',
          'muted-light': '#5C584F',
          border: '#4C4A40',
          'border-light': '#D5CBB8',
        },
        brand: {
          50: '#F5F0E5',
          100: '#E9DFCC',
          200: '#D5CBB8',
          300: '#A98253',
          400: '#B94E2D',
          500: '#A14122',
          600: '#7D3219',
          700: '#4C4A40',
          800: '#262821',
          900: '#20211C',
          950: '#171A14',
        },
        neutral: {
          0: '#F5F0E5',
          50: '#EFE8D8',
          100: '#E9DFCC',
          200: '#D5CBB8',
          300: '#BEB4A2',
          400: '#A7A194',
          500: '#7D786C',
          600: '#5C584F',
          700: '#4C4A40',
          800: '#262821',
          900: '#20211C',
          950: '#171A14',
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
        md: 'calc(var(--radius) - 1px)',
        sm: '2px',
      },
      boxShadow: {
        subtle: '0 2px 12px -2px rgba(23, 26, 20, 0.08)',
        card: '0 8px 30px -8px rgba(23, 26, 20, 0.14)',
        elevated: '0 20px 50px -12px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
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
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
