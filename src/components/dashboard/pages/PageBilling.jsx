import { useState, useEffect } from 'react';
import T from '../../../utils/tokens';
import TopBar from '../TopBar';
import { api } from '../../../api.js';

const PLAN_LABELS = {
  GROWTH: 'Growth',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
  TRIALING: 'Free Trial',
};

const PLAN_CALL_LIMITS = { GROWTH: 500, PRO: 1000, ENTERPRISE: null };

const STATUS_BADGE = {
  TRIALING:   { label: 'Trial',    bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  ACTIVE:     { label: 'Active',   bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  PAST_DUE:   { label: 'Past due', bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
  CANCELED:   { label: 'Canceled', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  NO_SUBSCRIPTION: { label: 'No plan', bg: T.paper, color: T.soft, border: T.line },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PageBilling({ user, agentName }) {
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.billing.get(), api.billing.getInvoices()])
      .then(([s, inv]) => { setSub(s); setInvoices(inv || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusKey = sub?.status || 'NO_SUBSCRIPTION';
  const badge = STATUS_BADGE[statusKey] || STATUS_BADGE.NO_SUBSCRIPTION;
  const planLabel = PLAN_LABELS[sub?.plan] || (sub?.plan || 'None');

  return (
    <>
      <TopBar title={<>Billing</>} subtitle="Manage your subscription and payment details" user={user} agentName={agentName}/>

      <div className="resp-grid-2">
        {/* Current plan card */}
        <div className="card" style={{background:`linear-gradient(135deg,${T.ink},${T.ink2})`,border:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Current plan</div>
          {loading ? (
            <div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>Loading…</div>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"white"}}>
                  {sub?.status === 'TRIALING' ? 'Free Trial' : planLabel}
                </div>
                <span style={{background:badge.bg,color:badge.color,border:`1px solid ${badge.border}`,borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700}}>
                  {badge.label}
                </span>
              </div>
              {sub?.status === 'TRIALING' && sub?.trialEndsAt && (
                <div style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24}}>
                  Trial ends {formatDate(sub.trialEndsAt)}
                </div>
              )}
              {sub?.status === 'ACTIVE' && (
                <div style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24}}>
                  {planLabel} · Active subscription
                </div>
              )}
              {(!sub || sub.status === 'NO_SUBSCRIPTION') && (
                <div style={{fontSize:14,color:"rgba(255,255,255,.5)",marginBottom:24}}>
                  No active subscription
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <button style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {sub?.status === 'TRIALING' ? 'Upgrade plan' : 'Change plan'}
                </button>
                {sub?.status === 'ACTIVE' && (
                  <button style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Trial info / usage placeholder */}
        <div className="card">
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>
            {sub?.status === 'TRIALING' ? 'Trial details' : 'Usage this month'}
          </div>
          {loading ? (
            <div style={{fontSize:13,color:T.soft}}>Loading…</div>
          ) : sub?.status === 'TRIALING' ? (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.paper}`}}>
                <span style={{fontSize:13.5,color:T.mid}}>Trial started</span>
                <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>{formatDate(sub?.createdAt)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.paper}`}}>
                <span style={{fontSize:13.5,color:T.mid}}>Trial ends</span>
                <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>{formatDate(sub?.trialEndsAt)}</span>
              </div>
              <div style={{marginTop:16,background:T.p50,border:`1.5px solid ${T.p100}`,borderRadius:12,padding:"12px 14px",fontSize:13,color:T.p700,lineHeight:1.6}}>
                Your trial includes full access to all features. Upgrade before your trial ends to keep your agent active.
              </div>
            </div>
          ) : (
            (() => {
              const limit = PLAN_CALL_LIMITS[sub?.plan];
              const used = sub?.callsThisMonth ?? 0;
              const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
              return (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.paper}`}}>
                    <span style={{fontSize:13.5,color:T.mid}}>Plan</span>
                    <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>{planLabel}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.paper}`}}>
                    <span style={{fontSize:13.5,color:T.mid}}>Calls this month</span>
                    <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>
                      {used}{limit ? ` / ${limit}` : ' (unlimited)'}
                    </span>
                  </div>
                  {limit && (
                    <div style={{paddingTop:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:12,color:T.soft}}>Usage</span>
                        <span style={{fontSize:12,fontWeight:600,color:pct >= 90 ? T.red : T.mid}}>{pct}%</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{width:`${pct}%`,background:pct >= 90 ? T.red : undefined}} />
                      </div>
                      {pct >= 90 && (
                        <div style={{marginTop:10,fontSize:12.5,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>
                          You're approaching your monthly call limit. Consider upgrading to Pro.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>

      <div className="resp-grid-dashboard-hub">
        {/* Invoice history */}
        <div>
          <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:16}}>Invoice history</div>
          {loading ? (
            <div style={{fontSize:13,color:T.soft}}>Loading…</div>
          ) : invoices.length === 0 ? (
            <div style={{background:T.white,border:`1px solid ${T.line}`,borderRadius:14,padding:"32px 24px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>🧾</div>
              <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:6}}>No invoices yet</div>
              <div style={{fontSize:13,color:T.soft}}>Your invoices will appear here once your subscription is active.</div>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
              {invoices.map((inv, i) => (
                <div key={i} style={{background:T.white,border:`1px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s",cursor:"pointer"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 8px 24px rgba(112,53,245,.08)`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none";}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontSize:20,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center"}}>🧾</div>
                    <span className="badge badge-green" style={{padding:"4px 8px"}}>{inv.status}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:4}}>{inv.description || 'Invoice'}</div>
                  <div style={{fontSize:12,color:T.soft,marginBottom:16}}>{formatDate(inv.createdAt)}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                    <div style={{fontSize:16,fontWeight:700,color:T.ink}}>£{((inv.amount || 0) / 100).toFixed(2)}</div>
                    <button style={{fontSize:12,padding:"6px 14px",background:"#fff",border:`1.5px solid ${T.line}`,color:T.ink,borderRadius:6,fontWeight:600,cursor:"pointer"}}>Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="card" style={{height:"fit-content",position:"sticky",top:20}}>
          <div className="card-head">Payment method</div>
          <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"16px 18px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:22}}>💳</span>
              {sub?.stripeCustomerId
                ? <span className="badge badge-green">On file</span>
                : <span style={{fontSize:12,color:T.soft}}>Not set up</span>}
            </div>
            {sub?.stripeCustomerId ? (
              <>
                <div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:1.5,marginBottom:4,fontFamily:"monospace"}}>
                  •••• •••• •••• {sub?.cardLast4 || '••••'}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {sub?.cardBrand && (
                    <span style={{fontSize:11,fontWeight:700,background:T.p50,color:T.p700,border:`1px solid ${T.p100}`,borderRadius:4,padding:"2px 6px",textTransform:"uppercase",letterSpacing:.5}}>
                      {sub.cardBrand}
                    </span>
                  )}
                  <span style={{fontSize:12,color:T.soft}}>Card on file — managed via Stripe</span>
                </div>
              </>
            ) : (
              <div style={{fontSize:13,color:T.soft,lineHeight:1.6}}>
                No payment method on file. Add one before your trial ends to keep your agent active.
              </div>
            )}
          </div>
          <button style={{width:"100%",background:`linear-gradient(135deg, ${T.ink}, ${T.ink2})`,border:"none",color:"white",fontWeight:600,fontSize:14,padding:"12px 0",borderRadius:10,cursor:"pointer",marginBottom:12,boxShadow:`0 4px 12px rgba(0,0,0,0.15)`}}>
            {sub?.stripeCustomerId ? 'Update payment method' : 'Add payment method'}
          </button>
          <p style={{fontSize:12,color:T.soft,textAlign:"center",margin:0}}>🔒 Secured by Stripe</p>
        </div>
      </div>
    </>
  );
}
