/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/**/*.svg',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
