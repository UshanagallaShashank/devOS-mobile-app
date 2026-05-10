/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#12121A',
        border: '#1E1E2E',
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#10B981',
        warn: '#F59E0B',
        danger: '#EF4444',
        text: '#F1F5F9',
        muted: '#64748B',
        subtle: '#1E293B',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
