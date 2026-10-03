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
        // Palette de la page d'accueil (chaleureuse, esprit "presse").
        corail: { DEFAULT: "#ec5f52", fonce: "#d64a3e", pale: "#fdece8" },
        rose: "#f5b9e6",
        encre: { DEFAULT: "#1d3b47", clair: "#2d5566" },
        creme: "#fff7f3",
      },
      fontFamily: {
        titre: ["var(--font-titre)", "system-ui", "sans-serif"],
        texte: ["var(--font-texte)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
