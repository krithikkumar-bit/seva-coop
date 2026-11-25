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
  "salon for women": "/images/salon_women.jpg",
  "salon for men & kids": "/images/salon_men.jpg",
  "spa for women": "/images/spa_women.jpg",
  "spa for men": "/images/spa_men.jpg",
  "pest control": "/images/pest_control.jpg",
  "washing machine repair": "/images/washing_machine.jpg",
  "refrigerator repair": "/images/refrigerator.jpg",
  "water purifier (ro) service": "/images/water_purifier.jpg",
  "microwave & chimney repair": "/images/microwave_chimney.jpg",
  "tv & laptop repair": "/images/tv_laptop.jpg",
  "sofa & carpet cleaning": "/images/sofa_cleaning.jpg",
  "bathroom & kitchen cleaning": "/images/bathroom_cleaning.jpg",
};

export function getServiceImage(name = "") {
  const key = String(name || "").trim().toLowerCase();
  if (SERVICE_IMAGES[key]) return SERVICE_IMAGES[key];
  for (const [k, url] of Object.entries(SERVICE_IMAGES)) {
    if (key.includes(k.replace(/_/g, " "))) return url;
  }
  return "/images/electrician.jpg";
}

export const SERVICE_GROUPS = [
  {
    key: "salon_spa",
    label: "Salon & Spa at Home",
    shortLabel: "Salon & Spa",
    img: "/images/salon_women.jpg",
    names: ["Salon for Women", "Salon for Men & Kids", "Spa for Women", "Spa for Men"],
  },
  {
    key: "appliances",
    label: "Appliance Repair & Service",
    shortLabel: "Appliances",
    img: "/images/ac_technician.jpg",
    names: [
      "AC Technician",
      "Washing Machine Repair",
      "Refrigerator Repair",
      "Water Purifier (RO) Service",
      "Microwave & Chimney Repair",
      "TV & Laptop Repair",
    ],
  },
  {
    key: "cleaning_pest",
    label: "Cleaning & Pest Control",
    shortLabel: "Cleaning & Pest",
    img: "/images/cleaning.jpg",
    names: ["Cleaning", "Bathroom & Kitchen Cleaning", "Sofa & Carpet Cleaning", "Pest Control"],
  },
  {
    key: "repairs",
    label: "Home Repair & Painting",
    shortLabel: "Repairs & Paint",
    img: "/images/electrician.jpg",
    names: ["Electrician", "Plumber", "Carpenter", "Painter"],
  },
  {
    key: "care_help",
    label: "Care, Mobility & Home Help",
    shortLabel: "Care & Help",
    img: "/images/caregiver.jpg",
    names: ["Caregiver", "Domestic Helper", "Driver", "Gardener"],
  },
];

export const FALLBACK_SERVICES = [
  { id: 1, name: "Electrician", name_hi: "बिजली मिस्त्री", base_price: 350, description: "Certified electricians for wiring, switches, fans, lights & power backup." },
  { id: 2, name: "Plumber", name_hi: "नल मिस्त्री", base_price: 350, description: "Leak repairs, pipe fitting, tap installation & bathroom fittings." },
  { id: 3, name: "Carpenter", name_hi: "बढ़ई", base_price: 400, description: "Door and lock repairs, furniture assembly & custom wooden fixtures." },
  { id: 4, name: "Painter", name_hi: "पेंटर", base_price: 500, description: "Full home painting, waterproofing, damp solutions & texture walls." },
  { id: 5, name: "Cleaning", name_hi: "सफाई", base_price: 450, description: "Full home deep cleaning for 1BHK/2BHK/3BHK & villa sanitization." },
  { id: 6, name: "Driver", name_hi: "ड्राइवर", base_price: 300, description: "Verified city & outstation drivers with audited licenses." },
  { id: 7, name: "Gardener", name_hi: "माली", base_price: 300, description: "Terrace gardens, lawn care, pruning & organic planting." },
  { id: 8, name: "Caregiver", name_hi: "देखभाल", base_price: 550, description: "Compassionate elderly care, vital monitoring & bedside support." },
  { id: 9, name: "Domestic Helper", name_hi: "घरेलू सहायक", base_price: 280, description: "Trusted daily cooking, pantry help & household assistance." },
  { id: 10, name: "AC Technician", name_hi: "एसी तकनीशियन", base_price: 600, description: "Split & window AC service, foam-jet cleaning, gas refill & repair." },
  { id: 11, name: "Salon for Women", name_hi: "सैलून (महिला)", base_price: 599, description: "Haircuts, styling, facials, waxing, threading, manicure & pedicure at home." },
  { id: 12, name: "Salon for Men & Kids", name_hi: "सैलून (पुरुष एवं बच्चे)", base_price: 299, description: "Haircut, beard grooming, detox facial & relaxing head massage." },
  { id: 13, name: "Spa for Women", name_hi: "स्पा (महिला)", base_price: 999, description: "Stress-relief Swedish, deep tissue & ayurvedic full-body massage." },
  { id: 14, name: "Spa for Men", name_hi: "स्पा (पुरुष)", base_price: 999, description: "Pain relief, sports & deep-tissue therapeutic full-body massage." },
  { id: 15, name: "Pest Control", name_hi: "पेस्ट कंट्रोल", base_price: 799, description: "Cockroach, ant, bed bug, termite & mosquito eradication treatments." },
  { id: 16, name: "Washing Machine Repair", name_hi: "वॉशिंग मशीन रिपेयर", base_price: 349, description: "Top-load, front-load & semi-automatic washing machine diagnostics & repair." },
  { id: 17, name: "Refrigerator Repair", name_hi: "फ्रिज रिपेयर", base_price: 349, description: "Single-door, double-door & side-by-side fridge repair & cooling check." },
  { id: 18, name: "Water Purifier (RO) Service", name_hi: "आरओ वॉटर प्यूरीफायर", base_price: 399, description: "RO filter replacement, membrane cleaning, TDS check & installation." },
  { id: 19, name: "Microwave & Chimney Repair", name_hi: "माइक्रोवेव और चिमनी", base_price: 399, description: "Kitchen chimney deep degreasing, motor fix & microwave repair." },
  { id: 20, name: "TV & Laptop Repair", name_hi: "टीवी और लैपटॉप रिपेयर", base_price: 399, description: "LED/Smart TV wall mounting, display checks & laptop troubleshooting." },
  { id: 21, name: "Sofa & Carpet Cleaning", name_hi: "सोफा और कालीन सफाई", base_price: 499, description: "Deep foam shampooing, vacuum extraction & upholstery stain removal." },
  { id: 22, name: "Bathroom & Kitchen Cleaning", name_hi: "बाथरूम और किचन सफाई", base_price: 449, description: "Intensive tile descaling, grease removal & wet-area sanitization." },
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
