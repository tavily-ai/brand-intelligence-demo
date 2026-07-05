/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Redwood warm-neutral ramp (lightest → darkest), used via `ink-*`
        ink: {
          950: "#faf9f8",
          900: "#f4f2f0",
          850: "#ece9e6",
          800: "#ded9d4", // borders
          700: "#cac4bd", // dividers / dots
          600: "#a69f97", // placeholder / disabled
          500: "#7a736b", // tertiary text
          400: "#57524c", // secondary text
          300: "#3b3934",
          200: "#2a2825",
          100: "#1c1b19", // headings / primary text
        },
        // Oracle Red (Redwood brand), used via `accent-*`
        accent: {
          300: "#e39b8f",
          400: "#d46a55",
          500: "#c74634", // Oracle Red — PMS 180C
          600: "#a6392a",
        },
        risk: {
          low: "#3a7d44",
          moderate: "#1b6b75",
          elevated: "#c07b2a",
          high: "#c74634",
          critical: "#a6392a",
        },
      },
      fontFamily: {
        display: ['"Inter"', '"Helvetica Neue"', "Arial", "system-ui", "sans-serif"],
        body: ['"Inter"', '"Helvetica Neue"', "Arial", "system-ui", "sans-serif"],
        serif: ['"Georgia"', '"Times New Roman"', "serif"],
        mono: ['"IBM Plex Mono"', "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
