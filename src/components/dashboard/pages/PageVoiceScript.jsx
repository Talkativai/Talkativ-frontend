import { useState, useRef, useEffect } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import { VOICE_CATALOGUE } from '../../../utils/constants';
import { formatSchedule } from '../../../utils/format';
import { makeDefaultSchedule, buildHours, parseSchedule, VS_DAY_KEYS, VS_DAY_LABELS } from '../../../utils/schedule';
import TopBar from '../TopBar';
import { Conversation } from '@elevenlabs/client';

export default function PageVoiceScript({ user, agentName, bizName, agentData, bizData, onAgentNameChange }) {
  const autoGreet = (name, biz) => `Hi, thanks for calling us at ${biz}! I'm ${name}, your AI assistant. Would you like to place an order, check our hours, or something else?`;

  // ── Gender & voice ──────────────────────────────────────────────
  const [gender, setGender] = useState("female");
  const voices = VOICE_CATALOGUE[gender];
  const [voice, setVoice] = useState(0);

  // ── Identity ────────────────────────────────────────────────────
  const [localName, setLocalName] = useState(agentName || "Aria");
  const [greetingEdited, setGreetingEdited] = useState(false);
  const [greeting, setGreeting] = useState(autoGreet(agentName||"Agent", bizName||"your restaurant"));
  const [fallbackAction, setFallbackAction] = useState("transfer");
  const [transferNumber, setTransferNumber] = useState('');
  const [takeMessages, setTakeMessages] = useState(true);

  // ── Save flags ──────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [identityDirty, setIdentityDirty] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);

  // ── Hours editing ───────────────────────────────────────────────
  const [showBizHoursEdit,   setShowBizHoursEdit]   = useState(false);
  const [showAgentHoursEdit, setShowAgentHoursEdit] = useState(false);
  const [biz24h,   setBiz24h]   = useState(false);
  const [bizSched, setBizSched] = useState(makeDefaultSchedule());
  const [agent24h,   setAgent24h]   = useState(false);
  const [agentSched, setAgentSched] = useState(makeDefaultSchedule());
  const [savingBizHours,   setSavingBizHours]   = useState(false);
  const [savingAgentHours, setSavingAgentHours] = useState(false);

  // ── Test call ───────────────────────────────────────────────────
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
  const conversationRef = useRef(null);

  // ── Load from DB data ───────────────────────────────────────────
  useEffect(() => {
    if (agentData) {
      if (agentData.name) setLocalName(agentData.name);
      if (agentData.openingGreeting && !greetingEdited) setGreeting(agentData.openingGreeting);
      if (agentData.fallbackAction) setFallbackAction(agentData.fallbackAction);
      if (agentData.transferNumber) setTransferNumber(agentData.transferNumber);
      else if (bizData?.phone) setTransferNumber(bizData.phone);
      if (agentData.takeMessages !== undefined) setTakeMessages(agentData.takeMessages);
      const g = agentData.gender || "female";
      setGender(g);
      const cat = VOICE_CATALOGUE[g];
      const vIdx = cat.findIndex(v => v.id === agentData.voiceId);
      setVoice(vIdx >= 0 ? vIdx : 0);
      if (agentData.agentSchedule) {
        if (agentData.agentSchedule.is24h === "true") setAgent24h(true);
        else { setAgent24h(false); setAgentSched(parseSchedule(agentData.agentSchedule)); }
      }
    }
    if (bizData?.openingHours) {
      if (bizData.openingHours.is24h === "true") setBiz24h(true);
      else { setBiz24h(false); setBizSched(parseSchedule(bizData.openingHours)); }
    }
  }, [agentData, bizData]);

  const handleNameChange = (val) => {
    setLocalName(val);
    if (!greetingEdited) setGreeting(autoGreet(val, bizName||'your restaurant'));
    setIdentityDirty(true); setIdentitySaved(false);
  };
  const handleGreetingChange = (val) => {
    setGreetingEdited(true); setGreeting(val);
    setIdentityDirty(true); setIdentitySaved(false);
  };
  const handleGenderChange = (g) => { setGender(g); setVoice(0); };

  const syncAgent = () => { api.agent.rebuildPrompt().catch(() => {}); };

  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    try {
      await api.agent.update({ name: localName, openingGreeting: greeting });
      if (onAgentNameChange) onAgentNameChange(localName);
      setIdentityDirty(false); setIdentitySaved(true);
      setTimeout(() => setIdentitySaved(false), 2500);
      syncAgent();
    } catch {}
    setSavingIdentity(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.agent.update({
        name: localName, openingGreeting: greeting,
        gender, voiceId: voices[voice].id, voiceName: voices[voice].n, voiceDescription: voices[voice].d,
        fallbackAction, transferNumber: transferNumber||null, takeMessages,
      });
      if (onAgentNameChange) onAgentNameChange(localName);
      syncAgent();
    } catch {}
    setSaving(false);
  };

  const handleSaveBizHours = async () => {
    setSavingBizHours(true);
    try {
      await api.settings.updateBusiness({ openingHours: buildHours(biz24h, bizSched) });
      setShowBizHoursEdit(false);
      syncAgent();
    } catch {}
    setSavingBizHours(false);
  };

  const handleSaveAgentHours = async () => {
    setSavingAgentHours(true);
    try {
      await api.agent.update({ agentSchedule: buildHours(agent24h, agentSched) });
      setShowAgentHoursEdit(false);
      syncAgent();
    } catch {}
    setSavingAgentHours(false);
  };

  const startDemo = async () => {
    if (callStatus === 'connecting' || callStatus === 'active') return;
    setCallStatus('connecting');
    try {
      const { signedUrl } = await api.agent.getSignedUrl();
      const conv = await Conversation.startSession({
        signedUrl,
        onConnect: () => setCallStatus('active'),
        onDisconnect: () => { setCallStatus('ended'); conversationRef.current = null; },
        onError: (msg) => { console.error('ElevenLabs:', msg); setCallStatus('idle'); conversationRef.current = null; },
      });
      conversationRef.current = conv;
    } catch (e) {
      console.error('Test call failed:', e);
      setCallStatus('idle');
    }
  };

  const endDemo = async () => {
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch {}
      conversationRef.current = null;
    }
    setCallStatus('ended');
  };

  const bizHoursDisplay   = formatSchedule(bizData?.openingHours);
  const agentHoursDisplay = formatSchedule(agentData?.agentSchedule);
  const demoActive = callStatus === 'active' || callStatus === 'connecting';

  const DAY_ENTRIES = [["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"],["sun","Sun"]];

  const ScheduleGrid = ({ is24h, setIs24h, schedule, setSchedule }) => {
    const toggleDay  = (day) => setSchedule(p => ({ ...p, [day]: { ...p[day], open: !p[day].open } }));
    const updateTime = (day, field, val) => setSchedule(p => ({ ...p, [day]: { ...p[day], [field]: val } }));
    return (
      <div style={{ marginTop: 14 }}>
        <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, cursor:"pointer", userSelect:"none" }}
          onClick={() => setIs24h(v => !v)}>
          <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${is24h?T.p600:T.line}`, background:is24h?T.p600:T.white, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
            {is24h && <span style={{ color:"white", fontSize:11, fontWeight:800, lineHeight:1 }}>✓</span>}
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:T.ink }}>We operate 24/7</span>
        </label>
        {!is24h && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
            {DAY_ENTRIES.map(([key, label]) => {
              const day = schedule[key];
              return (
                <div key={key} style={{ background:T.white, border:`1.5px solid ${day.open?T.p400:T.line}`, borderRadius:10, padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"border-color .15s", minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:day.open?T.p700:T.ink }}>{label}</div>
                  <div onClick={() => toggleDay(key)} style={{ width:20, height:20, borderRadius:5, border:`2px solid ${day.open?T.p600:T.line}`, background:day.open?T.p600:T.white, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all .15s" }}>
                    {day.open && <span style={{ color:"white", fontSize:10, fontWeight:800, lineHeight:1 }}>✓</span>}
                  </div>
                  {day.open && (
                    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:4 }}>
                      <div>
                        <div style={{ fontSize:8, color:T.soft, marginBottom:2, textAlign:"center" }}>Open</div>
                        <input type="time" value={day.openTime} onChange={e => updateTime(key,"openTime",e.target.value)} style={{ width:"100%", border:`1.5px solid ${T.line}`, borderRadius:6, padding:"3px 2px", fontSize:10, fontFamily:"'Outfit',sans-serif", color:T.ink, outline:"none", textAlign:"center", boxSizing:"border-box" }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:8, color:T.soft, marginBottom:2, textAlign:"center" }}>Close</div>
                        <input type="time" value={day.closeTime} onChange={e => updateTime(key,"closeTime",e.target.value)} style={{ width:"100%", border:`1.5px solid ${T.line}`, borderRadius:6, padding:"3px 2px", fontSize:10, fontFamily:"'Outfit',sans-serif", color:T.ink, outline:"none", textAlign:"center", boxSizing:"border-box" }}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {is24h && (
          <div style={{ background:T.greenBg, border:`1px solid ${T.greenBd}`, borderRadius:10, padding:"12px 16px", fontSize:13, color:T.green, fontWeight:600 }}>
            Active around the clock, every day.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <TopBar title={<>Voice <strong>&</strong> Script</>} subtitle={`Customise how ${localName} sounds and what ${localName} says`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={handleSave}>{saving?"Saving…":"Save changes"}</button>
      </TopBar>

      <div className="resp-grid-dashboard-hub">
        <div>
          {/* Voice card */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div className="card-head" style={{margin:0}}>Choose a voice</div>
              <div style={{display:"flex",gap:4,background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:50,padding:3}}>
                {["female","male"].map(g=>(
                  <button key={g} onClick={()=>handleGenderChange(g)} style={{padding:"5px 14px",borderRadius:50,border:"none",background:gender===g?T.p600:"transparent",color:gender===g?"white":T.mid,fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
                    {g==="female"?"♀ Female":"♂ Male"}
                  </button>
                ))}
              </div>
            </div>
            <div className="resp-grid-2">
              {voices.map((v,i)=>(
                <div key={v.id} className={`voice-card ${voice===i?"selected":""}`} onClick={()=>setVoice(i)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontSize:12,color:T.soft}}>{v.d}</div>
                    <span className="badge badge-purple">{gender==="female"?"Female":"Male"}</span>
                  </div>
                  <div className="voice-play">▶</div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity & script */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div className="card-head" style={{margin:0}}>Agent identity & script</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {identitySaved && !identityDirty && <span style={{fontSize:12,color:T.green,fontWeight:600}}>✓ Updated</span>}
                {identityDirty && (
                  <button onClick={handleSaveIdentity} disabled={savingIdentity} style={{padding:"7px 16px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:12.5,fontWeight:700,cursor:savingIdentity?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingIdentity?0.7:1,transition:"all .2s"}}>
                    {savingIdentity?"Saving…":"Update agent identity"}
                  </button>
                )}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:6,letterSpacing:".3px",textTransform:"uppercase"}}>Agent name</label>
              <input value={localName} onChange={e=>handleNameChange(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${identityDirty?T.p400:T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:identityDirty?`0 0 0 3px ${T.p50}`:"0 1px 3px rgba(0,0,0,.04)",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <label style={{fontSize:12,fontWeight:700,color:T.mid,letterSpacing:".3px",textTransform:"uppercase"}}>Opening greeting</label>
                <span style={{fontSize:11,color:T.soft}}>💡 Keep under 20 seconds</span>
              </div>
              <textarea rows={4} value={greeting} onChange={e=>handleGreetingChange(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${identityDirty?T.p400:T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",resize:"none",lineHeight:1.6,transition:"border-color .2s, box-shadow .2s",boxShadow:identityDirty?`0 0 0 3px ${T.p50}`:"0 1px 3px rgba(0,0,0,.04)",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Hours & Availability */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Hours &amp; Availability</div>

            {/* Business hours */}
            <div style={{border:`1.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink}}>⏰ Business hours</div>
                  <div style={{fontSize:12,color:bizHoursDisplay?T.soft:T.amber,marginTop:2}}>{bizHoursDisplay||"Not set"}</div>
                </div>
                <button onClick={()=>setShowBizHoursEdit(p=>!p)} style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${T.line}`,background:T.paper,color:T.mid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {showBizHoursEdit?"Cancel":"Edit"}
                </button>
              </div>
              {showBizHoursEdit && (
                <>
                  <ScheduleGrid is24h={biz24h} setIs24h={setBiz24h} schedule={bizSched} setSchedule={setBizSched}/>
                  <button onClick={handleSaveBizHours} disabled={savingBizHours} style={{marginTop:14,width:"100%",padding:"10px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:13,fontWeight:700,cursor:savingBizHours?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingBizHours?0.7:1}}>
                    {savingBizHours?"Saving…":"Save business hours"}
                  </button>
                </>
              )}
            </div>

            {/* Agent hours */}
            <div style={{border:`1.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink}}>🤖 Agent hours</div>
                  <div style={{fontSize:12,color:agentHoursDisplay?T.soft:T.amber,marginTop:2}}>{agentHoursDisplay||"Not set"}</div>
                </div>
                <button onClick={()=>setShowAgentHoursEdit(p=>!p)} style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${T.line}`,background:T.paper,color:T.mid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {showAgentHoursEdit?"Cancel":"Edit"}
                </button>
              </div>
              {showAgentHoursEdit && (
                <>
                  <ScheduleGrid is24h={agent24h} setIs24h={setAgent24h} schedule={agentSched} setSchedule={setAgentSched}/>
                  <button onClick={handleSaveAgentHours} disabled={savingAgentHours} style={{marginTop:14,width:"100%",padding:"10px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:13,fontWeight:700,cursor:savingAgentHours?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingAgentHours?0.7:1}}>
                    {savingAgentHours?"Saving…":"Save agent hours"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Call handling */}
          <div className="card">
            <div className="card-head">Call handling rules</div>
            <p style={{fontSize:12,color:T.soft,margin:"-8px 0 16px 0"}}>When {localName} can't help…</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"stretch"}}>
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Fallback action</label>
                <select value={fallbackAction} onChange={e=>setFallbackAction(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}>
                  <option value="transfer">Transfer to number</option>
                  <option value="voicemail">Take a voicemail</option>
                  <option value="callback">Call back later</option>
                </select>
              </div>
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Transfer to number</label>
                <input value={transferNumber} onChange={e=>setTransferNumber(e.target.value)} placeholder="e.g. +44 161 234 5678" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
              </div>
            </div>
            <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
              <div>
                <h4 style={{margin:0,fontSize:13.5,fontWeight:600,color:T.ink}}>Offer to take a message</h4>
                <p style={{margin:"2px 0 0",fontSize:12,color:T.soft}}>Before transferring, {localName} will offer to take a message</p>
              </div>
              <label className="toggle"><input type="checkbox" checked={takeMessages} onChange={e=>setTakeMessages(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
            </div>
          </div>
        </div>

        {/* Right panel — test call */}
        <div>
          <div className="card" style={{position:"sticky",top:20,padding:0,overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${T.line}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:700,color:T.ink}}>Test call</span>
                {callStatus==='connecting' && (
                  <div style={{display:"flex",alignItems:"center",gap:5,background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#92400E"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"#F59E0B",animation:"pulse 1.2s infinite"}}/>CONNECTING…
                  </div>
                )}
                {callStatus==='active' && (
                  <div style={{display:"flex",alignItems:"center",gap:5,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700,color:T.green}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:T.green,animation:"pulse 1.2s infinite"}}/>LIVE
                  </div>
                )}
                {callStatus==='ended' && <span style={{fontSize:11,fontWeight:700,color:T.green}}>✓ Call ended</span>}
              </div>
            </div>

            {/* Agent identity strip */}
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:demoActive?`0 0 0 3px ${T.p100},0 0 0 6px ${T.p50}`:"none",transition:"box-shadow .3s"}}>🤖</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{localName}</div>
                <div style={{fontSize:12,color:T.soft}}>{voices[voice].d}</div>
              </div>
            </div>

            {/* Greeting bubble */}
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.line}`}}>
              <div style={{fontSize:10,fontWeight:700,color:T.p500,letterSpacing:".6px",marginBottom:6,textTransform:"uppercase"}}>{localName}</div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:T.ink2,lineHeight:1.6,fontStyle:"italic"}}>
                "{greeting}"
              </div>
            </div>

            {/* Waveform (active call) */}
            {demoActive && (
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div className="waveform">
                  {Array.from({length:18},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.06}s`}}/>)}
                </div>
              </div>
            )}

            {/* Knowledge base footer */}
            {!demoActive && (
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.line}`,fontSize:12,color:T.soft,lineHeight:1.5}}>
                💬 {localName} will use your <strong style={{color:T.mid}}>menu</strong>, <strong style={{color:T.mid}}>opening hours</strong>, <strong style={{color:T.mid}}>FAQ</strong> and <strong style={{color:T.mid}}>ordering rules</strong> as its knowledge base.
              </div>
            )}

            {/* Call button */}
            <div style={{padding:"16px 20px"}}>
              {!demoActive ? (
                <button onClick={startDemo} disabled={callStatus==='connecting'} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${T.p600},${T.p700})`,color:"white",fontSize:14,fontWeight:700,cursor:callStatus==='connecting'?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 16px rgba(112,53,245,.3)`,transition:"all .2s",opacity:callStatus==='connecting'?0.7:1}}>
                  <span style={{fontSize:18}}>📞</span> Start test call
                </button>
              ) : (
                <button onClick={endDemo} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:T.red,color:"white",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(239,68,68,.3)",transition:"all .2s"}}>
                  <span style={{fontSize:18}}>📵</span> End call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
