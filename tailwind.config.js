/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9ACD32', // Зеленый фон
        secondary: '#000000', // Черный
        accent: '#FFFFFF', // Белый
        'green-900/80': 'rgba(154, 205, 50, 0.8)', // Прозрачный зеленый
        'green-800/60': 'rgba(154, 205, 50, 0.6)', // Прозрачный зеленый
      }
    },
  },
  plugins: [],
}