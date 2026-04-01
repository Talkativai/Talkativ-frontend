import { T } from "../../utils/tokens";

export default function TopBar({ title, subtitle, children, user, agentName }) {
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ' ·');
  return (
    <div className="dash-topbar">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
        <div>
          <div className="dash-date">{dateStr}</div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="dash-topbar-right">
        <div className="dash-live-badge">
          <div style={{ width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite" }} />
          {agentName || 'Agent'} live
        </div>
        {children}
        <div className="dash-avatar">{initials}</div>
      </div>
    </div>
  );
}
