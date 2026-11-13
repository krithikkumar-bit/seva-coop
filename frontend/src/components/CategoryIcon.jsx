import { Zap, Droplets, Hammer, Paintbrush, Sparkles, Car, Sprout, HeartHandshake, Home, Snowflake, LayoutGrid } from "lucide-react";

const BY_NAME = {
  electrician: Zap, plumber: Droplets, carpenter: Hammer, painter: Paintbrush, cleaning: Sparkles,
  driver: Car, gardener: Sprout, caregiver: HeartHandshake, "domestic helper": Home, "ac technician": Snowflake,
};

/** Known services get a line icon (like the SevaSetu UI); custom services fall back to a generic tile. */
export default function CategoryIcon({ name = "", className = "h-5 w-5" }) {
  const Cmp = BY_NAME[name.toLowerCase()] || LayoutGrid;
  return <Cmp className={className} />;
}
