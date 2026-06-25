/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF5FB',
          100: '#D6EAF8',
          200: '#AED6F1',
          300: '#85C1E9',
          400: '#5DADE2',
          500: '#1B6CA8',
          600: '#1A5276',
          700: '#154360',
          800: '#0E2D44',
          900: '#071928',
        },
        ethiopia: {
          green: '#1E8449',
          yellow: '#D4AC0D',
          red: '#C0392B',
          dark: '#1A1A2E',
        },
        gov: {
          blue: '#1B4F72',
          lightblue: '#2E86C1',
          gold: '#B7950B',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
