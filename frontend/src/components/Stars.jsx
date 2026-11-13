import { Star } from "lucide-react";
import { cn } from "../lib/cn";

export default function Stars({ value = 0, onChange, className = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange && onChange(i)} className={cn(onChange ? "p-0.5" : "cursor-default")}>
          <Star className={cn(className, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-stone-300")} />
        </button>
      ))}
    </div>
  );
}
