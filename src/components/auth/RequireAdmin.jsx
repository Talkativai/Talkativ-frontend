import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../api.js";

export default function RequireAdmin({ children }) {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;

  const token = getAccessToken();
  let storedUser = user;
  if (!storedUser) {
    try {
      const stored = localStorage.getItem('talkativ_user');
      if (stored) storedUser = JSON.parse(stored);
    } catch {}
  }

  if (!token && !storedUser) return <Navigate to="/login" replace />;
  if (storedUser?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
}
