/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          dim: 'var(--ink-dim)',
          hover: 'var(--ink-hover)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          sunken: 'var(--surface-sunken)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          DEFAULT: 'var(--text)',
          dim: 'var(--text-dim)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: [
          'Departure Mono',
          'Geist Mono',
          'JetBrains Mono',
          'SF Mono',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        '3xs': '0.5625rem', // 9px
      },
    },
  },
  plugins: [],
};
