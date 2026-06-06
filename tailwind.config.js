/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode palette (Premium Neon SaaS)
        'dark-bg': '#050816',
        'dark-card': '#101827',
        'dark-card-secondary': '#151F35',
        'dark-border': 'rgba(138,77,255,0.25)',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#B4C2D9',
        'dark-text-weak': '#71819D',
        'dark-hover': '#151F35',

        // Light mode palette (Premium SaaS)
        'light-bg': '#F2F4F8',
        'light-card': '#FFFFFF',
        'light-card-secondary': '#ECEFF4',
        'light-text': '#111827',
        'light-text-secondary': '#4B5563',
        'light-border': '#E4E7EC',
        'light-shadow': 'rgba(15, 23, 42, 0.06)',

        // Neon brand colors - Dark mode
        'neon-blue': '#27C9FF',
        'neon-blue-glow': '#00B8FF',
        'neon-purple': '#8A4DFF',
        'neon-purple-glow': '#B35CFF',

        // Neon brand colors - Light mode
        'neon-blue-light': '#009DFF',
        'neon-purple-light': '#8A4DFF',
        'neon-indigo': '#5B7CFF',

        // Brand aliases (preserved for compatibility)
        brand: {
          purple: '#8A4DFF',
          'purple-dark': '#8A4DFF',
        },
        // Status aliases constrained to the official blue/purple palette
        success: '#27C9FF',
        warning: '#8A4DFF',
        error: '#B35CFF',
        info: '#00B8FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #8A4DFF 0%, #5B7CFF 50%, #27C9FF 100%)',
        'gradient-neon': 'linear-gradient(135deg, #8A4DFF 0%, #27C9FF 100%)',
        'glow-light': 'radial-gradient(circle at center, rgba(39,201,255,0.15), transparent 70%)',
        'glow-neon-purple': 'radial-gradient(circle at center, rgba(138,77,255,0.15), transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(39,201,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(39,201,255,0.4)' },
        },
      },
      boxShadow: {
        'sm-glow': '0 2px 8px rgba(39,201,255,0.1)',
        'glow': '0 4px 16px rgba(39,201,255,0.15)',
        'glow-lg': '0 8px 32px rgba(39,201,255,0.2)',
        'glow-purple': '0 4px 16px rgba(138,77,255,0.15)',
        'glow-purple-lg': '0 8px 32px rgba(138,77,255,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 0 25px rgba(39,201,255,0.15), 0 0 25px rgba(138,77,255,0.15)',
      },
    },
  },
  plugins: [],
};
