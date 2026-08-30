/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          light: '#FAF8F5',
          DEFAULT: '#FAF6EE',
          dark: '#F4EFEB',
        },
        terracotta: {
          DEFAULT: '#A83E15',
          hover: '#923410',
          light: '#F5EBE6',
        },
        charcoal: {
          DEFAULT: '#2E1A0F',
          light: '#5C4C42',
        },
        borderCream: '#EADFD5',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['System-UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-cream',
    'bg-cream-light',
    'bg-cream-dark',
    'bg-terracotta',
    'bg-terracotta-light',
    'bg-terracotta-hover',
    'bg-charcoal',
    'bg-charcoal-light',
  ],
}
