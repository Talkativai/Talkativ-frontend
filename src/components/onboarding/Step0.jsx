import { useState, useEffect } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";
import { api } from "../../api";

export default function Step0({ onNext, onBack }) {
  const [ph, setPh] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("GB");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) setDefaultCountry(data.country_code);
      })
      .catch(err => console.error("Failed to fetch IP details", err));
  }, []);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");
  const [called, setCalled] = useState(false);

  const handleCall = async () => {
    if (!ph.trim()) {
      setError("Please enter your phone number");
      return;
    }
    setError("");
    setCalling(true);
    try {
      await api.public.demoCall(ph.trim());
      setCalled(true);
    } catch (e) {
      setError(e.message || "Failed to initiate call. Please try again.");
      setCalling(false);
    }
  };

  return (
    <ObShell step={0} onNext={onNext} onBack={onBack} nextLabel="Create my account →">
      <div className="ob-step-label">Step 1 · Experience first</div>
      <h1 className="ob-heading">Hear <em>Talkativ</em><br />before signing up</h1>
      <p className="ob-subheading">Enter your number and we'll call you right now. Place a test order — no commitment needed.</p>

      <div className="form-group">
        <label className="form-label">Your mobile number</label>
        <PhoneInput
          className="form-input"
          international
          defaultCountry={defaultCountry}
          value={ph}
          onChange={val => { setPh(val || ""); setError(""); }}
          style={{ fontSize: 18, padding: "10px 20px", display: "flex", alignItems: "center" }}
          disabled={calling || called}
        />
        <style>{`
          .PhoneInputInput {
            flex: 1;
            min-width: 0;
            border: none;
            background: transparent;
            font-size: 18px;
            outline: none;
            color: inherit;
            padding-left: 10px;
          }
          .PhoneInputCountry {
            margin-right: 8px;
          }
        `}</style>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: T.red, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleCall}
        disabled={calling || called}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
          background: called ? T.greenBg : calling ? T.soft : T.ink,
          border: called ? `1.5px solid ${T.greenBd}` : "none",
          color: called ? T.green : "white",
          borderRadius: 50,
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: calling || called ? "not-allowed" : "pointer",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: called || calling ? "none" : "0 4px 20px rgba(19,13,46,.18)",
          transition: "all .3s",
          opacity: calling ? 0.7 : 1,
        }}>
        {called ? "📞 Calling you now…" : calling ? "📞 Connecting…" : "📞 Call me now"}
      </button>

      {called && (
        <div className="bento-main" style={{ maxWidth: 400, margin: 0 }}>
          <div className="call-header">
            <div className="call-avatar">🤖</div>
            <div>
              <div className="call-name">Talkativ Demo</div>
              <div className="call-sub">Calling {ph}</div>
            </div>
            <div className="live-badge">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite" }} />
              LIVE
            </div>
          </div>
          <div className="waveform">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * .08}s` }} />
            ))}
          </div>
          <div className="chat-bubble chat-ai">
            <span className="chat-tag">ARIA · TALKATIV</span>
            Hi! You're through to Talkativ's demo. Go ahead and place a test order — I'll handle everything!
          </div>
        </div>
      )}

      {!called && !calling && (
        <p style={{ fontSize: 13, color: T.soft, fontStyle: "italic" }}>
          Prefer to skip? Hit Continue → below.
        </p>
      )}
    </ObShell>
  );
}
