/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0c',
        bone: '#f2efe7',
        volt: '#d8ff3e',
        // kept for /admin, which still uses the previous palette
        primary: '#c9ae73',
        'primary-light': '#e3d2a6',
        dark: '#070709',
        darker: '#030304',
        surface: '#0d0d12',
      },
      fontFamily: {
        sans: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // /admin still asks for font-display
        display: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
