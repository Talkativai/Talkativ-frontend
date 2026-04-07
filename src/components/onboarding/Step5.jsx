import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";
import { api } from "../../api";

export default function Step5({ onNext, onBack }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assignedNumber, setAssignedNumber] = useState(null);
  const [error, setError] = useState("");

  // Check if number already assigned on mount
  useEffect(() => {
    api.settings.getPhone().then(d => {
      if (d?.assignedNumber) {
        setAssignedNumber(d.assignedNumber);
        setConnected(true);
      }
    }).catch(() => {});
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      // Get the business country for provisioning
      let country = "GB";
      try {
        const biz = await api.business.get();
        if (biz?.country) country = biz.country;
      } catch {}

      // Provision number + connect to agent (backend handles both)
      const result = await api.business.setupPhone("new", country);

      if (result?.assignedNumber) {
        setAssignedNumber(result.assignedNumber);
        setConnected(true);
      } else {
        setError("Could not provision a number. Please try again.");
      }
    } catch (e) {
      setError(e?.message || "Something went wrong. You can set this up later in Settings.");
    } finally {
      setConnecting(false);
    }
  };

  const formatPhone = (num) => {
    if (!num) return "";
    if (num.startsWith("+44") && num.length > 8) {
      return num.replace(/(\+\d{2})(\d{3,4})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
    }
    return num.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
  };

  return (
    <ObShell step={5} onNext={onNext} onBack={onBack} nextLabel={connected ? "Test your agent →" : "Skip for now →"}>
      <div className="ob-step-label">Step 6 · Phone number</div>
      <h1 className="ob-heading">Connect your<br /><em>phone number</em></h1>
      <p className="ob-subheading">
        {connected
          ? "Your AI agent now has a phone number. Customers can call it and your agent will answer."
          : "One click to give your AI agent a real phone number. We'll provision a local number and connect it to your agent automatically."}
      </p>

      {/* Before connecting — show the connect button */}
      {!connected && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          {/* Decorative phone icon */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.p50}, ${T.mist || "#f3f0ff"})`,
            border: `2px solid ${T.p200}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 44, margin: "0 auto 28px",
          }}>
            📞
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              background: connecting ? T.soft : `linear-gradient(135deg, ${T.p500}, ${T.p700})`,
              color: "white",
              border: "none",
              borderRadius: 50,
              padding: "16px 44px",
              fontSize: 16,
              fontWeight: 700,
              cursor: connecting ? "not-allowed" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: connecting ? "none" : `0 6px 24px rgba(112,53,245,.35)`,
              transition: "all .25s",
              opacity: connecting ? 0.8 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {connecting && (
              <div style={{
                width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)",
                borderTopColor: "white", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
            )}
            {connecting ? "Connecting…" : "Connect your number"}
          </button>

          <div style={{ fontSize: 13, color: T.soft, marginTop: 16, maxWidth: 360, margin: "16px auto 0" }}>
            We'll assign a local number based on your business location and connect it to your AI agent.
          </div>
        </div>
      )}

      {/* After connecting — show the assigned number */}
      {connected && assignedNumber && (
        <div style={{
          background: `linear-gradient(135deg, ${T.greenBg || "#f0fdf4"}, #ecfdf5)`,
          border: `1.5px solid ${T.greenBd || "#bbf7d0"}`,
          borderRadius: 20, padding: "32px 28px",
          textAlign: "center",
          animation: "fadeUp .4s ease both",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 18px",
            boxShadow: "0 6px 20px rgba(34,197,94,.3)",
          }}>
            ✅
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green || "#16a34a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
            Number connected
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 900, color: T.ink,
            letterSpacing: 1, lineHeight: 1, marginBottom: 12,
          }}>
            {formatPhone(assignedNumber)}
          </div>
          <div style={{ fontSize: 13, color: T.mid }}>
            Connected to your AI agent and ready for calls
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 18, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: T.red, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <div>
            {error}
            <button
              onClick={handleConnect}
              style={{ display: "block", marginTop: 8, background: "none", border: "none", color: T.p600, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif", padding: 0 }}
            >
              🔄 Try again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ObShell>
  );
}
