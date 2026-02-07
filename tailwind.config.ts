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
        },
        // Semantic colors for consistent UI states
        success: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          bg: "rgba(34, 197, 94, 0.2)",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          bg: "rgba(59, 130, 246, 0.2)",
        },
        warning: {
          DEFAULT: "#eab308",
          light: "#fde047",
          bg: "rgba(234, 179, 8, 0.2)",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          hover: "#dc2626",
          bg: "rgba(239, 68, 68, 0.2)",
        }
      },
      fontFamily: {
        sans: ['"Varela Round"', '"Tajawal"', 'sans-serif'],
      },
      backgroundImage: {
        'leather-texture': "url('/noise.png')",
      },
      // Standardized z-index scale for consistent layering
      zIndex: {
        'base': '0',
        'overlay': '10',
        'dropdown': '20',
        'sticky': '30',
        'fixed': '40',
        'modal-backdrop': '50',
        'modal': '60',
        'popover': '70',
      },
      // Semantic spacing for common patterns
      spacing: {
        'touch': '44px', // Standard touch target size
      },
      // Semantic border-radius for consistent shapes
      borderRadius: {
        'card': 'xl',
        'modal': '2xl',
        'button': 'lg',
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
