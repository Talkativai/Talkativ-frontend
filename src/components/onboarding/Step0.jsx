import { useState } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";

export default function Step0({ onNext, onBack }) {
  const [ph, setPh] = useState("");
  const [calling, setCalling] = useState(false);
  return (
    <ObShell step={0} onNext={onNext} onBack={onBack} nextLabel="Create my account →">
      <div className="ob-step-label">Step 1 · Experience first</div>
      <h1 className="ob-heading">Hear <em>Talkativ</em><br />before signing up</h1>
      <p className="ob-subheading">Enter your number and we'll call you right now. Place a test order — no commitment needed.</p>
      <div className="form-group">
        <label className="form-label">Your mobile number</label>
        <input className="form-input" placeholder="+44 7700 000 000" value={ph} onChange={e => setPh(e.target.value)} style={{ fontSize: 18, padding: "16px 20px" }} />
      </div>
      <button
        onClick={() => setCalling(true)}
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, background: calling ? T.greenBg : T.ink, border: calling ? `1.5px solid ${T.greenBd}` : "none", color: calling ? T.green : "white", borderRadius: 50, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: calling ? "none" : "0 4px 20px rgba(19,13,46,.18)", transition: "all .3s" }}>
        {calling ? "📞 Calling you now…" : "📞 Call me now"}
      </button>
      {calling && (
        <div className="bento-main" style={{ maxWidth: 400, margin: 0 }}>
          <div className="call-header">
            <div className="call-avatar">🤖</div>
            <div><div className="call-name">Talkativ Demo</div><div className="call-sub">Calling {ph || "+44 7700 000 000"}</div></div>
            <div className="live-badge"><div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite" }} />LIVE</div>
          </div>
          <div className="waveform">{Array.from({ length: 14 }, (_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * .08}s` }} />)}</div>
          <div className="chat-bubble chat-ai"><span className="chat-tag">ARIA · TALKATIV</span>Hi! You're through to Talkativ's demo. Go ahead and place a test order — I'll handle everything!</div>
        </div>
      )}
      {!calling && <p style={{ fontSize: 13, color: T.soft, fontStyle: "italic" }}>Prefer to skip? Hit Continue → below.</p>}
    </ObShell>
  );
}
