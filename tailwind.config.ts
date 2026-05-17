import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f5",
          100: "#ededea",
          200: "#d6d6d0",
          400: "#8a8a82",
          600: "#4a4a44",
          800: "#1f1f1c",
          900: "#0e0e0c",
        },
        accent: {
          DEFAULT: "#ff5b1f",
          soft: "#ffe1d2",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
