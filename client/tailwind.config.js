/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          primary: "#1E3A8A",
          secondary: "#14B8A6",
          parallel: "#8B5CF6",
          accent: "#F59E0B",
          bg: "#F9FAFB",
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

