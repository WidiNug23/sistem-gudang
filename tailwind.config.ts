import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ini yang membuat kelas 'font-sans' menggunakan variabel font Geist
        sans: ["var(--font-geist-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;