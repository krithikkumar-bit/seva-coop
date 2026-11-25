import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Sprout,
  HeartHandshake,
  Home,
  Snowflake,
  LayoutGrid,
  Scissors,
  Bug,
  Tv,
  Flame,
  Wrench,
  Sofa,
  Bath,
} from "lucide-react";

const BY_NAME = {
  electrician: Zap,
  plumber: Droplets,
  carpenter: Hammer,
  painter: Paintbrush,
  cleaning: Sparkles,
  driver: Car,
  gardener: Sprout,
  caregiver: HeartHandshake,
  "domestic helper": Home,
  "ac technician": Snowflake,
  "salon for women": Scissors,
  "salon for men & kids": Scissors,
  "spa for women": Sparkles,
  "spa for men": Sparkles,
  "pest control": Bug,
  "washing machine repair": Wrench,
  "refrigerator repair": Snowflake,
  "water purifier (ro) service": Droplets,
  "microwave & chimney repair": Flame,
  "tv & laptop repair": Tv,
  "sofa & carpet cleaning": Sofa,
  "bathroom & kitchen cleaning": Bath,
};

export default function CategoryIcon({ name = "", className = "h-5 w-5" }) {
  const Cmp = BY_NAME[name.toLowerCase()] || LayoutGrid;
  return <Cmp className={className} />;
}
