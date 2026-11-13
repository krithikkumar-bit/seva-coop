/**
 * SevaCoop Spline Scene Mapping (Single Source of Truth)
 * Maps route paths, service IDs, and interactive 3D objects to Spline scene nodes.
 */

export const SERVICE_OBJECT_MAP = {
  ac_technician: {
    key: "ac_technician",
    id: 10,
    name: "AC Technician",
    name_hi: "एसी तकनीशियन",
    glowObject: "HoverGlow_AC_Technician",
    prefix: "ACT_",
    icon: "❄️",
    basePrice: 600,
    cameraFocus: { x: 120, y: 150, z: -280 },
    targetOffset: { x: 180, y: 40, z: -380 },
    color: "#0284c7",
  },
  caregiver: {
    key: "caregiver",
    id: 8,
    name: "Caregiver",
    name_hi: "देखभाल",
    glowObject: "HoverGlow_Caregiver",
    prefix: "CGV_",
    icon: "🤝",
    basePrice: 550,
    cameraFocus: { x: 280, y: 160, z: -180 },
    targetOffset: { x: 380, y: 40, z: -240 },
    color: "#8b5cf6",
  },
  carpenter: {
    key: "carpenter",
    id: 3,
    name: "Carpenter",
    name_hi: "बढ़ई",
    glowObject: "HoverGlow_Carpenter",
    prefix: "CPT_",
    icon: "🪚",
    basePrice: 400,
    cameraFocus: { x: 360, y: 160, z: 40 },
    targetOffset: { x: 480, y: 40, z: 40 },
    color: "#d97706",
  },
  cleaning: {
    key: "cleaning",
    id: 5,
    name: "Cleaning",
    name_hi: "सफाई",
    glowObject: "HoverGlow_Cleaning",
    prefix: "CLN_",
    icon: "🧹",
    basePrice: 450,
    cameraFocus: { x: 260, y: 160, z: 200 },
    targetOffset: { x: 360, y: 40, z: 260 },
    color: "#0d9488",
  },
  domestic_helper: {
    key: "domestic_helper",
    id: 9,
    name: "Domestic Helper",
    name_hi: "घरेलू सहायक",
    glowObject: "HoverGlow_Domestic_Helper",
    prefix: "DOM_",
    icon: "🏠",
    basePrice: 280,
    cameraFocus: { x: 140, y: 150, z: 280 },
    targetOffset: { x: 180, y: 40, z: 380 },
    color: "#b45309",
  },
  driver: {
    key: "driver",
    id: 6,
    name: "Driver",
    name_hi: "ड्राइवर",
    glowObject: "HoverGlow_Driver",
    prefix: "DRV_",
    icon: "🚗",
    basePrice: 300,
    cameraFocus: { x: -140, y: 150, z: 280 },
    targetOffset: { x: -180, y: 40, z: 380 },
    color: "#1e3a8a",
  },
  electrician: {
    key: "electrician",
    id: 1,
    name: "Electrician",
    name_hi: "बिजली मिस्त्री",
    glowObject: "HoverGlow_Electrician",
    prefix: "ELC_",
    icon: "⚡",
    basePrice: 350,
    cameraFocus: { x: -260, y: 160, z: 200 },
    targetOffset: { x: -360, y: 40, z: 260 },
    color: "#ca8a04",
  },
  gardener: {
    key: "gardener",
    id: 7,
    name: "Gardener",
    name_hi: "माली",
    glowObject: "HoverGlow_Gardener",
    prefix: "GRD_",
    icon: "🌿",
    basePrice: 300,
    cameraFocus: { x: -360, y: 160, z: 40 },
    targetOffset: { x: -480, y: 40, z: 40 },
    color: "#16a34a",
  },
  painter: {
    key: "painter",
    id: 4,
    name: "Painter",
    name_hi: "पेंटर",
    glowObject: "HoverGlow_Painter",
    prefix: "PNT_",
    icon: "🎨",
    basePrice: 500,
    cameraFocus: { x: -280, y: 160, z: -180 },
    targetOffset: { x: -380, y: 40, z: -240 },
    color: "#e11d48",
  },
  plumber: {
    key: "plumber",
    id: 2,
    name: "Plumber",
    name_hi: "नल मिस्त्री",
    glowObject: "HoverGlow_Plumber",
    prefix: "PLB_",
    icon: "🚰",
    basePrice: 350,
    cameraFocus: { x: -120, y: 150, z: -280 },
    targetOffset: { x: -180, y: 40, z: -380 },
    color: "#0369a1",
  },
};

export const LANDMARK_MAP = {
  hub: {
    name: "SevaCoop Central Hub",
    objectName: "Hub Entrance And Tower",
    altObjectName: "SevaCoop_Central_Hub",
    category: "Cooperative Governance",
    description: "Central administrative headquarters ensuring 90% direct member payouts and transparent community services.",
    cameraFocus: { x: 0, y: 120, z: 320 },
    target: { x: 0, y: 90, z: 0 },
    type: "hub",
  },
  gateway: {
    name: "SevaCoop Shared Gateway",
    objectName: "Gateway Glow Light",
    altObjectName: "SevaCoop_Shared_Gateway",
    category: "District Portal",
    description: "The architectural gateway leading from Central Township to the 10-zone Services District.",
    cameraFocus: { x: 0, y: 80, z: 540 },
    target: { x: 0, y: 40, z: 420 },
    type: "gateway",
    action: "/services",
  },
  bikeHub: {
    name: "Green Mobility Bike Hub",
    objectName: "Bike Hub",
    category: "Zero-Emission Transit",
    description: "Shared cooperative electric bicycle depot for zero-emission community service visits.",
    cameraFocus: { x: -180, y: 110, z: 220 },
    target: { x: -220, y: 30, z: 180 },
    type: "amenity",
  },
};

export const ROUTE_CAMERA_MAP = {
  landing: {
    cameraName: "Hero Camera",
    altCamera: "Camera",
    pos: { x: 0, y: 320, z: 850 },
    target: { x: 0, y: 40, z: 0 },
    zoom: 0.85,
    blur: "none",
  },
  services: {
    cameraName: "Hero Camera",
    pos: { x: 0, y: 380, z: 750 },
    target: { x: 0, y: 20, z: 50 },
    zoom: 0.95,
    blur: "none",
  },
  book: {
    cameraName: "Hero Camera",
    pos: { x: -120, y: 180, z: 420 },
    target: { x: 0, y: 50, z: 0 },
    zoom: 1.15,
    blur: "subtle",
  },
  auth: {
    cameraName: "Camera",
    pos: { x: -140, y: 120, z: 360 },
    target: { x: 0, y: 85, z: 0 },
    zoom: 1.25,
    blur: "medium",
  },
  customer: {
    cameraName: "Hero Camera",
    pos: { x: -180, y: 280, z: 620 },
    target: { x: 0, y: 30, z: 0 },
    zoom: 0.9,
    blur: "medium",
  },
  worker: {
    cameraName: "Hero Camera",
    pos: { x: 160, y: 220, z: 520 },
    target: { x: 100, y: 40, z: 100 },
    zoom: 1.05,
    blur: "medium",
  },
  admin: {
    cameraName: "Hero Camera",
    pos: { x: 0, y: 520, z: 920 },
    target: { x: 0, y: 20, z: 0 },
    zoom: 0.75,
    blur: "medium",
  },
};

/**
 * Normalizes any service identifier (number id, key, or natural name) to SERVICE_OBJECT_MAP item.
 */
export function matchService(identifier) {
  if (!identifier) return null;
  if (typeof identifier === "number") {
    return Object.values(SERVICE_OBJECT_MAP).find((s) => s.id === identifier) || null;
  }
  const clean = String(identifier)
    .replace(/^HoverGlow_/, "")
    .replace(/^ACT_|^CGV_|^CPT_|^DRV_|^PNT_|^CLN_|^PLB_|^ELC_|^GRD_|^DOM_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();

  return (
    Object.values(SERVICE_OBJECT_MAP).find(
      (s) =>
        s.key === clean ||
        s.name.toLowerCase() === clean ||
        clean.includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(clean)
    ) || null
  );
}

/**
 * 5 GSAP Scroll Stops through the 3D Spline World for the Home Page journey.
 */
export const HOME_SCROLL_STOPS = [
  {
    id: "hero",
    label: "Cooperative Township",
    progress: 0.0,
    cameraPos: { x: 0, y: 320, z: 850 },
    target: { x: 0, y: 40, z: 0 },
  },
  {
    id: "services",
    label: "10-Zone Services Ring",
    progress: 0.25,
    cameraPos: { x: -280, y: 240, z: 580 },
    target: { x: -160, y: 30, z: 120 },
  },
  {
    id: "how-it-works",
    label: "Shared Gateway & Verification",
    progress: 0.5,
    cameraPos: { x: 0, y: 160, z: 520 },
    target: { x: 0, y: 50, z: 320 },
  },
  {
    id: "workers",
    label: "Local Artisans & Dispatch",
    progress: 0.75,
    cameraPos: { x: 260, y: 210, z: 520 },
    target: { x: 180, y: 40, z: 140 },
  },
  {
    id: "cta",
    label: "Federation Governance Hub",
    progress: 1.0,
    cameraPos: { x: 0, y: 220, z: 420 },
    target: { x: 0, y: 80, z: 0 },
  },
];
