import { T } from "../../utils/tokens";
import { NAV } from "../../utils/constants";
import { api } from "../../api";

export default function Sidebar({ active, onNav, user, bizName }) {
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?';
  return (
    <aside className="dash-sidebar">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="dash-logo">
          <div className="dash-logo-mark">t</div>talkativ
        </div>
        <button className="mob-close-btn" onClick={()=>document.body.classList.remove('mob-nav-open')} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:T.mid,padding:4,borderRadius:8,alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {NAV.map(({ section, items }) => (
        <div key={section}>
          <div className="dash-section-label">{section}</div>
          {items.map(([ic, label]) => (
            <div
              key={label}
              className={`dash-nav-item ${active === label ? "active" : ""}`}
              onClick={() => onNav(label)}
            >
              <span className="dash-nav-icon">{ic}</span>{label}
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop:"auto", paddingTop:18, borderTop:`1.5px solid ${T.line}` }}>
        <div
          className="dash-nav-item"
          onClick={() => window.open('mailto:support@talkativ.com')}
          style={{ marginBottom: 4 }}
        >
          <span className="dash-nav-icon">🎧</span>Customer Support
        </div>
        <div
          className="dash-nav-item"
          onClick={async () => {
            await api.auth.logout();
            window.location.hash = '/login';
          }}
          style={{ marginBottom: 16, color: T.red }}
        >
          <span className="dash-nav-icon">🚪</span>Log Out
        </div>
        
        <div className="dash-nav-item" style={{ cursor: "default", background: "transparent", border: "none" }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white", flexShrink: 0 }}>{initials}</div>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {bizName || user?.firstName || 'My Business'}
          </span>
        </div>
      </div>
    </aside>
  );
}
