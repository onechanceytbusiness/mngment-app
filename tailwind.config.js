/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand ramp anchored on mngmnt Coral (#FF5A3C) at -500.
        // Use brand-* for generic UI tints (active states, focus rings,
        // gradient CTAs) so swapping the brand later only requires
        // re-tuning this ramp.
        brand: {
          50: '#fff3f0',
          100: '#ffe1da',
          200: '#ffc7b8',
          300: '#ffa28a',
          400: '#ff7c5f',
          500: '#ff5a3c',
          600: '#ed4322',
          700: '#c2331a',
          800: '#9c2f1d',
          900: '#7d2a1c',
        },
        // Exact mngmnt palette from the brand board. Use these tokens
        // when a surface must hit the official hex (page backgrounds,
        // ink-on-paper headings, the coral accent dot, etc.).
        mngmnt: {
          ink: '#16161D',
          coral: '#FF5A3C',
          paper: '#F5F3EE',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px -2px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
