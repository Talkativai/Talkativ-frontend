import { useState, useEffect } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import TopBar from '../TopBar';

// ─── OAuth integrations (one-tap connect) ────────────────────────────────────

const OAUTH_POS_INTEGRATIONS = [
  {
    name: "Square",
    icon: "🟦",
    category: "ordering",
    desc: "Connect Square POS — orders sync and your menu is pulled in automatically",
    oauthKey: "squareConnectInit",
    connectedParam: "square_connected",
    errorParam: "square_error",
    color: "#006AFF",
  },
  {
    name: "Clover",
    icon: "🍀",
    category: "ordering",
    desc: "Full order and inventory sync with Clover POS",
    oauthKey: "cloverConnectInit",
    connectedParam: "clover_connected",
    errorParam: "clover_error",
    color: "#1DA462",
  },
  {
    name: "SumUp",
    icon: "🟠",
    category: "ordering",
    desc: "Accept payments via SumUp — popular with UK takeaways and independents",
    oauthKey: "sumupConnectInit",
    connectedParam: "sumup_connected",
    errorParam: "sumup_error",
    color: "#00B4D8",
  },
  {
    name: "Zettle",
    icon: "💳",
    category: "ordering",
    desc: "Connect Zettle by PayPal — menu sync, in-person and phone payments",
    oauthKey: "zettleConnectInit",
    connectedParam: "zettle_connected",
    errorParam: "zettle_error",
    color: "#009BDE",
  },
];

const POS_INTEGRATIONS = [
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
const ALL_INTEGRATIONS_FOR_META   = [...OAUTH_POS_INTEGRATIONS, ...ALL_CREDENTIAL_INTEGRATIONS];

const PAYMENT_NAMES     = ['Stripe', 'Square', 'Clover', 'SumUp', 'Zettle'];
const POS_NAMES         = ['Square', 'Clover', 'Zettle', 'SpotOn'];
const RESERVATION_NAMES = ['resOS', 'ResDiary', 'OpenTable', 'Collins'];
const MENU_SYNC_NAMES   = ['Square', 'Clover', 'Zettle'];
const PRO_ONLY_NAMES    = ['Square', 'Clover', 'Zettle', 'SpotOn', 'resOS', 'ResDiary', 'OpenTable', 'Collins'];

export default function PageIntegrations({ user, agentName, bizName }) {
  const displayBiz = bizName || "your business";

  const [connected, setConnected]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [disconnecting, setDisconnecting]   = useState(null);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [userPlan, setUserPlan]             = useState(null);

  // Connect modal
  const [showConnectModal, setShowConnectModal]   = useState(false);
  const [pickedIntegration, setPickedIntegration] = useState(null);
  const [configValues, setConfigValues]           = useState({});
  const [configError, setConfigError]             = useState('');
  const [connecting, setConnecting]               = useState(false);

  // OAuth state
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [stripeError, setStripeError]           = useState('');
  const [oauthConnecting, setOauthConnecting]   = useState(null);
  const [oauthErrors, setOauthErrors]           = useState({});

  const fetchConnected = async () => {
    try { setConnected(await api.integrations.list()); }
    catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchConnected();
    api.billing.get().then(d => { if (d?.plan) setUserPlan(d.plan); }).catch(() => {});
    const search = window.location.search;
    const providers = [
      { connected: 'stripe_connected=1', error: 'stripe_error=', name: 'Stripe', setter: setStripeError },
      { connected: 'square_connected=1', error: 'square_error=', name: 'Square' },
      { connected: 'clover_connected=1', error: 'clover_error=', name: 'Clover' },
      { connected: 'sumup_connected=1',  error: 'sumup_error=',  name: 'SumUp'  },
      { connected: 'zettle_connected=1', error: 'zettle_error=', name: 'Zettle' },
    ];
    for (const p of providers) {
      if (search.includes(p.connected)) {
        window.history.replaceState(null, '', window.location.pathname + '#/dashboard');
        fetchConnected();
        break;
      } else if (search.includes(p.error)) {
        const match = search.match(new RegExp(p.error + '([^&]+)'));
        const msg = match ? decodeURIComponent(match[1]) : 'Connection failed';
        if (p.setter) p.setter(msg);
        else setOauthErrors(prev => ({ ...prev, [p.name]: msg }));
        window.history.replaceState(null, '', window.location.pathname + '#/dashboard');
        break;
      }
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

  const handleSetPrimary = async (id) => {
    setSettingPrimary(id);
    try { await api.integrations.setPrimary(id); await fetchConnected(); }
    catch {}
    setSettingPrimary(null);
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

  const handleOAuthConnect = async (intg) => {
    setOauthConnecting(intg.name);
    setOauthErrors(prev => ({ ...prev, [intg.name]: '' }));
    try {
      const { url } = await api.integrations[intg.oauthKey]();
      window.location.href = url;
    } catch (e) {
      setOauthErrors(prev => ({ ...prev, [intg.name]: e?.message || 'Could not start connection. Try again.' }));
      setOauthConnecting(null);
    }
  };

  // ─── Derived state ─────────────────────────────────────────────────────────
  const connectedNames      = new Set(connected.map(c => c.name));
  const isProPlan           = userPlan === 'PRO' || userPlan === 'ENTERPRISE';
  const stripeConnected     = connectedNames.has('Stripe');

  const connectedPayment    = connected.filter(i => PAYMENT_NAMES.includes(i.name));
  const connectedPOS        = connected.filter(i => POS_NAMES.includes(i.name));
  const connectedReservation = connected.filter(i => RESERVATION_NAMES.includes(i.name));

  const PAYMENT_PROVIDERS = ['Square', 'Clover', 'SumUp', 'Zettle', 'Stripe'];
  const hasKDS = connectedNames.has('Square') || connectedNames.has('Clover');
  const hasMenuIntegration = connectedNames.has('Square') || connectedNames.has('Clover') || connectedNames.has('Zettle');
  const primaryPayment = connectedPayment.find(i => i.isPrimary) || connectedPayment[0] || null;

  const smartBanner = (() => {
    if (connectedPayment.length === 0) return { type: 'warn', msg: 'No payment integration connected — your agent cannot take orders until you connect one.' };
    if (hasKDS && hasMenuIntegration) return { type: 'ok', msg: `Menu + payments powered by ${primaryPayment?.name}. Customers pay directly to you. Orders push to your KDS automatically.` };
    if (hasMenuIntegration) return { type: 'ok', msg: `Menu from ${primaryPayment?.name}. Payments via ${primaryPayment?.name}. Customers pay directly to you.` };
    return { type: 'info', msg: `Payments via ${primaryPayment?.name}. Your Talkativ menu is used for ordering. Customers pay directly to you.` };
  })();

  const intgIcon = (name) => ALL_INTEGRATIONS_FOR_META.find(i => i.name === name)?.icon || (name === 'Stripe' ? '💳' : '🔌');
  const intgDesc = (name) => ALL_INTEGRATIONS_FOR_META.find(i => i.name === name)?.desc || (name === 'Stripe' ? 'Accept payments directly into your Stripe account' : '');
  const oauthColor = (name) => OAUTH_POS_INTEGRATIONS.find(i => i.name === name)?.color || (name === 'Stripe' ? '#635BFF' : '#666');

  const modalOverlay = { position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:24 };

  const SectionHeader = ({ title, desc }) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:800,color:T.ink,marginBottom:3}}>{title}</div>
      <div style={{fontSize:12,color:T.soft}}>{desc}</div>
    </div>
  );

  const EmptySection = ({ icon, title, sub, onAdd }) => (
    <div style={{background:T.paper,border:`1.5px dashed ${T.line}`,borderRadius:16,padding:'28px 24px',textAlign:'center'}}>
      <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
      <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:5}}>{title}</div>
      <div style={{fontSize:12.5,color:T.soft,marginBottom:18,maxWidth:380,margin:'0 auto 18px'}}>{sub}</div>
      <button className="btn-primary" style={{fontSize:13,padding:'9px 22px'}} onClick={onAdd}>+ Connect</button>
    </div>
  );

  const ConnectedBadge = () => (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:50,fontSize:11,fontWeight:700,background:T.greenBg,color:T.green,border:`1px solid ${T.greenBd}`,flexShrink:0}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:T.green,display:'inline-block'}}/>Connected
    </span>
  );

  const DisconnectBtn = ({ onClick, busy }) => (
    <button disabled={busy} onClick={onClick}
      style={{padding:'6px 14px',borderRadius:50,border:`1.5px solid ${T.red}33`,background:'#FEF2F2',color:T.red,fontSize:12,fontWeight:700,cursor:busy?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:busy?0.6:1,whiteSpace:'nowrap',flexShrink:0}}>
      {busy ? '…' : 'Disconnect'}
    </button>
  );

  const anyError = stripeError || Object.values(oauthErrors).find(Boolean);

  return (
    <>
      <TopBar title={<>Integrations</>} subtitle={`Connect ${displayBiz} to the services you use`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:'9px 18px'}} onClick={openModal}>+ Connect integration</button>
      </TopBar>

      {/* Error banner */}
      {anyError && (
        <div style={{marginBottom:16,padding:'12px 18px',borderRadius:12,background:'#FEF2F2',border:'1.5px solid #FECACA',fontSize:13,color:T.red,display:'flex',gap:8,alignItems:'center'}}>
          <span>⚠️</span><span>{anyError}</span>
        </div>
      )}

      {/* Smart status banner */}
      {!loading && (
        <div style={{marginBottom:24,padding:'12px 18px',borderRadius:12,
          background: smartBanner.type==='warn'?'#FEF3C7':smartBanner.type==='ok'?T.greenBg:'#EFF6FF',
          border:`1.5px solid ${smartBanner.type==='warn'?'#FCD34D':smartBanner.type==='ok'?T.greenBd:'#BFDBFE'}`,
          display:'flex',alignItems:'center',gap:10,fontSize:13,
          color: smartBanner.type==='warn'?'#92400E':smartBanner.type==='ok'?T.green:'#1E40AF'}}>
          <span style={{fontSize:16}}>{smartBanner.type==='warn'?'⚠️':smartBanner.type==='ok'?'✅':'ℹ️'}</span>
          <span>{smartBanner.msg}</span>
        </div>
      )}

      {loading ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:36,marginBottom:12}}>⏳</div>
          <div style={{fontSize:15,fontWeight:600,color:T.ink}}>Loading integrations…</div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:32}}>

          {/* ── Primary Payment ── */}
          <div>
            <SectionHeader
              title="Primary Payment"
              desc="Customers pay directly to your account. Set one provider as primary — that's what handles all phone orders and deposits."
            />
            {connectedPayment.length === 0 ? (
              <EmptySection
                icon="💳"
                title="No payment provider connected"
                sub="Connect Stripe, SumUp, Square, Clover, or Zettle so customers can pay you directly on every call."
                onAdd={openModal}
              />
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {connectedPayment.map(p => {
                  const isStripeProv = p.name === 'Stripe';
                  const isBusy = (isStripeProv ? disconnecting === 'stripe' : disconnecting === p.id) || settingPrimary === p.id;
                  return (
                    <div key={p.id} style={{background:T.white,border:`1.5px solid ${p.isPrimary ? T.p200 : T.line}`,borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:44,height:44,borderRadius:12,background:p.isPrimary?T.p50:'#f8f8f8',border:`1.5px solid ${p.isPrimary?T.p100:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{intgIcon(p.name)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          <span style={{fontSize:15,fontWeight:700,color:T.ink}}>{p.name}</span>
                          {p.isPrimary && (
                            <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:'2px 9px',flexShrink:0}}>⭐ Primary</span>
                          )}
                        </div>
                        <div style={{fontSize:12,color:T.soft,marginTop:2}}>{intgDesc(p.name)}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        {!p.isPrimary && (
                          <button disabled={isBusy} onClick={()=>handleSetPrimary(p.id)}
                            style={{padding:'6px 14px',borderRadius:50,border:`1.5px solid ${T.p300}`,background:T.p50,color:T.p700,fontSize:12,fontWeight:700,cursor:isBusy?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:isBusy?0.6:1,whiteSpace:'nowrap'}}>
                            {settingPrimary===p.id?'Setting…':'Set as primary'}
                          </button>
                        )}
                        <DisconnectBtn busy={isBusy} onClick={isStripeProv ? handleStripeDisconnect : ()=>handleDisconnect(p.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── POS & Ordering ── */}
          <div>
            <SectionHeader
              title="POS & Ordering"
              desc="Orders are pushed to your kitchen display after payment. Square, Clover, and Zettle also sync your live menu automatically."
            />
            {connectedPOS.length === 0 ? (
              <EmptySection
                icon="🖥️"
                title="No POS connected"
                sub="Connect Square, Clover, Zettle, or SpotOn to push orders to your kitchen display after every call."
                onAdd={openModal}
              />
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:14}}>
                {connectedPOS.map(int => {
                  const isBusy = disconnecting === int.id;
                  const hasMenu = MENU_SYNC_NAMES.includes(int.name);
                  return (
                    <div key={int.id} style={{background:T.white,border:`1.5px solid ${T.greenBd}`,borderRadius:16,padding:20,display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:46,height:46,borderRadius:13,background:T.greenBg,border:`1.5px solid ${T.greenBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{intgIcon(int.name)}</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>{int.name}</div>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                            <span style={{fontSize:10,fontWeight:700,background:T.greenBg,color:T.green,borderRadius:4,padding:'1px 6px',border:`1px solid ${T.greenBd}`}}>KDS</span>
                            {hasMenu && <span style={{fontSize:10,fontWeight:700,background:'#EFF6FF',color:'#2563EB',borderRadius:4,padding:'1px 6px',border:'1px solid #BFDBFE'}}>Menu sync</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{fontSize:12.5,color:T.soft,lineHeight:1.55,flex:1}}>{intgDesc(int.name)}</div>
                      {int.lastSynced && (
                        <div style={{fontSize:11,color:T.faint}}>Connected {new Date(int.lastSynced).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
                      )}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:`1px solid ${T.paper}`}}>
                        <ConnectedBadge />
                        <DisconnectBtn busy={isBusy} onClick={()=>handleDisconnect(int.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Reservations ── */}
          <div>
            <SectionHeader
              title="Reservations"
              desc="Your agent checks availability and books tables on every call. Deposits are charged via your primary payment provider."
            />
            {connectedReservation.length === 0 ? (
              <EmptySection
                icon="📅"
                title="No reservation platform connected"
                sub="Connect resOS, ResDiary, OpenTable, or Collins to handle table bookings automatically on every call."
                onAdd={openModal}
              />
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:14}}>
                {connectedReservation.map(int => {
                  const isBusy = disconnecting === int.id;
                  return (
                    <div key={int.id} style={{background:T.white,border:`1.5px solid ${T.greenBd}`,borderRadius:16,padding:20,display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:46,height:46,borderRadius:13,background:T.greenBg,border:`1.5px solid ${T.greenBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{intgIcon(int.name)}</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>{int.name}</div>
                          <span style={{fontSize:10,fontWeight:700,background:'#F3F4F6',color:T.mid,borderRadius:4,padding:'1px 6px'}}>Reservations</span>
                        </div>
                      </div>
                      <div style={{fontSize:12.5,color:T.soft,lineHeight:1.55,flex:1}}>{intgDesc(int.name)}</div>
                      {int.lastSynced && (
                        <div style={{fontSize:11,color:T.faint}}>Connected {new Date(int.lastSynced).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
                      )}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:`1px solid ${T.paper}`}}>
                        <ConnectedBadge />
                        <DisconnectBtn busy={isBusy} onClick={()=>handleDisconnect(int.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

                  {/* Payments */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:4}}>Payments</div>
                  {[
                    { name:'Stripe', icon:'💳', desc:'Accept payments directly into your Stripe account', isOAuth:true, color:'#635BFF' },
                    ...OAUTH_POS_INTEGRATIONS.filter(i => ['SumUp'].includes(i.name)),
                  ].map(intg => {
                    const already = connectedNames.has(intg.name);
                    const isBusy = intg.name==='Stripe' ? stripeConnecting : oauthConnecting===intg.name;
                    return (
                      <div key={intg.name}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already?T.greenBd:T.line}`,background:already?T.greenBg:T.paper}}>
                        <div style={{width:38,height:38,borderRadius:9,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{intg.name}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {already
                          ? <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Connected</span>
                          : <button onClick={()=>{ intg.name==='Stripe' ? handleStripeConnect() : handleOAuthConnect(intg); }} disabled={isBusy}
                              style={{fontSize:11,fontWeight:700,color:'white',background:intg.color,border:'none',borderRadius:50,padding:'5px 12px',flexShrink:0,cursor:isBusy?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:isBusy?0.7:1}}>
                              {isBusy?'…':'Connect →'}
                            </button>}
                      </div>
                    );
                  })}

                  {/* POS & Ordering (one-tap) */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:10}}>POS & Ordering (One-tap)</div>
                  {OAUTH_POS_INTEGRATIONS.filter(i => !['SumUp'].includes(i.name)).map(intg => {
                    const already = connectedNames.has(intg.name);
                    const isBusy = oauthConnecting === intg.name;
                    const locked = !isProPlan && PRO_ONLY_NAMES.includes(intg.name) && !already;
                    return (
                      <div key={intg.name}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already?T.greenBd:T.line}`,background:already?T.greenBg:T.paper,opacity:locked?0.7:1}}>
                        <div style={{width:38,height:38,borderRadius:9,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{intg.name}{locked&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,background:T.amber,color:'white',borderRadius:4,padding:'1px 5px'}}>Pro</span>}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {already
                          ? <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Connected</span>
                          : locked
                            ? <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>🔒 Pro only</span>
                            : <button onClick={()=>handleOAuthConnect(intg)} disabled={isBusy}
                                style={{fontSize:11,fontWeight:700,color:'white',background:intg.color,border:'none',borderRadius:50,padding:'5px 12px',flexShrink:0,cursor:isBusy?'not-allowed':'pointer',fontFamily:"'Outfit',sans-serif",opacity:isBusy?0.7:1}}>
                                {isBusy?'…':'Connect →'}
                              </button>}
                      </div>
                    );
                  })}

                  {/* Other POS */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:10}}>Other POS</div>
                  {POS_INTEGRATIONS.map(intg => {
                    const already = connectedNames.has(intg.name);
                    return (
                      <div key={intg.name} onClick={()=>!already&&pickIntegration(intg)}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already?T.greenBd:T.line}`,background:already?T.greenBg:T.paper,cursor:already?'default':'pointer'}}
                        onMouseEnter={e=>{ if(!already){e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.background=T.p50;} }}
                        onMouseLeave={e=>{ if(!already){e.currentTarget.style.borderColor=T.line;e.currentTarget.style.background=T.paper;} }}>
                        <div style={{width:38,height:38,borderRadius:9,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{intg.icon}</div>
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

                  {/* Reservations */}
                  <div style={{fontSize:10,fontWeight:700,color:T.mid,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4,marginTop:12}}>Reservations</div>
                  {RESERVATION_INTEGRATIONS.map(intg => {
                    const already = connectedNames.has(intg.name);
                    const locked = !isProPlan && PRO_ONLY_NAMES.includes(intg.name) && !already;
                    return (
                      <div key={intg.name} onClick={()=>!already&&!locked&&pickIntegration(intg)}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`1.5px solid ${already?T.greenBd:T.line}`,background:already?T.greenBg:T.paper,cursor:(already||locked)?'default':'pointer',opacity:locked?0.7:1}}
                        onMouseEnter={e=>{ if(!already&&!locked){e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.background=T.p50;} }}
                        onMouseLeave={e=>{ if(!already&&!locked){e.currentTarget.style.borderColor=T.line;e.currentTarget.style.background=T.paper;} }}>
                        <div style={{width:38,height:38,borderRadius:9,background:already?T.greenBg:T.white,border:`1.5px solid ${already?T.greenBd:T.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.ink}}>{intg.name}{locked&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,background:T.amber,color:'white',borderRadius:4,padding:'1px 5px'}}>Pro</span>}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {already
                          ? <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>Connected</span>
                          : locked
                            ? <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:'3px 10px',flexShrink:0}}>🔒 Pro only</span>
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
                          style={{width:'100%',padding:'11px 14px',borderRadius:10,border:`1.5px solid ${T.line}`,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:'none',boxSizing:'border-box',background:T.paper,color:T.ink}}
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
