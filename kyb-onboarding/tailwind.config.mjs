/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scans all your components and screens
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--c-background) / <alpha-value>)",
        "surface-card": "rgb(var(--c-surface-card) / <alpha-value>)",
        "surface-sunken": "rgb(var(--c-surface-sunken) / <alpha-value>)",
        "surface-hover": "rgb(var(--c-surface-hover) / <alpha-value>)",
        "surface-selected": "rgb(var(--c-surface-selected) / <alpha-value>)",
        "fg-primary": "rgb(var(--c-fg-primary) / <alpha-value>)",
        "fg-secondary": "rgb(var(--c-fg-secondary) / <alpha-value>)",
        "fg-tertiary": "rgb(var(--c-fg-tertiary) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-subtle": "rgb(var(--c-line-subtle) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        brand: "rgb(var(--c-brand) / <alpha-value>)",
        "brand-subtle": "rgb(var(--c-brand-subtle) / <alpha-value>)",
        pos: "rgb(var(--c-pos) / <alpha-value>)",
        "pos-bg": "rgb(var(--c-pos-bg) / <alpha-value>)",
        "pos-fg": "rgb(var(--c-pos-fg) / <alpha-value>)",
        "pos-border": "rgb(var(--c-pos-border) / <alpha-value>)",
        neg: "rgb(var(--c-neg) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};