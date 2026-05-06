// ─── Clerk SSO Callback — commented out (OAuth removed) ──────────────────────
// This file previously handled Clerk Google OAuth callbacks.
// The route /sso-callback is already commented out in App.jsx so this
// component is never loaded. Kept as a stub to avoid import errors.

/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SSOCallback() {
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { handleLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    const exchange = async () => {
      try {
        if (!isSignedIn) { navigate("/#/login"); return; }
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error("Could not retrieve Clerk session token");
        const data = await api.auth.clerkExchange(clerkToken);
        handleLogin(data.user);
        if (data.user?.role === "ADMIN") navigate("/admin");
        else if (!data.onboardingDone) navigate(`/onboarding/${data.onboardingStep || 1}`);
        else navigate("/dashboard");
      } catch (err) {
        console.error("[SSOCallback]", err);
        setError(err.message || "Sign-in failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };
    exchange();
  }, [isLoaded, isSignedIn]);

  return null;
}
*/

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SSOCallback() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/login"); }, []);
  return null;
}
