import { createContext, useContext, useState, useEffect } from "react";
import { api, setAccessToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth init: handle OAuth callbacks + token refresh on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Google register callback: pre-fill the form, don't log in yet
    if (params.get('google_signup') === 'true') {
      sessionStorage.setItem('talkativ_google_profile', JSON.stringify({
        email: decodeURIComponent(params.get('google_email') || ''),
        firstName: decodeURIComponent(params.get('google_firstName') || ''),
        lastName: decodeURIComponent(params.get('google_lastName') || ''),
      }));
      window.history.replaceState({}, '', window.location.pathname);
      setAuthChecked(true);
      window.location.href = '/#/onboarding/1';
      return;
    }

    // Google login callback: issue token and go to dashboard (or resume onboarding)
    const authToken = params.get('auth_token');
    if (authToken) {
      setAccessToken(authToken);
      const userData = {
        id: params.get('user_id'),
        email: decodeURIComponent(params.get('user_email') || ''),
        role: params.get('user_role'),
        firstName: decodeURIComponent(params.get('user_firstName') || ''),
        lastName: decodeURIComponent(params.get('user_lastName') || ''),
      };
      setUser(userData);
      try { localStorage.setItem('talkativ_user', JSON.stringify(userData)); } catch {}
      window.history.replaceState({}, '', window.location.pathname);
      setAuthChecked(true);
      // Check if onboarding is complete
      (async () => {
        try {
          const biz = await api.business.get();
          if (!biz?.onboardingDone) {
            window.location.href = `/#/onboarding/${biz?.onboardingStep || 1}`;
          } else {
            window.location.href = '/#/dashboard';
          }
        } catch {
          window.location.href = '/#/dashboard';
        }
      })();
      return;
    }

    // Try to refresh token on mount (only for returning users who have a stored session)
    const storedUser = localStorage.getItem('talkativ_user');
    const isAuthPath = window.location.hash.includes('/onboarding') || 
                       window.location.hash.includes('/login') ||
                       window.location.hash.includes('/register') ||
                       window.location.hash.includes('/reset-password');
                       
    if (storedUser && !isAuthPath) {
      const tryRefresh = async () => {
        const refreshed = await api.auth.refreshToken();
        if (refreshed) {
          try {
            // Prefer fresh user data from server over possibly stale localStorage
            const freshUser = refreshed.user || JSON.parse(storedUser);
            setUser(freshUser);
            if (refreshed.user) {
              try { localStorage.setItem('talkativ_user', JSON.stringify(freshUser)); } catch {}
            }
            // Redirect to onboarding if not complete
            try {
              const biz = await api.business.get();
              if (!biz?.onboardingDone) {
                window.location.href = `/#/onboarding/${biz?.onboardingStep || 1}`;
              }
            } catch {}
          } catch {}
        } else {
          try { localStorage.removeItem('talkativ_user'); } catch {}
        }
        setAuthChecked(true);
      };
      tryRefresh();
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    try { localStorage.setItem('talkativ_user', JSON.stringify(userData)); } catch {}
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    try { localStorage.removeItem('talkativ_user'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
