import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    headers: SECURITY_HEADERS,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.razorpay.com; connect-src 'self' https://prod.spline.design https://*.vercel.app https://api.razorpay.com https://lumberjack.razorpay.com; frame-src 'self' https://api.razorpay.com; frame-ancestors 'none'; form-action 'self'; object-src 'none'; base-uri 'self';",
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
