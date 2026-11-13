export function cn(...args) {
  return args.flat(Infinity).filter(Boolean).join(" ");
}
export const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const BRAND = { name: "SevaCoop", tagline: "Cooperative Gig Services" };

export function extractApiError(ex, fallback = "Request failed") {
  const data = ex?.response?.data;
  const d = data?.detail;
  if (Array.isArray(d)) {
    return (
      d
        .map((x) => String(x?.msg || "").replace(/^Value error,\s*/i, ""))
        .filter(Boolean)
        .join(". ") || fallback
    );
  }
  if (typeof d === "string" && d.trim()) return d;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (!ex?.response) return "Cannot reach server. Please ensure the backend service is running.";
  if (ex.response.status >= 500) return "Server error while processing request. Please check backend logs.";
  return fallback;
}
