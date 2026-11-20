import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        primary: {
          DEFAULT: '#1D4ED8',
          hover: '#1E3A8A',
        },
        success: '#15803D',
        warning: '#D97706',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
};

export default config;

