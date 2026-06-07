/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102014",
        leaf: "#c8ea5a",
        moss: "#5f9723",
        sage: "#52634d"
      },
      boxShadow: {
        glass: "0 18px 46px rgba(11, 29, 18, 0.18)",
        soft: "0 18px 50px rgba(27, 59, 18, 0.08)"
      }
    }
  },
  plugins: []
};
