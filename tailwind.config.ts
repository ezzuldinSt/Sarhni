import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          900: "#2C1A1D", // Deep Espresso (Background)
          800: "#3E2723", // Saddle Brown (Cards)
          700: "#4E342E", // Lighter Brown
          600: "#5D4037", // Warm Tan
          500: "#795548",
          accent: "#D7CCC8", // Creamy Latte (Text)
          pop: "#FFB74D",    // Burnt Orange/Gold (Buttons)
          popHover: "#F57C00"
        }
      },
      fontFamily: {
        sans: ['"Varela Round"', '"Tajawal"', 'sans-serif'],
      },
      backgroundImage: {
        'leather-texture': "url('/noise.png')",
      },
      keyframes: {
        'glitch-1': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(-2px, 1px)' },
          '66%': { transform: 'translate(2px, -1px)' },
        },
        'glitch-2': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(2px, -1px)' },
          '66%': { transform: 'translate(-2px, 1px)' },
        },
      },
      animation: {
        'glitch-1': 'glitch-1 0.2s infinite',
        'glitch-2': 'glitch-2 0.3s infinite',
      },
    },
  },
  plugins: [],
};
export default config;
