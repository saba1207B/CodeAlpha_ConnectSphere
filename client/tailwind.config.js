/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#01472e',
          light: '#015c3c',
          dark: '#003321',
        },
        sage: {
          DEFAULT: '#ccd5ae',
          light: '#d9e0be',
          dark: '#b9c497',
        },
        olive: {
          DEFAULT: '#e9edc9',
          light: '#f2f5da',
          dark: '#dbe0b0',
        },
        cream: {
          DEFAULT: '#fefae0',
          light: '#fffdf0',
          dark: '#f6f0c6',
        },
        moss: {
          DEFAULT: '#a3b18a',
          light: '#b6c2a1',
          dark: '#8b9b71',
        },
        terracotta: {
          DEFAULT: '#e07a5f',
          light: '#f4a261',
          dark: '#c85a32',
        },
        amber: {
          DEFAULT: '#e09f3e',
          light: '#f3c06d',
          dark: '#b87d28',
        },
        clay: {
          DEFAULT: '#ddbea9',
          light: '#ffe8d6',
          dark: '#cb997e',
        },
        coral: {
          DEFAULT: '#ee6c4d',
          light: '#f28e75',
          dark: '#d94824',
        }
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'organic-sm': '1.5rem',
        'organic-md': '2.5rem',
        'organic-lg': '3rem',
        'organic-xl': '5rem',
      },
      boxShadow: {
        'deep': '0 20px 40px -15px rgba(1, 71, 46, 0.20)',
        'deep-lg': '0 30px 60px -15px rgba(1, 71, 46, 0.25)',
        'floating': '0 25px 50px -12px rgba(1, 71, 46, 0.22)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
