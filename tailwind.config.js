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
          // Ramp "encre" : utilisée par tout l'espace connecté.
          50: "#eef2f7",
          100: "#dbe4ee",
          500: "#14304a",
          600: "#0e2338",
          700: "#14304a",
        },
        // Palette "Encre et jaune presse" (tout le site).
        encre: { DEFAULT: "#14304a", clair: "#2a5578", pale: "#eef2f7" },
        jaune: { DEFAULT: "#ffd84d", fonce: "#f5c518", pale: "#fff6cc" },
        fond: "#f4f6f9",
      },
      fontFamily: {
        titre: ["var(--font-titre)", "system-ui", "sans-serif"],
        texte: ["var(--font-texte)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
