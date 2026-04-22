/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'solum-mint': '#e8fbf3',
        'solum-green': '#3fb351',
        'solum-dark': '#1a2b1f',
        'solum-black': '#111111',
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 
