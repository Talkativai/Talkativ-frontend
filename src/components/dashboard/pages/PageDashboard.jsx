import { useState } from "react";
import { T } from "../../../utils/tokens";
import { getCurrencySymbol } from "../../../utils/countries";

// Derive a stable 12-char merchant ID from the business UUID
function deriveMerchantId(bizId) {
  if (!bizId) return null;
  return bizId.replace(/-/g, '').substring(0, 12).toUpperCase();
}

export default function PageDashboard({ onNav, user, agentName, bizName, agentData, bizData, integrations = [] }) {
  const [copied, setCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    }).catch(() => {});
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ' ·');

  const firstName = user?.firstName || '';
  const lastName  = user?.lastName  || '';
  const initials  = (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase() || '?';

  const displayAgent  = agentName || 'Agent';
  const displayBiz    = bizName   || 'your business';
  const voiceDesc     = agentData?.voiceDescription || 'Warm & professional';
  const currencySymbol = getCurrencySymbol(bizData?.currency);
  const merchantId    = deriveMerchantId(bizData?.id);
  const agentPhone    = agentData?.aiPhoneNumber || null;

  const fallbackLabels = { transfer: 'Transfer', voicemail: 'Voicemail', callback: 'Call back' };
  const callRulesLabel = fallbackLabels[agentData?.fallbackAction] || 'Transfer';

  // POS: show connected integration names, or "Not synced"
  const posLabel = integrations.length > 0
    ? integrations.map(i => i.name).join(' / ')
    : 'Not synced';

  const bars = [42,67,58,82,74,91,100,79,88,96,62,50];
  const days = ["M","T","W","T","F","S","S","M","T","W","T","F"];

  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
          <div>
            <div className="dash-date">{dateStr}</div>
            <div className="dash-greeting">{greeting}, <strong>{firstName || 'there'}</strong> 👋</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
              {bizName && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, ${T.p600}, ${T.p800})`, borderRadius: 10, padding: "5px 14px 5px 10px", boxShadow: `0 3px 12px rgba(112,53,245,.28)` }}>
                  <span style={{ fontSize: 14 }}>🏪</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: ".3px" }}>{bizName}</span>
                </div>
              )}
              {merchantId && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,.06)" }}>
                  <div style={{ background: T.paper, padding: "5px 10px", borderRight: `1.5px solid ${T.line}` }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: T.soft, letterSpacing: ".7px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Merchant ID</span>
                  </div>
                  <div style={{ padding: "5px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, fontFamily: "monospace", letterSpacing: "1.5px" }}>{merchantId}</span>
                    <button
                      onClick={() => copyToClipboard(merchantId, setCopied)}
                      title={copied ? "Copied!" : "Copy Merchant ID"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 3px", borderRadius: 4, color: copied ? T.green : T.soft, display: "flex", alignItems: "center", transition: "color .2s", lineHeight: 1 }}
                    >
                      {copied ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {agentPhone && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: T.white, border: `1.5px solid ${T.p100}`, borderRadius: 9, overflow: "hidden", boxShadow: "0 1px 5px rgba(134,87,255,.08)" }}>
                  <div style={{ background: `linear-gradient(135deg, ${T.p50}, ${T.mist})`, padding: "5px 10px", borderRight: `1.5px solid ${T.p100}`, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 12 }}>📞</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: T.p600, letterSpacing: ".7px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Agent Phone</span>
                  </div>
                  <div style={{ padding: "5px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, fontFamily: "monospace", letterSpacing: ".5px" }}>{agentPhone}</span>
                    <button
                      onClick={() => copyToClipboard(agentPhone, setPhoneCopied)}
                      title={phoneCopied ? "Copied!" : "Copy Agent Phone"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 3px", borderRadius: 4, color: phoneCopied ? T.green : T.soft, display: "flex", alignItems: "center", transition: "color .2s", lineHeight: 1 }}
                    >
                      {phoneCopied ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-live-badge">
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, animation:"pulse 2s infinite" }} />
            {displayAgent} live
          </div>
          <div className="dash-avatar">{initials}</div>
        </div>
      </div>

      <div className="kpi-row">
        {[
          { l:"Calls today",   v:"0",  d:"No calls yet today" },
          { l:"Revenue today", v:`${currencySymbol}0`, d:"No orders yet" },
          { l:"Avg. call time",v:"0:00",d:"—" },
          { l:"Answer rate",   v:"0%", d:"Connect a number to start" },
        ].map(k => (
          <div className="kpi-card" key={k.l}>
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-delta">{k.d}</div>
          </div>
        ))}
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              Recent calls
              <span className="card-link" onClick={() => onNav && onNav("Calls")} style={{ cursor: "pointer" }}>View all →</span>
            </div>
            <div style={{ textAlign:"center", padding:"32px 16px", color:T.soft }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📵</div>
              <div style={{ fontSize:14, fontWeight:600, color:T.mid, marginBottom:6 }}>No recent calls yet</div>
              <div style={{ fontSize:12.5 }}>Calls will appear here once your number is connected.</div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">Your agent</div>
            <div className="agent-card">
              <div className="agent-avatar">🤖</div>
              <div>
                <div className="agent-name">{displayAgent}</div>
                <div className="agent-status"><div className="agent-status-dot" />Active · {displayBiz}</div>
              </div>
              <button className="agent-edit-btn" onClick={() => onNav && onNav("My Agent")}>Edit</button>
            </div>
            <div className="agent-meta">
              {[
                ["Voice",      `${displayAgent} · ${voiceDesc}`],
                ["Language",   "English"],
                ["Call rules", callRulesLabel],
                ["POS",        posLabel],
              ].map(([l, v]) => (
                <div key={l} className="agent-meta-item">
                  <div className="agent-meta-label">{l}</div>
                  <div className="agent-meta-value"
                    style={l === "POS" && posLabel === "Not synced" ? { color: T.soft, fontStyle: "italic" } : {}}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">Quick actions</div>
            <div className="quick-actions-grid">
              {[["📞","Test call","Voice & Script"],["📋","Update menu","Menu"],["⏰","Edit hours","Settings"]].map(([ic, l, nav]) => (
                <div key={l} className="qa-item" onClick={() => nav && onNav && onNav(nav)} style={{ cursor: nav ? "pointer" : "default" }}>
                  <div className="qa-icon">{ic}</div>
                  <div className="qa-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
