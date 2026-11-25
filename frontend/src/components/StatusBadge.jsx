import { Badge } from "./ui";
import { cn } from "../lib/cn";
import { useLang } from "../i18n";

export const STATUS_META = {
  PENDING: { label: "Requested", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Accepted", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  CANCELLED: { label: "Cancelled", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  verified: { label: "Verified", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending Verification", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function StatusBadge({ status, className }) {
  const { tr } = useLang();
  const m = STATUS_META[status] || { label: status, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={cn(m.cls, className)}>{tr(m.label)}</Badge>;
}
