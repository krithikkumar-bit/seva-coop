export function cn(...args) {
  return args.flat(Infinity).filter(Boolean).join(" ");
}
export const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const BRAND = { name: "SevaCoop", tagline: "Cooperative Home Services" };

export const SERVICE_IMAGES = {
  electrician: "/images/electrician.jpg",
  plumber: "/images/plumber.jpg",
  carpenter: "/images/carpenter.jpg",
  painter: "/images/painter.jpg",
  cleaning: "/images/cleaning.jpg",
  "ac technician": "/images/ac_technician.jpg",
  ac_technician: "/images/ac_technician.jpg",
  driver: "/images/driver.jpg",
  gardener: "/images/gardener.jpg",
  caregiver: "/images/caregiver.jpg",
  "domestic helper": "/images/domestic_helper.jpg",
  domestic_helper: "/images/domestic_helper.jpg",
};

export function getServiceImage(name = "") {
  const key = String(name || "").trim().toLowerCase();
  if (SERVICE_IMAGES[key]) return SERVICE_IMAGES[key];
  for (const [k, url] of Object.entries(SERVICE_IMAGES)) {
    if (key.includes(k.replace("_", " "))) return url;
  }
  return "/images/electrician.jpg";
}

export const FALLBACK_SERVICES = [
  { id: 1, name: "Electrician", name_hi: "इलेक्ट्रीशियन", base_price: 350, description: "Certified electricians for wiring, switches, fans, lights & power backup." },
  { id: 2, name: "Plumber", name_hi: "प्लंबर", base_price: 350, description: "Leak repairs, pipe fitting, tap installation & water purifier care." },
  { id: 3, name: "Carpenter", name_hi: "बढ़ई", base_price: 400, description: "Door and lock repairs, furniture assembly & custom wooden fixtures." },
  { id: 4, name: "Painter", name_hi: "पेंटर", base_price: 500, description: "Interior & exterior wall painting, waterproofing putty & finishes." },
  { id: 5, name: "Cleaning", name_hi: "सफाई", base_price: 450, description: "Deep kitchen, bathroom, sofa & full-home sanitization." },
  { id: 6, name: "Driver", name_hi: "ड्राइवर", base_price: 300, description: "Verified city & outstation drivers with audited licenses." },
  { id: 7, name: "Gardener", name_hi: "माली", base_price: 300, description: "Terrace gardens, lawn care, pruning & organic planting." },
  { id: 8, name: "Caregiver", name_hi: "देखभालकर्ता", base_price: 550, description: "Compassionate elderly care, vital monitoring & bedside support." },
  { id: 9, name: "Domestic Helper", name_hi: "घरेलू सहायक", base_price: 280, description: "Trusted daily cooking, pantry help & household assistance." },
  { id: 10, name: "AC Technician", name_hi: "एसी तकनीशियन", base_price: 600, description: "AC servicing, filter cleaning, cooling diagnostics & gas refill." },
];

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
  if (ex && !(ex.isAxiosError && !ex.response) && typeof ex.message === "string" && ex.message && ex.message !== "Network Error") {
    return ex.message;
  }
  if (!ex?.response) return "Cannot reach server. Please ensure the backend service is running.";
  if (ex.response.status >= 500) return "Server error while processing request. Please check backend logs.";
  return fallback;
}
