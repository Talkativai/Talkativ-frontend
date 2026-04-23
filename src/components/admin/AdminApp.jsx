import { useState, useEffect, useCallback } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";

// ─── Design tokens (matches main app) ─────────────────────────────────────────
const T = {
  ink: "#1a0a2e", p600: "#5b21b6", p500: "#7035f5", p300: "#c4b5fd",
  paper: "#F8F6FF", white: "#FFFFFF", line: "#ebe6f5", soft: "#9e92ba",
  mid: "#6b5e8a", green: "#16a34a", greenBg: "#f0fdf4", greenBd: "#bbf7d0",
  red: "#dc2626", redBg: "#fff5f5", redBd: "#fecaca",
  yellow: "#d97706", yellowBg: "#fffbeb", yellowBd: "#fde68a",
};

const PAGES = ["Overview", "Users", "Integrations"];

const pill = (label, color, bg, bd) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color, border: `1px solid ${bd}`, letterSpacing: 0.3 }}>
    {label}
  </span>
);

const StatusPill = ({ status }) => {
  if (status === "ACTIVE") return pill("ACTIVE", T.green, T.greenBg, T.greenBd);
  if (status === "SUSPENDED") return pill("SUSPENDED", T.red, T.redBg, T.redBd);
  return pill(status, T.mid, T.paper, T.line);
};

const PlanPill = ({ plan, subStatus }) => {
  if (!plan) return pill("NO PLAN", T.soft, T.paper, T.line);
  if (subStatus === "TRIALING") return pill("TRIAL", T.yellow, T.yellowBg, T.yellowBd);
  if (subStatus === "ACTIVE") return pill(plan, T.green, T.greenBg, T.greenBd);
  return pill(plan, T.soft, T.paper, T.line);
};

// ─── Overview Page ─────────────────────────────────────────────────────────────
function PageOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Signups", value: stats.total, color: T.p500 },
    { label: "Active Accounts", value: stats.active, color: T.green },
    { label: "Suspended", value: stats.suspended, color: T.red },
    { label: "New This Month", value: stats.newThisMonth, color: T.yellow },
    { label: "Onboarding Complete", value: stats.onboardingDone, color: T.mid },
  ] : [];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: "0 0 24px" }}>Platform Overview</h2>
      {loading ? (
        <div style={{ color: T.soft, fontSize: 14 }}>Loading stats…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "24px 20px" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 13, color: T.mid, marginTop: 6, fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Page ────────────────────────────────────────────────────────────────
function PageUsers() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'delete'|'suspend'|'unsuspend', user }

  const load = useCallback(() => {
    setLoading(true);
    api.admin.listUsers(page, 20, search)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const doAction = async (type, userId) => {
    setActionLoading(userId + type);
    try {
      if (type === "delete") await api.admin.deleteUser(userId);
      else if (type === "suspend") await api.admin.suspendUser(userId);
      else if (type === "unsuspend") await api.admin.unsuspendUser(userId);
      load();
    } catch (e) {
      alert(e.message || "Action failed");
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const btnStyle = (bg, color) => ({
    fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
    border: "none", background: bg, color, cursor: "pointer", whiteSpace: "nowrap",
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: 0 }}>Users ({data.total})</h2>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name, email or business…"
            style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 13, width: 260, outline: "none" }}
          />
          <button type="submit" style={{ ...btnStyle(T.p500, "#fff"), padding: "8px 16px", fontSize: 13 }}>Search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ color: T.soft, fontSize: 14, padding: 24 }}>Loading users…</div>
      ) : (
        <>
          <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.paper }}>
                  {["User", "Business", "Plan", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: T.mid, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < data.users.length - 1 ? `1px solid ${T.line}` : "none", background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.paper}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: T.ink }}>{u.firstName} {u.lastName}</div>
                      <div style={{ color: T.soft, fontSize: 12, marginTop: 2 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.business ? (
                        <>
                          <div style={{ fontWeight: 500, color: T.ink }}>{u.business.name}</div>
                          <div style={{ color: T.soft, fontSize: 12, marginTop: 2 }}>{u.business.type} · {u.business.country}</div>
                        </>
                      ) : <span style={{ color: T.soft, fontSize: 12 }}>No business</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <PlanPill plan={u.business?.subscription?.plan} subStatus={u.business?.subscription?.status} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusPill status={u.status} />
                    </td>
                    <td style={{ padding: "12px 16px", color: T.mid, whiteSpace: "nowrap" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {u.status === "ACTIVE" ? (
                          <button
                            style={btnStyle(T.yellowBg, T.yellow)}
                            disabled={!!actionLoading}
                            onClick={() => setConfirm({ type: "suspend", user: u })}>
                            Suspend
                          </button>
                        ) : (
                          <button
                            style={btnStyle(T.greenBg, T.green)}
                            disabled={!!actionLoading}
                            onClick={() => setConfirm({ type: "unsuspend", user: u })}>
                            Reinstate
                          </button>
                        )}
                        <button
                          style={btnStyle(T.redBg, T.red)}
                          disabled={!!actionLoading}
                          onClick={() => setConfirm({ type: "delete", user: u })}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: T.soft }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {Array.from({ length: data.pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  style={{ ...btnStyle(page === i + 1 ? T.p500 : T.paper, page === i + 1 ? "#fff" : T.mid), padding: "6px 14px", border: `1px solid ${T.line}` }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: T.white, borderRadius: 20, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <h3 style={{ margin: "0 0 12px", color: T.ink, fontSize: 18, fontWeight: 700 }}>
              {confirm.type === "delete" ? "Delete account?" : confirm.type === "suspend" ? "Suspend account?" : "Reinstate account?"}
            </h3>
            <p style={{ color: T.mid, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              {confirm.type === "delete" && <>This will permanently delete <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>'s account and remove their AI agent from ElevenLabs. This cannot be undone.</>}
              {confirm.type === "suspend" && <>This will suspend <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>'s account and send them a suspension notification email.</>}
              {confirm.type === "unsuspend" && <>This will reinstate <strong>{confirm.user.firstName} {confirm.user.lastName}</strong>'s account and send them a reinstatement email.</>}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirm(null)} style={btnStyle(T.paper, T.mid)}>Cancel</button>
              <button
                disabled={!!actionLoading}
                onClick={() => doAction(confirm.type, confirm.user.id)}
                style={btnStyle(confirm.type === "delete" ? T.red : confirm.type === "suspend" ? T.yellow : T.green, "#fff")}>
                {actionLoading ? "Processing…" : confirm.type === "delete" ? "Delete" : confirm.type === "suspend" ? "Suspend" : "Reinstate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────
function UsageBar({ used, total, color = T.p500 }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const barColor = pct > 90 ? T.red : pct > 70 ? T.yellow : color;
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.soft, marginBottom: 4 }}>
        <span>{used?.toLocaleString()} / {total?.toLocaleString()}</span>
        <span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
      </div>
      <div style={{ background: T.paper, borderRadius: 6, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 6, transition: "width .4s" }} />
      </div>
    </div>
  );
}

function Row({ label, value, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: `1px solid ${T.line}` }}>
      <span style={{ fontSize: 12, color: T.soft, fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: note ? T.soft : T.ink, fontWeight: note ? 400 : 600, textAlign: "right", maxWidth: 220, fontStyle: note ? "italic" : "normal" }}>{value ?? "—"}</span>
    </div>
  );
}

// ─── Integrations Page ────────────────────────────────────────────────────────
function PageIntegrations() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setRefreshing(true);
    api.admin.getIntegrationStats()
      .then(setStats).catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  const statusColors = (s) => s === "connected"
    ? { label: "CONNECTED", color: T.green, bg: T.greenBg, bd: T.greenBd }
    : s === "error"
    ? { label: "ERROR", color: T.red, bg: T.redBg, bd: T.redBd }
    : { label: s === "not_configured" ? "NOT SET" : "CONFIGURED", color: T.yellow, bg: T.yellowBg, bd: T.yellowBd };

  const Card = ({ icon, name, data, children }) => {
    const sc = statusColors(data?.status);
    return (
      <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontWeight: 700, color: T.ink, fontSize: 14 }}>{name}</span>
          </div>
          {pill(sc.label, sc.color, sc.bg, sc.bd)}
        </div>
        {data?.status === "error" && (
          <div style={{ fontSize: 12, color: T.red, background: T.redBg, border: `1px solid ${T.redBd}`, borderRadius: 8, padding: "7px 11px", marginBottom: 10 }}>
            {data.message}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
    );
  };

  if (loading) return <div style={{ color: T.soft, fontSize: 14 }}>Fetching live data from all services…</div>;

  const el = stats?.elevenlabs;
  const tw = stats?.twilio;
  const st = stats?.stripe;
  const an = stats?.anthropic;
  const gp = stats?.googlePlaces;
  const rs = stats?.resend;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: 0 }}>Third-Party Services</h2>
        <button onClick={load} disabled={refreshing}
          style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, background: T.white, color: T.mid, cursor: "pointer" }}>
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>

        {/* ElevenLabs */}
        <Card icon="🎙️" name="ElevenLabs" data={el}>
          {el?.status === "connected" && <>
            {el.tier && <Row label="Tier" value={el.tier.replace(/_/g, " ")} />}
            {el.voiceLimit != null && <Row label="Voices" value={`${el.voiceCount} / ${el.voiceLimit}`} />}
            {el.characterLimit != null ? (
              <>
                <div style={{ padding: "8px 0 4px" }}>
                  <div style={{ fontSize: 12, color: T.soft, marginBottom: 2, fontWeight: 500 }}>Character usage</div>
                  <UsageBar used={el.characterCount} total={el.characterLimit} />
                </div>
                <Row label="Characters remaining" value={el.remainingCharacters?.toLocaleString()} />
                <Row label="Resets" value={el.nextResetDate ? new Date(el.nextResetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
              </>
            ) : (
              <div style={{ fontSize: 12, color: T.soft, fontStyle: "italic", padding: "6px 0" }}>
                Subscription data unavailable — API key is scoped to Conversational AI only.
              </div>
            )}
            <div style={{ height: 1, background: T.line, margin: "6px 0" }} />
            <Row label="Active agents" value={el.activeAgents ?? "—"} />
          </>}
        </Card>

        {/* Twilio */}
        <Card icon="📞" name="Twilio" data={tw}>
          {tw?.status === "connected" && <>
            <Row label="Account balance" value={`${tw.currency} ${tw.balance}`} />
            <Row label="Month-to-date spend" value={`${tw.currency} ${tw.thisMonthTotalSpend}`} />
            <div style={{ height: 1, background: T.line, margin: "6px 0" }} />
            <Row label="Provisioned numbers" value={tw.activeNumbers} />
            <Row label="Number rental cost" value={`${tw.currency} ${tw.numberRentalCost}`} />
            <div style={{ height: 1, background: T.line, margin: "6px 0" }} />
            <Row label="This month — call mins" value={tw.thisMonthCallMinutes} />
            <Row label="This month — inbound mins" value={tw.thisMonthInboundCallMinutes} />
            <Row label="This month — call cost" value={`${tw.currency} ${tw.thisMonthCallCost}`} />
            <Row label="This month — SMS sent" value={tw.thisMonthSmsCount?.toLocaleString()} />
            <Row label="This month — SMS cost" value={`${tw.currency} ${tw.thisMonthSmsCost}`} />
            <div style={{ height: 1, background: T.line, margin: "6px 0" }} />
            <Row label="Total calls handled" value={tw.totalCallsHandled?.toLocaleString()} />
          </>}
        </Card>

        {/* Stripe */}
        <Card icon="💳" name="Stripe" data={st}>
          {st?.status === "connected" && <>
            <Row label="Total customers" value={st.totalCustomers?.toLocaleString()} />
            <Row label="Active subscriptions" value={st.activeSubscriptions?.toLocaleString()} />
            <Row label="On trial" value={st.trialSubscriptions?.toLocaleString()} />
            <Row label="Total revenue" value={`${st.currency ?? "GBP"} ${parseFloat(st.totalRevenue ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} />
          </>}
        </Card>

        {/* Anthropic */}
        <Card icon="🤖" name="Anthropic (Claude)" data={an}>
          {an?.totalExtractions != null && <Row label="Total extractions run" value={an.totalExtractions?.toLocaleString()} />}
          {an?.last30DaysInputTokens != null ? <>
            {/* Actual cost from cost_report */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>Actual spend (last 30d)</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#166534" }}>
                {an.actualCostUsd != null
                  ? an.actualCostUsd < 0.01
                    ? `$${an.actualCostUsd.toFixed(6)}`
                    : `$${an.actualCostUsd.toFixed(4)}`
                  : '—'}
              </div>
              <div style={{ fontSize: 11, color: "#15803d", marginTop: 2 }}>Reported directly by Anthropic's cost API</div>
            </div>

            {/* Token counts */}
            <Row label="Input tokens (30d)" value={an.last30DaysInputTokens?.toLocaleString()} />
            <Row label="Output tokens (30d)" value={an.last30DaysOutputTokens?.toLocaleString()} />
            <Row label="Cache write tokens (30d)" value={an.last30DaysCacheTokens?.toLocaleString()} />

            {/* Cost breakdown by type */}
            {an.costByType && Object.keys(an.costByType).length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Cost breakdown</div>
                {Object.entries(an.costByType).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                    <span style={{ color: T.mid }}>{k.replace(/_cost$/, '').replace(/_/g, ' ')}</span>
                    <span style={{ color: T.ink, fontWeight: 600 }}>${Number(v).toFixed(6)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* By model */}
            {an.byModel?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>By model</div>
                {an.byModel.map(m => (
                  <div key={m.model} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                    <span style={{ color: T.ink, fontWeight: 600, fontFamily: "monospace", fontSize: 10.5 }}>{m.model}</span>
                    <span style={{ color: T.soft }}>{m.totalTokens?.toLocaleString()} tokens</span>
                  </div>
                ))}
              </div>
            )}

            {/* Credits note */}
            <div style={{ marginTop: 12, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: "#92400e", lineHeight: 1.5 }}>
              💳 Credit balance & deposit history are not available via API —
              check <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#92400e", fontWeight: 700 }}>console.anthropic.com</a>
            </div>
          </> : an?.note && (
            <div style={{ fontSize: 12, color: T.soft, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>
              {an.note}
            </div>
          )}
        </Card>

        {/* Google Places */}
        <Card icon="🗺️" name="Google Places" data={gp}>
          <Row label="Used for" value={gp?.usedFor} />
          {gp?.note && (
            <div style={{ fontSize: 12, color: T.soft, fontStyle: "italic", marginTop: 8, lineHeight: 1.5 }}>{gp.note}</div>
          )}
        </Card>

        {/* Resend */}
        <Card icon="✉️" name="Resend (Email)" data={rs}>
          <Row label="Used for" value={rs?.usedFor} />
          {rs?.note && (
            <div style={{ fontSize: 12, color: T.soft, fontStyle: "italic", marginTop: 8, lineHeight: 1.5 }}>{rs.note}</div>
          )}
        </Card>

      </div>
    </div>
  );
}

// ─── Admin App Shell ──────────────────────────────────────────────────────────
export default function AdminApp() {
  const [page, setPage] = useState("Overview");
  const { handleLogout } = useAuth();

  const navItem = (label) => (
    <button key={label} onClick={() => setPage(label)} style={{
      background: page === label ? T.p500 : "transparent",
      color: page === label ? "#fff" : T.mid,
      border: "none", borderRadius: 10, padding: "9px 16px",
      fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left", width: "100%",
      transition: "all .15s",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.paper, fontFamily: "'Outfit', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: T.white, borderRight: `1.5px solid ${T.line}`, display: "flex", flexDirection: "column", padding: "28px 16px", flexShrink: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: -0.5 }}>Talkativ</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p500, letterSpacing: 1, marginTop: 2 }}>ADMIN</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {PAGES.map(navItem)}
        </div>
        <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: T.soft, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: "8px 16px", borderRadius: 10 }}>
          Sign out
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "36px 40px", overflow: "auto" }}>
        {page === "Overview" && <PageOverview />}
        {page === "Users" && <PageUsers />}
        {page === "Integrations" && <PageIntegrations />}
      </div>
    </div>
  );
}
