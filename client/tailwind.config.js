/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          primary: "#5C2C16",
          secondary: "#D4AF37",
          accent: "#A0522D",
          bg: "#FAF7F4",
          text: "#1F2937"
        }
      },
      boxShadow: {
        glass: "0 10px 30px rgba(2, 6, 23, 0.08)"
      },
      backdropBlur: {
        glass: "12px"
      }
    }
  },
  darkMode: "class",
  plugins: []
};

