import type { Config } from "tailwindcss";

export default {
  content: ["./entrypoints/**/*.{html,ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 18px 60px rgba(34, 197, 94, 0.28)"
      }
    }
  },
  plugins: []
} satisfies Config;
