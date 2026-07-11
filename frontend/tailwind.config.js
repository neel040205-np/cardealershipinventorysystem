/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7fa",
          100: "#e4ebf2",
          500: "#0066cc",
          600: "#0052a3",
          900: "#0a1d37"
        }
      }
    }
  },
  plugins: []
};
