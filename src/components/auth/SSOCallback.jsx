// ─── Clerk SSO Callback ────────────────────────────────────────────────────
// This page handles the redirect back from Clerk after Google OAuth.
// It exchanges the Clerk session token for our app's JWT pair.

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
        if (!isSignedIn) {
          // Not signed in — bounce back to login
          navigate("/#/login");
          return;
        }

        // Get a short-lived Clerk session JWT
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error("Could not retrieve Clerk session token");

        // Exchange with our backend for an app JWT
        const data = await api.auth.clerkExchange(clerkToken);
        handleLogin(data.user);

        // Redirect based on onboarding status
        if (data.user?.role === "ADMIN") {
          navigate("/admin");
        } else if (!data.onboardingDone) {
          navigate(`/onboarding/${data.onboardingStep || 1}`);
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("[SSOCallback]", err);
        setError(err.message || "Sign-in failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    exchange();
  }, [isLoaded, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", background: "#F8F6FF" }}>
      {error ? (
        <div style={{ textAlign: "center", color: "#EF4444" }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{error}</p>
          <p style={{ fontSize: 13, color: "#9E92BA", marginTop: 8 }}>Redirecting back to login…</p>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#6B5E8A" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #7035F5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>Completing sign-in…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
