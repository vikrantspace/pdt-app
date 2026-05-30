/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pdt-dark':  '#1B3A6B',
        'pdt-mid':   '#2E6DA4',
        'pdt-light': '#D5E8F0',
        'pdt-orange':'#E87722',
        'pdt-green': '#1E8449',
        'pdt-red':   '#C0392B',
        'pdt-amber': '#D68910',
      },
    },
  },
  plugins: [],
}
