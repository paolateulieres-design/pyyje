/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e1eaff",
          500: "#3457d5",
          600: "#2743b0",
          700: "#1f3690",
        },
      },
    },
  },
  plugins: [],
};
