import { useState, useEffect } from "react";
import { T } from "../../../utils/tokens";
import TopBar from "../TopBar";
import { getCurrencySymbol } from "../../../utils/countries";
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

// ─── Transcript Panel (for linked call) ─────────────────────────────────────
function TranscriptPanel({ call }) {
  if (!call) return (
    <div className="transcript-panel">
      <div className="transcript-empty">📝 No call linked to this order</div>
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
    PREPARING: "👨‍🍳 Preparing",
    READY: "✅ Ready",
    COMPLETED: "✓ Completed",
    CANCELLED: "✕ Cancelled",
  };
  return map[status] || status;
}

function statusBadgeClass(status) {
  if (["COMPLETED", "CONFIRMED", "READY"].includes(status)) return "badge-green";
  if (status === "CANCELLED") return "badge-red";
  return "badge-amber";
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PageOrders({ user, agentName, bizName, bizData }) {
  const currencySymbol = getCurrencySymbol(bizData?.currency);
  const [tab, setTab] = useState("Today");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => { const h = () => setIsMobile(window.innerWidth <= 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const dateMap = { "Today": "today", "Yesterday": "yesterday", "This week": "week", "This month": "month" };
    const dateParam = dateMap[tab] || "";
    Promise.all([
      api.orders.list(`type=${typeFilter === 'All types' ? '' : typeFilter.toUpperCase()}&status=${statusFilter === 'All statuses' ? '' : statusFilter.toUpperCase()}&date=${dateParam}&page=${page}`),
      api.orders.getStats(),
    ]).then(([data, s]) => {
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setStats(s);
    }).catch(err => {
      setError(err?.message || "Failed to load orders. Please refresh.");
    }).finally(() => setLoading(false));
  }, [tab, typeFilter, statusFilter, page]);

  const perPage = 5;
  const totalPages = Math.ceil(total / perPage);
  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <>
      <TopBar title={<>All <strong>Orders</strong></>} subtitle={`Orders taken by ${agentName || 'your agent'} across all calls`} user={user} agentName={agentName}>
        <button className="btn-secondary" style={{ fontSize: 13, padding: "8px 18px" }}>Export</button>
      </TopBar>

      <div className="kpi-row">
        {[
          { l: "Orders today", v: stats?.ordersToday ?? "0", d: "—" },
          { l: "Revenue today", v: `${currencySymbol}${stats?.revenue ?? "0"}`, d: "—" },
          { l: "Avg. order value", v: `${currencySymbol}${stats?.avgOrderValue ?? "0"}`, d: "—" },
          { l: "Delivery rate", v: stats?.deliveryRate ? `${stats.deliveryRate}%` : "—", d: "—" },
        ].map(k => (
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Today", "Yesterday", "This week", "This month"].map(t => (
              <button key={t} onClick={() => { setTab(t); setPage(1); }} style={{ padding: "7px 16px", borderRadius: 50, border: `1.5px solid ${tab === t ? T.p500 : T.line}`, background: tab === t ? T.p50 : "transparent", color: tab === t ? T.p700 : T.mid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .18s" }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={{ padding: "8px 16px", fontSize: 13, border: `1.5px solid ${T.line}`, borderRadius: 50, background: T.white, color: T.ink, fontFamily: "'Outfit',sans-serif", fontWeight: 600, cursor: "pointer", outline: "none", transition: "border-color .2s", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <option>All types</option><option>Delivery</option><option>Collection</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "8px 16px", fontSize: 13, border: `1.5px solid ${T.line}`, borderRadius: 50, background: T.white, color: T.ink, fontFamily: "'Outfit',sans-serif", fontWeight: 600, cursor: "pointer", outline: "none", transition: "border-color .2s", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <option>All statuses</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
            </select>
          </div>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#DC2626", marginBottom: 6 }}>Could not load orders</div>
            <div style={{ fontSize: 13, color: T.soft }}>{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No orders yet</div>
            <div style={{ fontSize: 13, color: T.soft }}>Orders taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map(o => (
              <div key={o.id}>
                <div onClick={() => toggleExpand(o.id)} style={{ background: T.paper, border: `1.5px solid ${expandedId === o.id ? T.p300 : T.line}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.p600, fontFamily: "monospace" }}>#{o.id.slice(0, 8)}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{o.customerName}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{currencySymbol}{Number(o.amount).toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.soft, marginBottom: 10 }}>{o.items}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge badge-purple`}>{o.type}</span>
                      <span className={`badge ${statusBadgeClass(o.status)}`}>{statusLabel(o.status)}</span>
                    </div>
                    <button className="transcript-toggle-btn">
                      {expandedId === o.id ? "▲ Hide" : "📝 Call log"}
                    </button>
                  </div>
                </div>
                {expandedId === o.id && <TranscriptPanel call={o.call} />}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 200px 110px 110px 100px 90px", gap: 14, padding: "8px 0 12px", borderBottom: `1.5px solid ${T.line}` }}>
              {["Order ID", "Customer", "Items", "Type", "Status", "Total", ""].map(h => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".8px" }}>{h}</div>
              ))}
            </div>
            {orders.map(o => (
              <div key={o.id}>
                <div onClick={() => toggleExpand(o.id)} style={{ display: "grid", gridTemplateColumns: "100px 1fr 200px 110px 110px 100px 90px", gap: 14, padding: "12px 0", borderBottom: `1px solid ${T.paper}`, alignItems: "center", cursor: "pointer", transition: "background .15s", borderRadius: 8, background: expandedId === o.id ? T.p50 : "transparent" }} onMouseEnter={e => { if (expandedId !== o.id) e.currentTarget.style.background = T.paper; }} onMouseLeave={e => { if (expandedId !== o.id) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, fontFamily: "monospace" }}>#{o.id.slice(0, 8)}</div>
                  <div>
                    <div className="call-name">{o.customerName}</div>
                    <div className="call-detail">{fmtDate(o.createdAt)} · {fmtTime(o.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: T.soft }}>{o.items}</div>
                  <div><span className="badge badge-purple">{o.type}</span></div>
                  <div><span className={`badge ${statusBadgeClass(o.status)}`}>{statusLabel(o.status)}</span></div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{currencySymbol}{Number(o.amount).toFixed(2)}</div>
                  <button className="transcript-toggle-btn">
                    {expandedId === o.id ? "▲ Hide" : "📝 View"}
                  </button>
                </div>
                {expandedId === o.id && <TranscriptPanel call={o.call} />}
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, marginTop: 10, borderTop: `1px solid ${T.paper}` }}>
            <div style={{ fontSize: 13, color: T.soft }}>Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} orders</div>
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
