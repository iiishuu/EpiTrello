/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0079BF',
        success: '#61BD4F',
        warning: '#F2D600',
        danger: '#EB5A46',
      },
    },
  },
  plugins: [],
}
