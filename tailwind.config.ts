import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-geist)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
        display: ["Syne", "system-ui", "sans-serif"],
      },
      colors: {
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      boxShadow: {
        paper:
          "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.06)",
        card: "0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
