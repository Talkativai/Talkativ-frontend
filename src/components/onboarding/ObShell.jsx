import { useState, useEffect, useRef } from "react";
import { T } from "../../utils/tokens";
import { STEPS } from "../../utils/constants";

export default function ObShell({ step, children, onNext, onBack, nextLabel = "Continue →", loading = false, nextDisabled = false }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  const [obOpen, setObOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef(null);

  // Animate content on step change
  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(t);
  }, [step]);

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
        <div
          ref={contentRef}
          className="ob-step-content"
          style={{ flex: 1, marginTop: 8, animation: animating ? "ob-slideIn .4s cubic-bezier(.25,.8,.25,1) both" : "none" }}
        >
          {children}
        </div>
        <div className="ob-footer">
          <button className="btn-back" onClick={onBack} disabled={loading}>← Back</button>
          <button
            className={`btn-next ${loading ? "btn-next-loading" : ""}`}
            onClick={onNext}
            disabled={loading || nextDisabled}
            style={{
              opacity: loading || nextDisabled ? 0.45 : 1,
              pointerEvents: loading || nextDisabled ? "none" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minWidth: loading ? 180 : undefined,
              transition: "all .35s cubic-bezier(.25,.8,.25,1)",
            }}
          >
            {loading && (
              <span className="ob-btn-spinner" />
            )}
            <span style={{
              transition: "opacity .2s ease",
            }}>
              {nextLabel}
            </span>
          </button>
        </div>
      </div>
    <style>{`
      @keyframes ob-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes ob-slideIn {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ob-btn-spinner {
        width: 16px;
        height: 16px;
        border: 2.5px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-right-color: rgba(255,255,255,0.7);
        border-radius: 50%;
        flex-shrink: 0;
        animation: ob-spin .6s cubic-bezier(.6,.2,.35,.95) infinite;
        box-shadow: 0 0 8px rgba(255,255,255,0.15);
      }
      .btn-next-loading {
        background: linear-gradient(135deg, ${T.p600}, ${T.p700}) !important;
        box-shadow: 0 4px 20px rgba(112,53,245,.35) !important;
      }
    `}</style>
    </div>
  );
}

