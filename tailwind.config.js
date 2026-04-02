/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Frank Ruhl Libre', 'David Libre', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
