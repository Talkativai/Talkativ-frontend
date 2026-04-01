import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../api.js";

export default function RequireAuth({ children }) {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null; // Wait for auth check before rendering

  const token = getAccessToken();
  let storedUser = user;
  if (!storedUser) {
    try {
      const stored = localStorage.getItem('talkativ_user');
      if (stored) storedUser = JSON.parse(stored);
    } catch {}
  }

  if (!token && !storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
