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
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['var(--font-serif)', 'Newsreader', 'Georgia', 'Charter', 'Times New Roman', 'serif'],
        display: ['var(--font-serif)', 'Newsreader', 'Georgia', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // PROVENTA REAL ESTATE INTELLIGENCE OFFICIAL PALETTE
        proventa: {
          navy: '#202B3C',
          ivory: '#F5F3ED',
          green: '#547568',
          stone: '#C8C4BA',
          stoneLight: '#E2DFD6',
          white: '#FFFFFF',
          text: '#202B3C',
          muted: '#69717B',
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
