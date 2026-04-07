import { useState, useEffect } from "react";
import { T } from "../../../utils/tokens";
import TopBar from "../TopBar";
import { api } from "../../../api";

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function statusDot(status) {
  if (status === "LIVE") return "live";
  if (status === "COMPLETED") return "done";
  return "miss";
}

function outcomeBadge(outcomeType) {
  if (outcomeType === "ORDER") return "order";
  if (outcomeType === "RESERVATION") return "order";
  if (outcomeType === "ENQUIRY") return "info";
  return "missed";
}

function outcomeLabel(c) {
  if (c.outcomeType === "ORDER") return "🛍️ Order";
  if (c.outcomeType === "RESERVATION") return "📅 Reservation";
  if (c.outcomeType === "ENQUIRY") return "💬 Enquiry";
  if (c.status === "MISSED") return "📵 Missed";
  return c.outcome || "—";
}

function parseTranscript(raw) {
  if (!raw) return [];
  // Try to parse "Agent: ... \n Caller: ..." format
  const lines = raw.split(/\n/).filter(l => l.trim());
  const turns = [];
  for (const line of lines) {
    const agentMatch = line.match(/^(agent|ai|assistant|bot)\s*[:：]\s*(.*)/i);
    const callerMatch = line.match(/^(caller|user|customer|human)\s*[:：]\s*(.*)/i);
    if (agentMatch) {
      turns.push({ role: "agent", text: agentMatch[2].trim() });
    } else if (callerMatch) {
      turns.push({ role: "caller", text: callerMatch[2].trim() });
    } else if (turns.length > 0) {
      // continuation of previous turn
      turns[turns.length - 1].text += " " + line.trim();
    } else {
      turns.push({ role: "agent", text: line.trim() });
    }
  }
  return turns;
}

// ─── Transcript Panel ───────────────────────────────────────────────────────
function TranscriptPanel({ call }) {
  const turns = parseTranscript(call.transcript);
  return (
    <div className="transcript-panel">
      <div className="transcript-meta">
        <div className="transcript-meta-item">
          <span className="transcript-meta-icon">🕐</span>
          <span>Started: <strong>{fmtDate(call.startedAt)} at {fmtTime(call.startedAt)}</strong></span>
        </div>
        {call.endedAt && (
          <div className="transcript-meta-item">
            <span className="transcript-meta-icon">🏁</span>
            <span>Ended: <strong>{fmtTime(call.endedAt)}</strong></span>
          </div>
        )}
        <div className="transcript-meta-item">
          <span className="transcript-meta-icon">⏱️</span>
          <span>Duration: <strong>{fmtDuration(call.duration)}</strong></span>
        </div>
        {call.outcomeType && (
          <div className="transcript-meta-item">
            <span className="transcript-meta-icon">📋</span>
            <span>Outcome: <strong>{call.outcomeType}</strong></span>
          </div>
        )}
      </div>
      {turns.length > 0 ? (
        <div className="transcript-body">
          {turns.map((t, i) => (
            <div key={i} className={`transcript-turn ${t.role}`}>
              <span className="transcript-turn-label">{t.role === "agent" ? "🤖 Agent" : "👤 Caller"}</span>
              {t.text}
            </div>
          ))}
        </div>
      ) : (
        <div className="transcript-empty">
          📝 No transcript available for this call
        </div>
      )}
    </div>
  );
}

// ─── Main PageCalls Component ───────────────────────────────────────────────
export default function PageCalls({ user, agentName, bizName }) {
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => { const h = () => setIsMobile(window.innerWidth <= 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const dateMap = { "Today": "today", "Yesterday": "yesterday", "This week": "week", "This month": "month" };
    Promise.all([
      api.calls.list(`filter=${filter}&date=${dateMap[timeFilter] || "today"}&page=${page}`),
      api.calls.getStats(),
    ]).then(([data, s]) => {
      setCalls(data.calls || []);
      setTotal(data.total || 0);
      setStats(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter, timeFilter, page]);

  const tabs = ["All", "Orders", "Reservations", "Enquiries", "Missed"];
  const perPage = 5;
  const totalPages = Math.ceil(total / perPage);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <>
      <TopBar title={<>All <strong>Calls</strong></>} subtitle="Every call routed through Talkativ with full transcripts" user={user} agentName={agentName}>
        <button className="btn-secondary" style={{ fontSize: 13, padding: "8px 18px" }}>Export CSV</button>
      </TopBar>

      <div className="kpi-row">
        {[
          { l: "Total today", v: stats?.total ?? "0", d: "calls handled" },
          { l: "Answered", v: stats?.answered ?? "0", d: "—" },
          { l: "Avg. duration", v: stats?.avgDuration ? `${Math.floor(stats.avgDuration / 60)}:${String(stats.avgDuration % 60).padStart(2, '0')}` : "0:00", d: "—" },
          { l: "Orders taken", v: stats?.ordersTaken ?? "0", d: "—" },
        ].map(k => (
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => { setFilter(t); setPage(1); }} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${filter === t ? T.p500 : T.line}`, background: filter === t ? T.p50 : "transparent", color: filter === t ? T.p700 : T.mid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .18s" }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={timeFilter} onChange={e => { setTimeFilter(e.target.value); setPage(1); }} style={{ padding: "8px 16px", fontSize: 13, border: `1.5px solid ${T.line}`, borderRadius: 50, background: T.white, color: T.ink, fontFamily: "'Outfit',sans-serif", fontWeight: 600, cursor: "pointer", outline: "none", transition: "border-color .2s", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <option>Today</option><option>Yesterday</option><option>This week</option><option>This month</option>
            </select>
          </div>
        </div>

        {calls.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📞</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No calls yet</div>
            <div style={{ fontSize: 13, color: T.soft }}>Calls handled by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          /* Mobile card layout */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {calls.map(c => (
              <div key={c.id}>
                <div onClick={() => toggleExpand(c.id)} style={{ background: T.paper, border: `1.5px solid ${expandedId === c.id ? T.p300 : T.line}`, borderRadius: 14, padding: "14px 16px", transition: "all .15s", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={`call-dot ${statusDot(c.status)}`} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{c.callerName || "Unknown caller"}</div>
                        <div style={{ fontSize: 12, color: T.soft, marginTop: 2 }}>{c.callerPhone || "No phone"}</div>
                      </div>
                    </div>
                    <span className={`call-badge ${outcomeBadge(c.outcomeType)}`}>{outcomeLabel(c)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <span style={{ fontSize: 12, color: T.soft }}>{fmtDate(c.startedAt)} {fmtTime(c.startedAt)}</span>
                      <span style={{ fontSize: 12, color: T.soft }}>{fmtDuration(c.duration)}</span>
                    </div>
                    <button className="transcript-toggle-btn">
                      {expandedId === c.id ? "▲ Hide" : "▼ Transcript"}
                    </button>
                  </div>
                </div>
                {expandedId === c.id && <TranscriptPanel call={c} />}
              </div>
            ))}
          </div>
        ) : (
          /* Desktop table layout */
          <>
            <div className="calls-table-header" style={{ display: "grid", gridTemplateColumns: "8px 1fr 160px 140px 80px 130px 100px", gap: 14, padding: "8px 0 12px", borderBottom: `1.5px solid ${T.line}`, marginBottom: 4 }}>
              {["", "Caller", "Phone", "Date & Time", "Duration", "Outcome", ""].map(h => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</div>
              ))}
            </div>
            {calls.map(c => (
              <div key={c.id}>
                <div className="calls-table-row" onClick={() => toggleExpand(c.id)} style={{ display: "grid", gridTemplateColumns: "8px 1fr 160px 140px 80px 130px 100px", gap: 14, padding: "11px 0", borderBottom: `1px solid ${T.paper}`, alignItems: "center", cursor: "pointer", transition: "background .15s", borderRadius: 8, background: expandedId === c.id ? T.p50 : "transparent" }} onMouseEnter={e => { if (expandedId !== c.id) e.currentTarget.style.background = T.paper; }} onMouseLeave={e => { if (expandedId !== c.id) e.currentTarget.style.background = "transparent"; }}>
                  <div className={`call-dot ${statusDot(c.status)}`} />
                  <div><div className="call-name">{c.callerName || "Unknown caller"}</div></div>
                  <div style={{ fontSize: 13, color: T.soft }}>{c.callerPhone || "—"}</div>
                  <div style={{ fontSize: 13, color: T.soft }}>{fmtDate(c.startedAt)}<br /><span style={{ fontSize: 11.5 }}>{fmtTime(c.startedAt)}</span></div>
                  <div style={{ fontSize: 13, color: T.soft }}>{fmtDuration(c.duration)}</div>
                  <span className={`call-badge ${outcomeBadge(c.outcomeType)}`}>{outcomeLabel(c)}</span>
                  <button className="transcript-toggle-btn">
                    {expandedId === c.id ? "▲ Hide" : "📝 View"}
                  </button>
                </div>
                {expandedId === c.id && <TranscriptPanel call={c} />}
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginTop: 10, borderTop: `1px solid ${T.paper}` }}>
            <div style={{ fontSize: 13, color: T.soft }}>Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} calls</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: "6px 14px", borderRadius: 50, border: `1.5px solid ${T.line}`, background: page === 1 ? "transparent" : T.white, color: page === 1 ? T.faint : T.mid, fontSize: 13, fontWeight: 600, cursor: page === 1 ? "default" : "pointer", transition: "all .18s" }}>Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: "6px 14px", borderRadius: 50, border: `1.5px solid ${T.line}`, background: page === totalPages ? "transparent" : T.white, color: page === totalPages ? T.faint : T.mid, fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "default" : "pointer", transition: "all .18s" }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
