/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        memory: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      ringColor: {
        DEFAULT: '#f59e0b',
      },
      textColor: {
        DEFAULT: 'var(--color-text-primary)',
      },
    },
  },
  plugins: [],
}
