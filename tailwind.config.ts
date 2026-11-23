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
        sans: ['var(--font-sans)', 'Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // PROVENTA HOME WARM ARCHITECTURAL PALETTE
        home: {
          olive: '#53634A',
          'olive-dark': '#3F4C38',
          'olive-light': '#6B7E5F',
          stone: '#F2F0E9',
          'stone-dark': '#E6E2D6',
          'stone-card': '#FAF8F5',
          black: '#171A17',
          charcoal: '#242B24',
          sage: '#89947F',
          'sage-light': '#D6DBD2',
          border: '#E3DFD5',
          'border-dark': '#C9C4B7',
          terracotta: '#C97A53',
          'terracotta-dark': '#AD623E',
          card: '#FFFFFF',
          text: '#171A17',
          muted: '#5F685B',
        },
        // PROVENTA ARCHITECTURAL INDUSTRIAL PALETTE
        arch: {
          bg: '#FFFFFF',          // Primary background
          secondary: '#F4F7FA',   // Secondary background
          text: '#243447',        // Primary text
          muted: '#6B7785',       // Secondary text
          blue: '#315F91',        // Primary blue
          'blue-hover': '#264B74',
          steel: '#AEBBC6',       // Steel grey
          border: '#E2E8EF',      // Light border
          white: '#FFFFFF',
        },
        infra: {
          bg: '#FFFFFF',
          nav: '#FFFFFF',
          secondary: '#F4F7FA',
          surface: '#FFFFFF',
          steel: '#315F91',
          'steel-hover': '#264B74',
          orange: '#315F91',
          'orange-hover': '#264B74',
          border: '#E2E8EF',
          text: '#243447',
          muted: '#6B7785',
          white: '#FFFFFF',
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
        xs: '2px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.25)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
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
