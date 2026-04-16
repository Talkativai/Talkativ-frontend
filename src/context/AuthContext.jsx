import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { api, setAccessToken } from "../api.js";

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes of no activity
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const inactivityTimerRef            = useRef(null);

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

  const handleLogout = useCallback(async () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    await api.auth.logout();
    setUser(null);
    try { localStorage.removeItem("talkativ_user"); } catch {}
    setAccessToken(null);
  }, []);

  // ── Inactivity timeout — log out after 20 min of no user activity ─────────
  // Only active while a user is logged in. Any mouse/keyboard/scroll/touch
  // event resets the timer. Keeps the session alive during active use and
  // only logs out on genuine prolonged inactivity.
  useEffect(() => {
    if (!user) {
      // Clear any lingering timer when logged out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer(); // Start the countdown from login

    return () => {
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [user, handleLogout]);

  const handleLogin = (userData) => {
    setUser(userData);
    try { localStorage.setItem("talkativ_user", JSON.stringify(userData)); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
