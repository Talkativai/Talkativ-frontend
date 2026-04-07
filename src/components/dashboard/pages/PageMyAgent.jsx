import { useState, useEffect } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import { formatSchedule } from '../../../utils/format';
import TopBar from '../TopBar';

export default function PageMyAgent({ user, agentName, bizName, agentData, bizData, menuSynced, onNav }) {
  const displayAgent = agentName || "Agent";
  const displayBiz = bizName || "your restaurant";
  const greeting = agentData?.openingGreeting || `Hi, thanks for calling us at ${displayBiz}! I'm ${displayAgent}, your AI assistant. Would you like to place an order, check our hours, or something else?`;
  const voiceDisplay = agentData ? `${displayAgent} · ${agentData.voiceDescription}` : `${displayAgent} · Warm`;
  const menuDisplay = menuSynced ? "Synced" : "Not synced";

  const bizHoursDisplay  = formatSchedule(bizData?.openingHours);
  const agentHoursDisplay = formatSchedule(agentData?.agentSchedule);

  const [tab, setTab] = useState("Overview");
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [takeReservations, setTakeReservations] = useState(true);
  const [answerAfterHours, setAnswerAfterHours] = useState(false);
  useEffect(() => {
    if (agentData) {
      setAcceptOrders(agentData.acceptOrders ?? true);
      setTakeReservations(agentData.takeReservations ?? true);
      setAnswerAfterHours(agentData.answerAfterHours ?? false);
    }
  }, [agentData]);

  const updateSetting = async (field, val) => {
    try { await api.agent.update({ [field]: val }); } catch {}
  };

  return (
    <>
      <TopBar title={<>My <strong>Agent</strong></>} subtitle={`Configure and monitor ${displayAgent}, your AI phone agent`} user={user} agentName={agentName} />

      <div className="resp-grid-3">
        {[{ic:"📞",l:"Calls answered today",v:"0",d:"No calls yet"},{ic:"⏱️",l:"Avg. handle time",v:"0:00",d:"—"},{ic:"✅",l:"Successful outcomes",v:"0%",d:"—"}].map(k=>(
          <div className="kpi-card" key={k.l} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{k.ic}</div>
            <div>
              <div className="kpi-label" style={{marginBottom:4}}>{k.l}</div>
              <div className="kpi-value" style={{fontSize:26}}>{k.v}</div>
              <div className="kpi-delta" style={{marginTop:2}}>{k.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",gap:6,marginBottom:22}}>
              {["Overview","Performance","Transcripts"].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${tab===t?T.p500:T.line}`,background:tab===t?T.p50:"transparent",color:tab===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{t}</button>
              ))}
            </div>

            {tab==="Overview" && (
              <>
                <div className="agent-card">
                  <div className="agent-avatar">🤖</div>
                  <div>
                    <div className="agent-name" style={{fontSize:16}}>{displayAgent}</div>
                    <div className="agent-status"><div className="agent-status-dot"/>Ready · waiting for first call</div>
                  </div>
                  <button className="agent-edit-btn" onClick={() => onNav && onNav("Voice & Script")}>Edit agent</button>
                </div>

                {/* 5-item stats grid */}
                <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    ["🎙️","Voice",      voiceDisplay],
                    ["🌍","Language",   "English"],
                    ["🔀","Call rules", agentData?.transferEnabled !== false ? "Transfer" : "End call"],
                    ["🔌","POS",        "Not connected"],
                    ["📋","Menu",       menuDisplay],
                  ].map(([ic,l,v])=>(
                    <div key={l} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>{ic} {l}</div>
                      <div style={{fontSize:13.5,fontWeight:600,color:menuDisplay==="Not synced"&&l==="Menu"?T.amber:T.ink}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Hours — 2-column section */}
                <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    ["⏰","Business hours", bizHoursDisplay],
                    ["⏰","Agent hours",    agentHoursDisplay],
                  ].map(([ic,l,v])=>(
                    <div key={l} style={{background:T.paper,border:`1.5px solid ${v ? T.line : "#FEF3C7"}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>{ic} {l}</div>
                      <div style={{fontSize:13.5,fontWeight:600,color:v ? T.ink : T.amber}}>{v || "Not set"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab==="Performance" && (
              <div>
                <div style={{textAlign:"center",padding:"32px 20px"}}>
                  <div style={{fontSize:30,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:6}}>No performance data yet</div>
                  <div style={{fontSize:13,color:T.soft}}>Stats will appear here once {displayAgent} starts taking calls</div>
                </div>
                {[["Answer rate","0%",0],["Orders completed","0%",0],["Customer satisfaction","—",0],["Avg. call resolution","0%",0]].map(([l,v,pct])=>(
                  <div key={l} style={{marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13.5,fontWeight:600,color:T.ink}}>{l}</span>
                      <span style={{fontSize:13.5,fontWeight:700,color:T.faint}}>{v}</span>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
                  </div>
                ))}
              </div>
            )}

            {tab==="Transcripts" && (
              <div style={{textAlign:"center",padding:"48px 20px"}}>
                <div style={{fontSize:36,marginBottom:12}}>🎙️</div>
                <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No transcripts yet</div>
                <div style={{fontSize:13,color:T.soft}}>Call transcripts will appear here once {displayAgent} handles a call</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Live preview</div>
            <div style={{background:T.paper,borderRadius:14,padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
                <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{displayAgent}</div><div style={{fontSize:11,color:T.soft}}>AI agent preview</div></div>
                <div className="live-badge" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 9px",fontSize:10,fontWeight:700,color:T.green}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>LIVE</div>
              </div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:12,padding:"10px 13px",fontSize:12.5,color:T.ink2,lineHeight:1.55}}>
                <span style={{fontSize:10,fontWeight:700,display:"block",marginBottom:4,color:T.p500}}>{displayAgent.toUpperCase()}</span>
                "{greeting}"
              </div>
              <div className="waveform" style={{justifyContent:"center",marginTop:8}}>
                {Array.from({length:14},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.07}s`}}/>)}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">Quick settings</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:14}}>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Accept orders</h4>
                  <label className="toggle"><input type="checkbox" checked={acceptOrders} onChange={e=>{setAcceptOrders(e.target.checked);updateSetting('acceptOrders',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{acceptOrders?`Allow ${displayAgent} to take phone orders`:`${displayAgent} will not take orders right now`}</p>
              </div>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Take reservations</h4>
                  <label className="toggle"><input type="checkbox" checked={takeReservations} onChange={e=>{setTakeReservations(e.target.checked);updateSetting('takeReservations',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{takeReservations?"Allow booking via phone":`${displayAgent} will decline booking requests`}</p>
              </div>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Answer after hours</h4>
                  <label className="toggle"><input type="checkbox" checked={answerAfterHours} onChange={e=>{setAnswerAfterHours(e.target.checked);updateSetting('answerAfterHours',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>Handle calls outside business hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
