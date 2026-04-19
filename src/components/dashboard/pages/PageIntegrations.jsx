import { useState, useEffect } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import TopBar from '../TopBar';

// ─── Credential-based integrations ───────────────────────────────────────────

const POS_INTEGRATIONS = [
  {
    name: "Square",
    icon: "🟦",
    category: "ordering",
    desc: "Connect Square POS — orders sync and customers pay directly into your Square account",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAAAl..." },
      { key: "locationId",  label: "Location ID",  placeholder: "LXXXXXXXXXXXXXXXX" },
    ],
  },
  {
    name: "Clover",
    icon: "🍀",
    category: "ordering",
    desc: "Full order and inventory sync with Clover POS",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "..." },
      { key: "merchantId",  label: "Merchant ID",  placeholder: "XXXXXXXXXXXXXXXX" },
    ],
  },
  {
    name: "SumUp",
    icon: "🟠",
    category: "ordering",
    desc: "Accept payments via SumUp — popular with UK takeaways and independents",
    fields: [
      { key: "apiKey",       label: "API Key",        placeholder: "sup_sk_..." },
      { key: "merchantCode", label: "Merchant Code",  placeholder: "M..." },
    ],
  },
  {
    name: "Zettle",
    icon: "💳",
    category: "ordering",
    desc: "Connect Zettle by PayPal for in-person and phone payments",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "..." },
    ],
  },
  {
    name: "SpotOn",
    icon: "📍",
    category: "ordering",
    desc: "Connect SpotOn POS to sync your menu and accept orders in real-time",
    fields: [
      { key: "apiKey",  label: "API Key", placeholder: "sp_live_..." },
      { key: "siteId",  label: "Site ID", placeholder: "SITE-XXXXXXXX" },
    ],
  },
];

const RESERVATION_INTEGRATIONS = [
  {
    name: "resOS",
    icon: "📅",
    category: "reservation",
    desc: "Manage table reservations and sync bookings through resOS",
    fields: [
      { key: "apiKey",      label: "API Key",      placeholder: "rn_live_..." },
      { key: "propertyId",  label: "Property ID",  placeholder: "PROP-XXXXXXXX" },
    ],
  },
  {
    name: "ResDiary",
    icon: "📒",
    category: "reservation",
    desc: "UK's leading reservation platform — used by 10,000+ restaurants",
    fields: [
      { key: "apiKey",      label: "API Key",       placeholder: "..." },
      { key: "restaurantId",label: "Restaurant ID", placeholder: "..." },
    ],
  },
  {
    name: "OpenTable",
    icon: "🍽️",
    category: "reservation",
    desc: "Sync reservations with OpenTable's global diner network",
    fields: [
      { key: "apiKey",      label: "API Key",       placeholder: "..." },
      { key: "restaurantId",label: "Restaurant ID", placeholder: "..." },
    ],
  },
  {
    name: "Collins",
    icon: "📋",
    category: "reservation",
    desc: "Connect Collins reservation management for UK venues",
    fields: [
      { key: "apiKey",  label: "API Key",  placeholder: "..." },
      { key: "venueId", label: "Venue ID", placeholder: "..." },
    ],
  },
];

const ALL_CREDENTIAL_INTEGRATIONS = [...POS_INTEGRATIONS, ...RESERVATION_INTEGRATIONS];
const TOTAL_INTEGRATIONS = ALL_CREDENTIAL_INTEGRATIONS.length + 1; // +1 for Stripe Connect

export default function PageIntegrations({ user, agentName, bizName }) {
  const displayBiz = bizName || "your business";

  const [connected, setConnected] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);

  // Connect modal (credential-based)
  const [showConnectModal, setShowConnectModal]   = useState(false);
  const [pickedIntegration, setPickedIntegration] = useState(null);
  const [configValues, setConfigValues]           = useState({});
  const [configError, setConfigError]             = useState('');
  const [connecting, setConnecting]               = useState(false);

  // Stripe Connect OAuth
  const [stripeConnecting, setStripeConnecting]   = useState(false);
  const [stripeError, setStripeError]             = useState('');

  const fetchConnected = async () => {
    try { setConnected(await api.integrations.list()); }
    catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchConnected();
    // Handle Stripe Connect callback query params — params are in window.location.search
    // (before the #) so React Router can still match the hash route correctly.
    const search = window.location.search;
    if (search.includes('stripe_connected=1')) {
      window.history.replaceState(null, '', window.location.pathname + '#/dashboard/integrations');
      fetchConnected();
    } else if (search.includes('stripe_error=')) {
      const match = search.match(/stripe_error=([^&]+)/);
      if (match) setStripeError(decodeURIComponent(match[1]));
      window.history.replaceState(null, '', window.location.pathname + '#/dashboard/integrations');
    }
  }, []);

  const openModal = () => {
    setPickedIntegration(null);
    setConfigValues({});
    setConfigError('');
    setShowConnectModal(true);
  };

  const pickIntegration = (intg) => {
    setPickedIntegration(intg);
    const vals = {};
    intg.fields.forEach(f => { vals[f.key] = ''; });
    setConfigValues(vals);
    setConfigError('');
  };

  const handleConnect = async () => {
    if (!pickedIntegration) return;
    const missing = pickedIntegration.fields.find(f => !configValues[f.key]?.trim());
    if (missing) { setConfigError(`${missing.label} is required`); return; }
    setConnecting(true);
    try {
      await api.integrations.connect(pickedIntegration.name, pickedIntegration.category, configValues);
      await fetchConnected();
      setShowConnectModal(false);
      setPickedIntegration(null);
    } catch (e) {
      setConfigError(e?.message || 'Connection failed. Check your credentials.');
    }
    setConnecting(false);
  };

  const handleDisconnect = async (id) => {
    setDisconnecting(id);
    try { await api.integrations.disconnect(id); await fetchConnected(); }
    catch {}
    setDisconnecting(null);
  };

  const handleStripeConnect = async () => {
    setStripeConnecting(true);
    setStripeError('');
    try {
      const { url } = await api.integrations.stripeConnectInit();
      window.location.href = url;
    } catch (e) {
      setStripeError(e?.message || 'Could not start Stripe connection. Try again.');
      setStripeConnecting(false);
    }
  };

  const handleStripeDisconnect = async () => {
    setDisconnecting('stripe');
    try { await api.integrations.stripeConnectDisconnect(); await fetchConnected(); }
    catch {}
    setDisconnecting(null);
  };

  const connectedNames = new Set(connected.map(c => c.name));
  const connectedCount = connected.length;
  const stripeConnected = connectedNames.has('Stripe');
  const notConnected = ALL_CREDENTIAL_INTEGRATIONS.filter(i => !connectedNames.has(i.name));

  const intgIcon = (name) => ALL_CREDENTIAL_INTEGRATIONS.find(i => i.name === name)?.icon
    || (name === 'Stripe' ? '💳' : '🔌');
  const intgDesc = (name) => ALL_CREDENTIAL_INTEGRATIONS.find(i => i.name === name)?.desc
    || (name === 'Stripe' ? 'Accept payments directly into your Stripe account — 0.5% platform fee' : '');

  const modalOverlay = { position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:24 };

  return (
    <>
      <TopBar title={<>Integrations</>} subtitle={`Connect ${displayBiz} to the services you use`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:'9px 18px'}} onClick={openModal}>+ Connect integration</button>
      </TopBar>

      {/* KPI row */}
      <div className="kpi-row" style={{gridTemplateColumns:'repeat(3, 1fr)',marginBottom:28}}>
        {[
          { l:'Available',          v:String(TOTAL_INTEGRATIONS),  d:'Ready to connect' },
          { l:'Connected',          v:String(connectedCount),      d:connectedCount > 0 ? 'Active right now' : 'Connect one to get started' },
          { l:'Remaining',          v:String(TOTAL_INTEGRATIONS - connectedCount), d:'Available to connect' },
        ].map(k=>(
          <div className="kpi-card" key={k.l}>
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-delta">{k.d}</div>
          </div>
        ))}
      </div>

      {/* ── Stripe Connect section ── */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:11,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Payments (Stripe Connect)</div>
        <div style={{background:T.white,border:`1.5px solid ${stripeConnected ? T.greenBd : T.line}`,borderRadius:18,padding:24,display:'flex',alignItems:'center',gap:20}}>
          <div style={{width:52,height:52,borderRadius:14,background:stripeConnected ? T.greenBg : '#f5f3ff',border:`1.5px solid ${stripeConnected ? T.greenBd : '#ddd6fe'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>💳</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,marginBottom:4}}>Stripe Connect</div>
            <div style={{fontSize:13,color:T.soft,lineHeight:1.5}}>
              {stripeConnected
                ? 'Your Stripe account is connected. Customers pay directly into your account.'
                : 'Connect your existing Stripe account so customers can pay you directly. We take a 0.5% platform fee per transaction.'}
            </div>
            {stripeError && <div style={{fontSize:12,color:T.red,marginTop:6}}>⚠️ {stripeError}</div>}
          </div>
          <div style={{flexShrink:0}}>
            {stripeConnected ? (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:50,fontSize:12,fontWeight:700,background:T.greenBg,color:T.green,border:`1px solid ${T.greenBd}`}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:T.green,display:'inline-block'}}/>Connected
                </span>
                <button
                  disabled={disconnecting === 'stripe'}
                  onClick={handleStripeDisconnect}
                  style={{padding:'7px 16px',borderRadius:50,border:`1.5px solid ${T.red}33`,background:'#FEF2F2',color:T.red,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'Outfit',sans-serif",opacity:disconnecting==='stripe'?0.6:1}}>
                  {disconnecting === 'stripe' ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleStripeConnect}
                disabled={stripeConnecting}
                style={{padding:'10px 22px',borderRadius:50,border:'none',background:'#635BFF',color:'white',fontSize:13,fontWeight:700,cursor:stripeConnecting?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:stripeConnecting?0.7:1,whiteSpace:'nowrap'}}>
                {stripeConnecting ? 'Redirecting…' : 'Connect with Stripe →'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Connected integrations ── */}
      {loading ? (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:36,marginBottom:12}}>⏳</div>
          <div style={{fontSize:15,fontWeight:600,color:T.ink}}>Loading integrations…</div>
        </div>
      ) : connectedCount === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'64px 32px'}}>
          <div style={{fontSize:48,marginBottom:16}}>🔌</div>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:8}}>No integrations connected yet</div>
          <div style={{fontSize:14,color:T.soft,marginBottom:28,lineHeight:1.6,maxWidth:420,margin:'0 auto 28px'}}>
            Connect Square, SumUp, or Clover to take orders, or resOS / ResDiary to manage reservations.<br/>
            Your agent will use these to serve customers on every call.
          </div>
          <button className="btn-primary" style={{fontSize:13,padding:'11px 28px'}} onClick={openModal}>+ Connect your first integration</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:20}}>
          {connected.filter(i => i.name !== 'Stripe').map(int => {
            const isBusy = disconnecting === int.id;
            return (
              <div key={int.id} style={{background:T.white,border:`1.5px solid ${T.greenBd}`,borderRadius:18,padding:26,display:'flex',flexDirection:'column',transition:'box-shadow .2s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 28px rgba(34,197,94,.1)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
                  <div style={{width:56,height:56,borderRadius:16,background:T.greenBg,border:`1.5px solid ${T.greenBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{intgIcon(int.name)}</div>
                  <span style={{padding:'4px 11px',borderRadius:50,fontSize:10.5,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',background:T.p50,color:T.p700,border:`1px solid ${T.p100}`}}>{int.category}</span>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:6}}>{int.name}</div>
                <div style={{fontSize:13,color:T.soft,lineHeight:1.55,flex:1}}>{intgDesc(int.name)}</div>
                {int.lastSynced && (
                  <div style={{fontSize:11.5,color:T.soft,marginTop:10}}>
                    Connected: {new Date(int.lastSynced).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                  </div>
                )}
                <div style={{marginTop:20,paddingTop:18,borderTop:`1px solid ${T.paper}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:50,fontSize:12,fontWeight:700,background:T.greenBg,color:T.green,border:`1px solid ${T.greenBd}`}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:T.green,display:'inline-block'}}/>Connected
                  </span>
                  <button disabled={isBusy} onClick={()=>handleDisconnect(int.id)} style={{padding:'7px 16px',borderRadius:50,border:`1.5px solid ${T.red}33`,background:'#FEF2F2',color:T.red,fontSize:12,fontWeight:700,cursor:isBusy?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:isBusy?0.6:1,transition:'all .18s'}}>
                    {isBusy?'Disconnecting…':'Disconnect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Connect Integration Modal ── */}
      {showConnectModal && (
        <div style={modalOverlay} onClick={()=>{ if(!connecting){ setShowConnectModal(false); setPickedIntegration(null); } }}>
          <div style={{position:'absolute',inset:0,background:'rgba(19,13,46,.45)',backdropFilter:'blur(6px)'}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:'relative',width:'100%',maxWidth:520,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:'fadeUp .3s ease both',overflow:'hidden',maxHeight:'90vh',overflowY:'auto'}}>

            <div style={{padding:'24px 28px 18px',borderBottom:`1px solid ${T.line}`,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:T.white,zIndex:1}}>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>
                  {pickedIntegration ? `Configure ${pickedIntegration.name}` : 'Connect an integration'}
                </h3>
                <p style={{margin:'4px 0 0',fontSize:12,color:T.soft}}>
                  {pickedIntegration ? pickedIntegration.desc : 'Choose a service to connect to your account'}
                </p>
              </div>
              <button onClick={()=>{ if(!connecting){ setShowConnectModal(false); setPickedIntegration(null); } }} style={{width:32,height:32,borderRadius:'50%',border:`1.5px solid ${T.line}`,background:T.paper,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,color:T.mid,flexShrink:0}}>✕</button>
            </div>

            <div style={{padding:'22px 28px 28px'}}>
              {!pickedIntegration ? (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {/* POS section */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:4}}>POS & Payments</div>
                  {POS_INTEGRATIONS.map(intg => {
                    const already = connectedNames.has(intg.name);
                    return (
                      <div key={intg.name} onClick={()=>!already && pickIntegration(intg)}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already ? T.greenBd : T.line}`,background:already ? T.greenBg : T.paper,cursor:already?'default':'pointer',transition:'all .18s'}}
                        onMouseEnter={e=>{ if(!already){e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.background=T.p50;} }}
                        onMouseLeave={e=>{ if(!already){e.currentTarget.style.borderColor=T.line;e.currentTarget.style.background=T.paper;} }}>
                        <div style={{width:40,height:40,borderRadius:10,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{intg.name}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {already
                          ? <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Connected</span>
                          : <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Configure →</span>}
                      </div>
                    );
                  })}
                  {/* Reservation section */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:12}}>Reservations</div>
                  {RESERVATION_INTEGRATIONS.map(intg => {
                    const already = connectedNames.has(intg.name);
                    return (
                      <div key={intg.name} onClick={()=>!already && pickIntegration(intg)}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already ? T.greenBd : T.line}`,background:already ? T.greenBg : T.paper,cursor:already?'default':'pointer',transition:'all .18s'}}
                        onMouseEnter={e=>{ if(!already){e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.background=T.p50;} }}
                        onMouseLeave={e=>{ if(!already){e.currentTarget.style.borderColor=T.line;e.currentTarget.style.background=T.paper;} }}>
                        <div style={{width:40,height:40,borderRadius:10,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{intg.name}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {already
                          ? <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Connected</span>
                          : <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Configure →</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <button onClick={()=>{ setPickedIntegration(null); setConfigError(''); }} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:T.mid,background:'none',border:'none',cursor:'pointer',fontFamily:"'Outfit',sans-serif",marginBottom:18,padding:0}}>
                    ← Back to integrations
                  </button>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {pickedIntegration.fields.map(f=>(
                      <div key={f.key}>
                        <label style={{display:'block',fontSize:11,fontWeight:700,color:T.mid,marginBottom:5,textTransform:'uppercase',letterSpacing:'.4px'}}>{f.label}</label>
                        <input type="text" value={configValues[f.key]||''} onChange={e=>{ setConfigValues(v=>({...v,[f.key]:e.target.value})); setConfigError(''); }}
                          placeholder={f.placeholder}
                          style={{width:'100%',padding:'11px 14px',borderRadius:10,border:`1.5px solid ${T.line}`,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:'none',boxSizing:'border-box',background:T.paper,color:T.ink,transition:'border-color .2s'}}
                          onFocus={e=>e.target.style.borderColor=T.p400} onBlur={e=>e.target.style.borderColor=T.line}/>
                      </div>
                    ))}
                    {configError && (
                      <div style={{background:'#FEF2F2',border:'1.5px solid #FECACA',borderRadius:9,padding:'9px 13px',fontSize:13,color:T.red}}>{configError}</div>
                    )}
                    <div style={{display:'flex',gap:10,marginTop:4}}>
                      <button onClick={()=>{ setShowConnectModal(false); setPickedIntegration(null); }} style={{flex:1,padding:'11px',borderRadius:50,border:`1.5px solid ${T.line}`,background:'transparent',color:T.mid,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
                      <button onClick={handleConnect} disabled={connecting} className="btn-primary" style={{flex:2,fontSize:13,padding:'11px',opacity:connecting?0.7:1,cursor:connecting?'not-allowed':'pointer'}}>
                        {connecting ? 'Connecting…' : `Connect ${pickedIntegration.name}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
