import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";
import { api } from "../../api";

export default function Step6({ onNext, onBack, agentName }) {
  const [called, setCalled] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(true);
  const displayAgent = agentName || "Your agent";

  // Fetch their assigned number on mount
  useEffect(() => {
    setLoadingPhone(true);
    api.settings.getPhone().then(d => {
      if (d?.assignedNumber) setPhone(d.assignedNumber);
    }).catch(() => {}).finally(() => setLoadingPhone(false));
  }, []);

  const handleCall = async () => {
    if (!phone) {
      setError("No number assigned yet. Please go back and connect a number first, or skip for now.");
      return;
    }
    setError("");
    setCalling(true);
    try {
      await api.agent.testCall();
      setCalled(true);
    } catch (e) {
      setError("Could not initiate call. You can test from your dashboard.");
    } finally {
      setCalling(false);
    }
  };

  const formatPhoneForDisplay = (num) => {
    if (!num) return "";
    // Add spaces for readability: +44 161 234 5678
    if (num.startsWith("+44") && num.length > 8) {
      return num.replace(/(\+\d{2})(\d{3,4})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
    }
    // Generic formatting: group in chunks
    return num.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
  };

  return (
    <ObShell step={6} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 7 · Test call</div>
      <h1 className="ob-heading">Test your agent<br />before <em>going live</em></h1>
      <p className="ob-subheading">
        Call your number to hear your agent's voice and greeting — a live preview of how it sounds to callers.
      </p>

      <div className="test-call-card">
        <div className="test-call-icon">{called ? "✅" : "📞"}</div>

        {/* Show provisioned number prominently */}
        {phone && !called && (
          <div style={{
            position: "relative", zIndex: 1, marginBottom: 20,
            background: `linear-gradient(135deg, ${T.p50}, ${T.mist || "#f3f0ff"})`,
            border: `1.5px solid ${T.p200}`,
            borderRadius: 16, padding: "18px 24px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.p500, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Your Talkativ Number
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28, fontWeight: 900, color: T.ink,
              letterSpacing: 1.5, lineHeight: 1,
            }}>
              {formatPhoneForDisplay(phone)}
            </div>
            <div style={{ fontSize: 12, color: T.soft, marginTop: 8 }}>
              Connected to {displayAgent}
            </div>
          </div>
        )}

        <h3>
          {called
            ? `${displayAgent} sounds great!`
            : loadingPhone
              ? "Loading your number…"
              : phone
                ? `Ready to test ${displayAgent}?`
                : "No number assigned yet"
          }
        </h3>
        <p>
          {called
            ? `Everything is working. ${displayAgent} is ready to go live.`
            : phone
              ? `Dial the number above from your phone to hear ${displayAgent} answer with the greeting and voice you configured. Once setup is complete, your agent will handle orders, reservations and FAQs too.`
              : `Go back to Step 6 to connect a number, or skip and test from your dashboard.`}
        </p>

        {!called && phone && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            {/* Primary CTA: mobile dial link */}
            <a
              href={`tel:${phone}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: `linear-gradient(135deg, ${T.p500}, ${T.p700})`,
                color: "white", border: "none", borderRadius: 50,
                padding: "14px 36px", fontSize: 15, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                boxShadow: `0 4px 20px rgba(112,53,245,.35)`,
                textDecoration: "none",
                transition: "all .22s",
                cursor: "pointer",
              }}
            >
              📞 Call / Dial {formatPhoneForDisplay(phone)}
            </a>

            {/* Secondary: let backend call the user */}
            <button
              onClick={handleCall}
              disabled={calling}
              style={{
                background: "transparent",
                color: T.p600,
                border: `1.5px solid ${T.p200}`,
                borderRadius: 50,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: calling ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all .22s",
                opacity: calling ? 0.7 : 1,
              }}
            >
              {calling ? "📞 Connecting…" : "Or let us call you instead"}
            </button>
          </div>
        )}

        {called && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <button
              onClick={() => { setCalled(false); setCalling(false); }}
              style={{ background: T.white, color: T.p600, border: `1.5px solid ${T.p200}`, borderRadius: 50, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Call again
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 13, color: T.red }}>
          {error}
        </div>
      )}

      {!called && !calling && phone && (
        <div style={{
          marginTop: 16, background: T.paper, border: `1.5px solid ${T.line}`,
          borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 4 }}>
              What to expect
            </div>
            <div style={{ fontSize: 12.5, color: T.mid, lineHeight: 1.55 }}>
              {displayAgent} will answer with your greeting and voice — exactly as callers will hear it.
              After you complete setup, the full agent (menu, orders, reservations, FAQs) will be active on this number.
            </div>
          </div>
        </div>
      )}

      {!called && !calling && (
        <p style={{ fontSize: 13, color: T.soft, fontStyle: "italic", marginTop: 8 }}>
          Prefer to skip? Hit Skip for now → below.
        </p>
      )}
    </ObShell>
  );
}
