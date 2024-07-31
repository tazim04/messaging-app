/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      sm: ["0.7rem", "1.25rem"],
      base: ["1.25rem", "1.8rem"],
      lg: ["1.8rem", "2rem"],
      xl: ["2rem", "2.25rem"],
    },
    extend: {},
  },
  plugins: [],
};
