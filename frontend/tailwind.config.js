/** SevaCoop Modern Cooperative Marketplace Theme */
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
        stoneblack: {
          DEFAULT: "#ffffff",
          base: "#f8fafc",
          surface: "#f1f5f9",
          card: "#ffffff",
          elevated: "#ffffff",
          border: "#e2e8f0",
          borderBright: "#cbd5e1",
          subtle: "#f1f5f9",
        },
        background: "#f8fafc",
        foreground: "#0f172a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        primary: {
          DEFAULT: "#059669",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#d97706",
          foreground: "#ffffff",
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
        border: "#e2e8f0",
        input: "#ffffff",
        ring: "#059669",
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.05), 0 8px 24px -8px rgb(15 23 42 / 0.06)",
        glass: "0 20px 48px -12px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.06)",
        glow: "0 8px 24px -4px rgba(5, 150, 105, 0.28)",
        "glow-white": "0 8px 24px -4px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
