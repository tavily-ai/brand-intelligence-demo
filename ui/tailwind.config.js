/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tavily warm-neutral ramp (lightest → darkest), used via `ink-*`
        ink: {
          950: "#fefcf5", // warm cream
          900: "#f7f4ec",
          850: "#f0ece1", // subtle section bg
          800: "#e5ded1", // borders
          700: "#d3cabb", // dividers / dots
          600: "#a89f92", // placeholder / disabled
          500: "#7d7469", // tertiary text
          400: "#5c554d", // secondary text
          300: "#47423b",
          200: "#3f3b38",
          100: "#3C3A39", // headings / primary text — warm charcoal
        },
        // Tavily primary blue, used via `accent-*`
        accent: {
          300: "#7aa9ff",
          400: "#4d8bff",
          500: "#2677FF", // Tavily blue
          600: "#1a5fd6",
        },
        risk: {
          low: "#22C55E",       // green
          moderate: "#2677FF",  // blue
          elevated: "#FDC211",  // yellow
          high: "#ff272d",      // red
          critical: "#d41f24",
        },
      },
      fontFamily: {
        display: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', '"Inter"', '"Roboto"', "sans-serif"],
        body: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', '"Inter"', '"Roboto"', "sans-serif"],
        serif: ['"Georgia"', '"Times New Roman"', "serif"],
        mono: ['"IBM Plex Mono"', "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
