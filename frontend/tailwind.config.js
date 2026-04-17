/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        novamix: {
          orange: "#ff8d0a",
          "orange-dk": "#ea8006",
          teal: "#00817d",
          berylline: "#00817d45",
          amber: "#ff7f00",
          cream: "#FFF8F0",
        },
      },
      fontFamily: {
        display: ["'Roboto'", "serif"],
        body: ["'Roboto'", "sans-serif"],
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "80%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "bounce-in": "bounceIn 0.6s ease forwards",
        "fade-up": "fadeUp 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
