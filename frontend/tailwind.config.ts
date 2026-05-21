import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zoom: {
          blue: "#0b5cff",
          ink: "#1f2329",
          muted: "#6b7280",
          line: "#e5e7eb",
          surface: "#f7f8fb",
        },
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
