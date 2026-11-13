import { Badge } from "./ui";
import { cn } from "../lib/cn";
import { useLang } from "../i18n";

export const STATUS_META = {
  PENDING: { label: "Requested", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  ACCEPTED: { label: "Accepted", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  IN_PROGRESS: { label: "In progress", cls: "bg-lime-100 text-lime-800 border-lime-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-600/15 text-emerald-800 border-emerald-300" },
  REJECTED: { label: "Rejected", cls: "bg-rose-100 text-rose-700 border-rose-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-stone-200 text-stone-600 border-stone-300" },
  verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  pending: { label: "Pending verification", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function StatusBadge({ status, className }) {
  const { tr } = useLang();
  const m = STATUS_META[status] || { label: status, cls: "bg-stone-100 text-stone-700 border-stone-200" };
  return <Badge variant="outline" className={cn(m.cls, className)}>{tr(m.label)}</Badge>;
}
