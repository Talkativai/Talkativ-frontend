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
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function parseTranscript(raw) {
  if (!raw) return [];
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
      turns[turns.length - 1].text += " " + line.trim();
    } else {
      turns.push({ role: "agent", text: line.trim() });
    }
  }
  return turns;
}

// ─── Transcript Panel ───────────────────────────────────────────────────────
function TranscriptPanel({ call }) {
  if (!call) return (
    <div className="transcript-panel">
      <div className="transcript-empty">📝 No call linked to this reservation</div>
    </div>
  );
  const turns = parseTranscript(call.transcript);
  return (
    <div className="transcript-panel">
      <div className="transcript-meta">
        <div className="transcript-meta-item">
          <span className="transcript-meta-icon">🕐</span>
          <span>Call time: <strong>{fmtDate(call.startedAt)} at {fmtTime(call.startedAt)}</strong></span>
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
        <div className="transcript-meta-item">
          <span className="transcript-meta-icon">📞</span>
          <span>Caller: <strong>{call.callerPhone || "Unknown"}</strong></span>
        </div>
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
        <div className="transcript-empty">📝 No transcript recorded for this call</div>
      )}
    </div>
  );
}

// ─── Status helpers ─────────────────────────────────────────────────────────
function statusLabel(status) {
  const map = {
    PENDING: "⏳ Pending",
    CONFIRMED: "✓ Confirmed",
    CANCELLED: "✕ Cancelled",
    NO_SHOW: "⚠️ No show",
    COMPLETED: "✓ Completed",
  };
  return map[status] || status;
}

function statusBadgeClass(status) {
  if (["CONFIRMED", "COMPLETED"].includes(status)) return "badge-green";
  if (status === "CANCELLED" || status === "NO_SHOW") return "badge-red";
  return "badge-amber";
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PageReservations({ user, agentName, bizName }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => { const h = () => setIsMobile(window.innerWidth <= 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.reservations.list(`status=${statusFilter === 'All' ? '' : statusFilter.toUpperCase()}&page=${page}`),
      api.reservations.getStats(),
    ]).then(([data, s]) => {
      setReservations(data.reservations || []);
      setTotal(data.total || 0);
      setStats(s);
    }).catch(err => {
      setError(err?.message || "Failed to load reservations. Please refresh.");
    }).finally(() => setLoading(false));
  }, [statusFilter, page]);

  const perPage = 5;
  const totalPages = Math.ceil(total / perPage);
  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <>
      <TopBar title={<>Reservations</>} subtitle={`Bookings taken by ${agentName || 'your agent'} via phone`} user={user} agentName={agentName} />

      <div className="kpi-row">
        {[
          { l: "Today's covers", v: stats?.todayCovers ?? "0", d: "—" },
          { l: "This week", v: stats?.weeklyReservations ?? "0", d: "—" },
          { l: "Avg. party size", v: stats?.avgPartySize ?? "—", d: "—" },
          { l: "No-show rate", v: stats?.noShowRate ? `${stats.noShowRate}%` : "—", d: "—" },
        ].map(k => (
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div className="card-head" style={{ marginBottom: 0 }}>Upcoming bookings</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(t => (
              <button key={t} onClick={() => { setStatusFilter(t); setPage(1); }} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${statusFilter === t ? T.p500 : T.line}`, background: statusFilter === t ? T.p50 : "transparent", color: statusFilter === t ? T.p700 : T.mid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .18s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#DC2626", marginBottom: 6 }}>Could not load reservations</div>
            <div style={{ fontSize: 13, color: T.soft }}>{error}</div>
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No reservations yet</div>
            <div style={{ fontSize: 13, color: T.soft }}>Bookings taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reservations.map(r => (
              <div key={r.id}>
                <div onClick={() => toggleExpand(r.id)} style={{ background: T.paper, border: `1.5px solid ${expandedId === r.id ? T.p300 : T.line}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: ["CONFIRMED", "COMPLETED"].includes(r.status) ? T.p50 : T.paper, border: `1.5px solid ${["CONFIRMED", "COMPLETED"].includes(r.status) ? T.p100 : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👥</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{r.guestName}</div>
                        <div style={{ fontSize: 12, color: T.soft, marginTop: 2 }}>{r.guests} guests</div>
                      </div>
                    </div>
                    <span className={`badge ${statusBadgeClass(r.status)}`}>{statusLabel(r.status)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.soft, marginBottom: 8 }}>{r.guestPhone || "No phone"} · {r.note || "No special requests"}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{fmtDateTime(r.dateTime)}</div>
                    <button className="transcript-toggle-btn">
                      {expandedId === r.id ? "▲ Hide" : "📝 Call log"}
                    </button>
                  </div>
                </div>
                {expandedId === r.id && <TranscriptPanel call={r.call} />}
              </div>
            ))}
          </div>
        ) : (
          <>
            {reservations.map(r => (
              <div key={r.id}>
                <div onClick={() => toggleExpand(r.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: `1px solid ${T.paper}`, cursor: "pointer", transition: "background .15s", borderRadius: 8, background: expandedId === r.id ? T.p50 : "transparent" }} onMouseEnter={e => { if (expandedId !== r.id) e.currentTarget.style.background = T.paper; }} onMouseLeave={e => { if (expandedId !== r.id) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: ["CONFIRMED", "COMPLETED"].includes(r.status) ? T.p50 : T.paper, border: `1.5px solid ${["CONFIRMED", "COMPLETED"].includes(r.status) ? T.p100 : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{r.guestName}</div>
                    <div style={{ fontSize: 12, color: T.soft, marginTop: 2 }}>{r.guestPhone || "No phone"} · {r.note || "No special requests"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{r.guests} guests</div>
                    <div style={{ fontSize: 11, color: T.soft, marginTop: 2 }}>party size</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 160 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{fmtDateTime(r.dateTime)}</div>
                  </div>
                  <div><span className={`badge ${statusBadgeClass(r.status)}`}>{statusLabel(r.status)}</span></div>
                  <button className="transcript-toggle-btn">
                    {expandedId === r.id ? "▲ Hide" : "📝 View"}
                  </button>
                </div>
                {expandedId === r.id && <TranscriptPanel call={r.call} />}
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginTop: 10, borderTop: `1px solid ${T.paper}` }}>
            <div style={{ fontSize: 13, color: T.soft }}>Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} reservations</div>
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
