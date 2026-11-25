/** SevaCoop Urban-Inspired Clean Marketplace Theme */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        uc: {
          black: "#0F0F0F",
          tile: "#F5F5F5",
          canvas: "#FAFAFA",
          border: "#E5E5E5",
          purple: "#6E42E5",
        },
        background: "#FFFFFF",
        foreground: "#0F0F0F",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F0F0F",
        },
        primary: {
          DEFAULT: "#0F0F0F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F5",
          foreground: "#0F0F0F",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#6E42E5",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#E5E5E5",
        input: "#FFFFFF",
        ring: "#0F0F0F",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        card: "0 2px 8px 0 rgb(0 0 0 / 0.04), 0 1px 2px 0 rgb(0 0 0 / 0.04)",
        glass: "0 12px 32px -8px rgb(0 0 0 / 0.1), 0 2px 6px rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};
