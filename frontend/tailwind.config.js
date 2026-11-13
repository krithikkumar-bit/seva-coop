/** SevaCoop Unified Theme - Stoneblack & Brutalist 3D */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Space Grotesk",
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Chakra Petch",
          "Space Grotesk",
          "Syne",
          "sans-serif",
        ],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        stoneblack: {
          DEFAULT: "#0f1013",
          base: "#0b0c0e",
          surface: "#121317",
          card: "#15171d",
          elevated: "#1a1c23",
          border: "rgba(255, 255, 255, 0.12)",
          borderBright: "rgba(255, 255, 255, 0.28)",
          subtle: "rgba(255, 255, 255, 0.06)",
        },
        background: "#0f1013",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(21, 23, 29, 0.88)",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#10b981",
          foreground: "#0f1013",
        },
        secondary: {
          DEFAULT: "#1e222b",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#16181f",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#d4af6a",
          foreground: "#1c1917",
        },
        mint: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.12)",
        input: "#15171d",
        ring: "#10b981",
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1.1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        glass: "0 20px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        glow: "0 0 25px rgba(16, 185, 129, 0.35)",
        "glow-white": "0 0 25px rgba(255, 255, 255, 0.15)",
      },
    },
  },
  plugins: [],
};
