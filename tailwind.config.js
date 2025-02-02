/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    screens: {
      'custom-sm': '500px',
      'custom-md': '784px',
      'custom-md2': '800px',
      'custom-md3': '832px',
      'custom-lg': '1136px',
    },
  },
  plugins: [],
}

