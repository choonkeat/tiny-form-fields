/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./src/*.elm", // exclude src/Main.elm because there should not be any tailwind classes inside generated js
    "./index.html"
  ],
  theme: {
    extend: {

      // that is animation class
      animation: {
        yellowFade: 'yellowFadeOut 500ms ease-out', // sync with animateFadeDuration
        fadeOut: 'fadeOut 500ms ease-out', // sync with animateFadeDuration
      },

      // that is actual animation
      keyframes: theme => ({
        yellowFadeOut: {
          '0%': { backgroundColor: theme('colors.yellow.200') },
          '100%': { backgroundColor: theme('colors.transparent') },
        },
        fadeOut: {
          '0%': {  },
          '100%': { opacity: theme('opacity.0'), backgroundColor: theme('colors.yellow.200') },
        },
      }),
    },
  },
  plugins: [],
}

