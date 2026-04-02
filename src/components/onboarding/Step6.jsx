import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";
import { api } from "../../api";

export default function Step6({ onNext, onBack, agentName }) {
  const [called, setCalled] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const displayAgent = agentName || "Your agent";

  // Fetch their assigned number on mount
  useEffect(() => {
    api.settings.getPhone().then(d => {
      if (d?.assignedNumber) setPhone(d.assignedNumber);
    }).catch(() => {});
  }, []);

  const handleCall = async () => {
    if (!phone) {
      setError("No number assigned yet. You can test from your dashboard after signup.");
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

  return (
    <ObShell step={6} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 7 · Test call</div>
      <h1 className="ob-heading">Test your agent<br />before <em>going live</em></h1>
      <p className="ob-subheading">
        One click to hear exactly what your customers will experience when they call.
      </p>

      <div className="test-call-card">
        <div className="test-call-icon">{called ? "✅" : "📞"}</div>
        <h3>
          {called ? "Your agent sounds great!" : "Ready to make a test call?"}
        </h3>
        <p>
          {called
            ? `Everything is working. ${displayAgent} is ready to go live.`
            : phone
              ? `We'll call you on ${phone} — pick up and talk to ${displayAgent}.`
              : `Your number will be assigned shortly. You can test from your dashboard.`}
        </p>

        {!called && (
          <button
            onClick={handleCall}
            disabled={calling}
            style={{
              background: calling ? T.soft : T.ink,
              color: "white",
              border: "none",
              borderRadius: 50,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: calling ? "not-allowed" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: calling ? "none" : "0 4px 20px rgba(19,13,46,.2)",
              transition: "all .22s",
              opacity: calling ? 0.7 : 1,
              position: "relative",
              zIndex: 1,
            }}>
            {calling ? "📞 Connecting…" : "📞 Call my number now"}
          </button>
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

      {!called && !calling && (
        <p style={{ fontSize: 13, color: T.soft, fontStyle: "italic", marginTop: 8 }}>
          Prefer to skip? Hit Skip for now → below.
        </p>
      )}
    </ObShell>
  );
}
