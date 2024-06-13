/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./src/*.elm", // exclude src/Main.elm because there should not be any tailwind classes inside generated js
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

