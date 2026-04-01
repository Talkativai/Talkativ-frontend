import { T } from "../../utils/tokens";

export default function SuccessScreen({ onDashboard, agentName, bizName }) {
  const displayAgent = agentName || "Aria";
  const displayBiz = bizName || "your business";
  return (
    <div className="success-screen">
      <div className="success-bg" />
      <div className="success-icon">🎉</div>
      <h1 className="success-h1">You're live!</h1>
      <p className="success-sub">{displayAgent} is now answering calls for {displayBiz}. Your first real customer call could come in any moment.</p>
      <div className="success-stats">
        {[["📞", "Live", "Agent status"], ["⏱️", "24/7", "Coverage"], ["🛒", "Ready", "For orders"]].map(([ic, v, l]) => (
          <div className="ss-card" key={l}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{ic}</div>
            <div className="ss-val">{v}</div>
            <div className="ss-label">{l}</div>
          </div>
        ))}
      </div>
      <button className="btn-hero" onClick={onDashboard} style={{ position: "relative", zIndex: 1 }}>
        Open my dashboard →
      </button>
      <p style={{ fontSize: 13, color: T.soft, marginTop: 22, position: "relative", zIndex: 1 }}>A welcome email with your first-week guide is on its way</p>
    </div>
  );
}
