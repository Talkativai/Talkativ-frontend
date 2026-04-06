import { useState } from "react";
import { T } from "../../utils/tokens";
import { STEPS } from "../../utils/constants";

export default function ObShell({ step, children, onNext, onBack, nextLabel = "Continue →", loading = false }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  const [obOpen, setObOpen] = useState(false);
  return (
    <div className="ob-wrap">
      {/* Overlay for mobile sidebar */}
      <div className={`ob-overlay ${obOpen?"ob-open":""}`} onClick={()=>setObOpen(false)}/>
      <aside className={`ob-sidebar ${obOpen?"ob-open":""}`}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div className="ob-sidebar-logo">
            <div className="ob-sidebar-logo-mark">t</div>
            talkativ
          </div>
          <button className="ob-hamburger" onClick={()=>setObOpen(false)} style={{display:"none",background:"none",border:"none",cursor:"pointer",fontSize:22,color:T.mid,padding:4,borderRadius:8,alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "upcoming";
          return (
            <div key={s.name}>
              <div className="ob-step-item">
                <div className={`ob-step-num ${state === "done" ? "sn-done" : state === "active" ? "sn-active" : "sn-upcoming"}`}>
                  {state === "done" ? "✓" : i + 1}
                </div>
                <div className="ob-step-info">
                  <div className={`step-name ${state}`}>{s.name}</div>
                  {state === "active" && <div className="step-time">{s.time}</div>}
                </div>
              </div>
              {i < STEPS.length - 1 && <div className="ob-step-line" />}
            </div>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1.5px solid ${T.line}` }}>
          <div style={{ fontSize: 12, color: T.soft, marginBottom: 7 }}>Need help?</div>
          <div style={{ fontSize: 13.5, color: T.p600, fontWeight: 600, cursor: "pointer" }}>💬 Chat with us</div>
        </div>
      </aside>

      <div className="ob-main">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <button className="ob-hamburger" onClick={()=>setObOpen(true)} style={{display:"none",background:"none",border:"none",cursor:"pointer",fontSize:24,color:T.ink,padding:0,alignItems:"center",justifyContent:"center"}}>☰</button>
          <div style={{flex:1}}>
            <div className="ob-progress-bar">
              <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="ob-progress-label">Step {step + 1} of {STEPS.length} · {STEPS[step].time} remaining</div>
          </div>
        </div>
        <div style={{ flex: 1, marginTop: 8 }}>{children}</div>
        <div className="ob-footer">
          <button className="btn-back" onClick={onBack} disabled={loading}>← Back</button>
          <button className="btn-next" onClick={onNext} disabled={loading} style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? "none" : "auto" }}>{nextLabel}</button>
        </div>
      </div>
    </div>
  );
}
