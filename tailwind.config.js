/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // פלטת ארכיון: שמנת, שחור-דיו ואפור אבן
        archive: {
          paper: '#F9F8F6', // Stone-50 עדין
          ink: '#1C1917',   // Stone-900 עמוק
          accent: '#78716C', // Stone-500 להדגשות
        },
      },
      fontFamily: {
        sans: ['Inter', 'Heebo', 'Arial', 'sans-serif'],
        // שימוש בפונט סריף עברי (כמו Frank Ruhl Libre)
        serif: ['"Frank Ruhl Libre"', 'serif'],
      },
    },
  },
  plugins: [],
}
