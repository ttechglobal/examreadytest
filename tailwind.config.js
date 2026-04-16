/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#1A2B5E', mid: '#243575', light: '#EEF1FB', muted: '#7B8DBF' },
        cta:     { DEFAULT: '#1D6FEF', dark: '#1558CC', light: '#EBF2FE' },
        green:   { DEFAULT: '#19A96B', dark: '#0E8653', light: '#E8FAF2' },
        pop:     { DEFAULT: '#FF6B35', light: '#FFF0EB' },
        forest:  { DEFAULT: '#16A34A', light: '#DCFCE7' },
        ink:     '#0F172A',
        muted:   '#64748B',
        border:  '#E2E8F0',
        surface: '#F8FAFF',
        card:    '#FFFFFF',
        warning: '#D97706',
        danger:  '#DC2626',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'sans-serif'],
        sans:    ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        nunito:  ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        inter:   ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '18px', btn: '12px', pill: '50px', input: '10px' },
      boxShadow: {
        card:         '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 28px rgba(0,0,0,0.10)',
        'cta-glow':   '0 4px 20px rgba(29,111,239,0.28)',
        'green-glow': '0 4px 16px rgba(25,169,107,0.30)',
      },
      keyframes: {
        fadeSlideUp: { '0%': { opacity:'0', transform:'translateY(18px)' }, '100%': { opacity:'1', transform:'none' } },
        fadeIn:      { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        scaleIn:     { '0%': { opacity:'0', transform:'scale(0.95)' }, '100%': { opacity:'1', transform:'scale(1)' } },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.45s cubic-bezier(0.0,0.0,0.2,1) forwards',
        'fade-in':       'fadeIn 0.25s ease forwards',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
}