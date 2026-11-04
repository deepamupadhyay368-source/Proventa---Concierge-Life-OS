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
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // PROVENTA MINERAL OLIVE DESIGN SYSTEM TOKENS
        olive: {
          DEFAULT: '#53634A', // Primary Mineral Olive
          hover: '#43503B',
          dark: '#384332',
          light: '#6B7F60',
          subtle: '#EEF1EC',
          border: '#6B7F60',
        },
        stone: {
          DEFAULT: '#F2F0E9', // Warm Stone Background
          light: '#E7E5DC',   // Light Stone
          surface: '#FFFFFF', // Pure White
          border: '#D9D8CF',  // Structural Border
          muted: '#777970',   // Muted Text
          dark: '#171A17',    // Near Black
        },
        copper: {
          DEFAULT: '#B87948', // Accent Muted Copper
          hover: '#9F6539',
          light: '#D18E5C',
          subtle: '#F7EFE9',
        },
        status: {
          success: '#496B4B',
          warning: '#B87948',
          error: '#A9433B',
        },
        // PROVENTA Construction Procurement Design System Tokens (Mapped to Mineral Olive)
        construct: {
          black: '#171A17',
          olive: '#53634A',
          'olive-hover': '#43503B',
          copper: '#B87948',
          stone: '#F2F0E9',
          'stone-light': '#E7E5DC',
          slate: '#2C302B',
          surface: '#FFFFFF',
          elevated: '#FFFFFF',
          steel: '#D9D8CF',
          border: '#D9D8CF',
          muted: '#777970',
          light: '#F2F0E9',
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
        subtle: '0 1px 3px 0 rgba(23, 26, 23, 0.05), 0 1px 2px -1px rgba(23, 26, 23, 0.05)',
        card: '0 4px 6px -1px rgba(23, 26, 23, 0.06), 0 2px 4px -2px rgba(23, 26, 23, 0.06)',
        elevated: '0 10px 15px -3px rgba(23, 26, 23, 0.08), 0 4px 6px -4px rgba(23, 26, 23, 0.08)',
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
