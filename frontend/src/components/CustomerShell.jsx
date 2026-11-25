import { CalendarPlus, ClipboardList, LayoutDashboard } from "lucide-react";
import { useLocation } from "react-router-dom";
import DashboardShell from "./DashboardShell";
import PublicLayout from "./PublicLayout";
import { useAuth } from "../AuthContext";
import { useLang } from "../i18n";

/** Sidebar frame for customer pages (route-based nav). */
export default function CustomerShell({ title, children, headerExtra }) {
  const { t } = useLang();
  const { pathname } = useLocation();
  const items = [
    { key: "/dashboard", to: "/dashboard", label: t("overview"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "/services", to: "/services", label: t("bookService"), icon: <CalendarPlus className="h-4 w-4" /> },
    { key: "/bookings", to: "/bookings", label: t("myBookings"), icon: <ClipboardList className="h-4 w-4" /> },
  ];
  const active = pathname.startsWith("/book/") ? "/services" : pathname;
  return <DashboardShell navItems={items} active={active} title={title} headerExtra={headerExtra}>{children}</DashboardShell>;
}

/** Shows the customer shell for signed-in customers, public header/footer otherwise. */
export function Frame({ title, children }) {
  const { user } = useAuth();
  if (user?.role === "customer") return <CustomerShell title={title}>{children}</CustomerShell>;
  return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div></PublicLayout>;
}
