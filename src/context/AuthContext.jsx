import { createContext, useContext, useState, useEffect } from "react";
import { api, setAccessToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      // Always try to restore the session from the httpOnly refresh-token cookie.
      // This covers: returning owners, staff logins, and users landing back after
      // a Google OAuth redirect (cookie is set by the backend before redirect).
      const refreshed = await api.auth.refreshToken();
      if (refreshed) {
        const storedUser = localStorage.getItem("talkativ_user");
        const freshUser = refreshed.user || (storedUser ? JSON.parse(storedUser) : null);
        if (freshUser) {
          setUser(freshUser);
          try { localStorage.setItem("talkativ_user", JSON.stringify(freshUser)); } catch {}

          // Redirect incomplete onboarding for business owners
          if (freshUser.role !== "ADMIN" && freshUser.role !== "STAFF") {
            try {
              const biz = await api.business.get();
              if (!biz?.onboardingDone) {
                window.location.href = `/#/onboarding/${biz?.onboardingStep || 1}`;
              }
            } catch {}
          }
        }
        setAuthChecked(true);
        return;
      }

      // No valid session — clear any stale local data
      try { localStorage.removeItem("talkativ_user"); } catch {}
      setAuthChecked(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (userData) => {
    setUser(userData);
    try { localStorage.setItem("talkativ_user", JSON.stringify(userData)); } catch {}
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    try { localStorage.removeItem("talkativ_user"); } catch {}
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
