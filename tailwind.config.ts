import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: '#f0f4f8',
          100: '#e1e9f1',
          200: '#c3d3e3',
          300: '#a5bdd5',
          400: '#87a7c7',
          500: '#6991b9',
          600: '#5474a4',
          700: '#3f578f',
          800: '#2a3a7a',
          900: '#151d65',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
