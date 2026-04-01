import { useState } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";

export default function Step6({ onNext, onBack, agentName }) {
  const [called, setCalled] = useState(false);
  const displayAgent = agentName || "Your agent";
  return (
    <ObShell step={6} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 7 · Test call</div>
      <h1 className="ob-heading">Test your agent<br />before <em>going live</em></h1>
      <p className="ob-subheading">One click to hear exactly what your customers will experience when they call.</p>
      <div className="test-call-card">
        <div className="test-call-icon">{called ? "✅" : "📞"}</div>
        <h3>{called ? "Your agent sounds perfect!" : "Ready to make a test call?"}</h3>
        <p>{called ? `Everything is working beautifully. ${displayAgent} is ready to go live to your customers.` : "Call your Talkativ number and hear your fully configured AI agent answering as your business."}</p>
        {!called && (
          <button onClick={() => setCalled(true)} style={{ background: T.ink, color: "white", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(19,13,46,.2)", transition: "all .22s", position: "relative", zIndex: 1 }}>
            📞 Call my number now
          </button>
        )}
        {called && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <button onClick={() => setCalled(false)} style={{ background: T.white, color: T.p600, border: `1.5px solid ${T.p200}`, borderRadius: 50, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Call again</button>
            <button style={{ background: T.white, color: T.p600, border: `1.5px solid ${T.p200}`, borderRadius: 50, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Tweak agent</button>
          </div>
        )}
      </div>
      {called && (
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          {[["📞", "1 call", "Completed"], ["⏱️", "0:42", "Duration"], ["✅", "Order taken", "Outcome"]].map(([ic, v, l]) => (
            <div key={l} style={{ flex: 1, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: 18, textAlign: "center", boxShadow: `0 4px 16px rgba(134,87,255,.06)` }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: T.p600 }}>{v}</div>
              <div style={{ fontSize: 11, color: T.soft, marginTop: 3, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </ObShell>
  );
}
