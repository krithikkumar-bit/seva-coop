import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

const roleHome = (role) =>
  role === "admin" ? "/admin" : role === "worker" ? "/worker" : "/dashboard";

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}
