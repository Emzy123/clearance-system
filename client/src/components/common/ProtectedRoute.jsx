import { Navigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ allowRoles, children }) {
  const { isAuthed, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6"><Loader /></div>;
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowRoles?.length && !allowRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role || ""}`} replace />;
  }

  return children;
}

