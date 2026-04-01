import { useState } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";

export default function Step5({ onNext, onBack }) {
  const [opt, setOpt] = useState(0);
  return (
    <ObShell step={5} onNext={onNext} onBack={onBack} nextLabel="Connect number →">
      <div className="ob-step-label">Step 6 · Phone number</div>
      <h1 className="ob-heading">Connect your<br /><em>phone number</em></h1>
      <p className="ob-subheading">Choose how calls are routed to Talkativ. This takes about 3 minutes.</p>
      <div className="phone-opts">
        <div className={`phone-opt ${opt === 0 ? "selected" : ""}`} onClick={() => setOpt(0)}>
          <div className="phone-opt-icon">🔀</div>
          <h4>Forward existing number</h4>
          <p>Keep your current number. We'll walk you through your carrier's call forwarding settings step by step.</p>
        </div>
        <div className={`phone-opt ${opt === 1 ? "selected" : ""}`} onClick={() => setOpt(1)}>
          <div className="phone-opt-icon">✨</div>
          <h4>Get a new number</h4>
          <p>We'll instantly assign you a local number — perfect if you're starting fresh or running a new line.</p>
        </div>
      </div>
      {opt === 0 && (
        <div className="info-block">
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 14, fontSize: 14 }}>📱 Forwarding instructions</div>
          {["Dial *21*[your Talkativ number]# on your phone", "Press Call — you'll hear a short confirmation tone", "Return here and click Verify below"].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.p600, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 8px rgba(112,53,245,.3)` }}>{i + 1}</div>
              <div style={{ fontSize: 13.5, color: T.mid, paddingTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      )}
      {opt === 1 && (
        <div style={{ marginTop: 18 }}>
          <label className="form-label">Choose your area code</label>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {["Manchester +44 161", "London +44 20", "Birmingham +44 121", "Leeds +44 113"].map(a => (
              <div key={a} style={{ border: `1.5px solid ${T.faint}`, borderRadius: 50, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: T.p700, cursor: "pointer", background: T.white, transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.p400; e.currentTarget.style.background = T.p50; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.faint; e.currentTarget.style.background = T.white; }}>
                {a}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 13, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13.5, color: T.green, fontWeight: 600 }}>+44 161 792 4831 is available and ready to assign</span>
          </div>
        </div>
      )}
    </ObShell>
  );
}
