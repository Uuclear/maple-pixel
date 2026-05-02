import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
      },
      colors: {
        maple: {
          bg: "var(--bg-primary)",
          panel: "var(--bg-secondary)",
          widget: "var(--bg-tertiary)",
          border: "var(--border-color)",
          text: "var(--text-primary)",
          textMuted: "var(--text-secondary)",
          accent: "var(--accent)",
          accentHover: "var(--accent-hover)",
          danger: "var(--danger)",
          success: "var(--success)",
        },
      },
      boxShadow: {
        pixel: "var(--pixel-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
