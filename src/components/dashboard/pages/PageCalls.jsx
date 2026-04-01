import { useState, useEffect } from "react";
import { T } from "../../../utils/tokens";
import TopBar from "../TopBar";

export default function PageCalls({ user, agentName, bizName }) {
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const calls = [];
  const tabs = ["All","Orders","Enquiries","Missed"];
  const timeFiltered = timeFilter==="Today"?calls.filter(c=>c.time.includes("Today")||c.time==="Live now"):timeFilter==="Yesterday"?calls.filter(c=>c.time.includes("Yesterday")):calls;
  const filtered = filter==="All"?timeFiltered:filter==="Orders"?timeFiltered.filter(c=>c.b==="order"):filter==="Missed"?timeFiltered.filter(c=>c.b==="missed"):timeFiltered.filter(c=>c.b==="info");
  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>All <strong>Calls</strong></>} subtitle="Every call routed through Talkativ with full transcripts" user={user} agentName={agentName}>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export CSV</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Total today",v:"0",d:"No calls yet"},{l:"Answered",v:"0",d:"—"},{l:"Avg. duration",v:"0:00",d:"—"},{l:"Orders taken",v:"0",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>{setFilter(t);setPage(1)}} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${filter===t?T.p500:T.line}`,background:filter===t?T.p50:"transparent",color:filter===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .18s"}}>
                {t}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <select value={timeFilter} onChange={e=>{setTimeFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>Today</option><option>Yesterday</option><option>This week</option><option>This month</option>
            </select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>📞</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No calls yet</div>
            <div style={{fontSize:13,color:T.soft}}>Calls handled by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          /* Mobile card layout */
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((c,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div className={`call-dot ${c.s==="live"?"live":c.s==="done"?"done":"miss"}`}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{c.n}</div>
                      <div style={{fontSize:12,color:T.soft,marginTop:2}}>{c.phone}</div>
                    </div>
                  </div>
                  <span className={`call-badge ${c.b==="order"?"order":c.b==="info"?"info":"missed"}`}>{c.outcome}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",gap:14}}>
                    <span style={{fontSize:12,color:T.soft}}>{c.time}</span>
                    <span style={{fontSize:12,color:T.soft}}>{c.dur}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:c.amount?T.ink:T.faint}}>{c.amount||"\u2014"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop table layout */
          <>
            <div className="calls-table-header" style={{display:"grid",gridTemplateColumns:"8px 1fr 160px 120px 80px 130px 120px",gap:14,padding:"8px 0 12px",borderBottom:`1.5px solid ${T.line}`,marginBottom:4}}>
              {["","Caller","Phone","Time","Duration","Outcome","Amount"].map(h=>(
                <div key={h} style={{fontSize:10.5,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px"}}>{h}</div>
              ))}
            </div>
            {paginated.map((c,i)=>(
              <div key={i} className="calls-table-row" style={{display:"grid",gridTemplateColumns:"8px 1fr 160px 120px 80px 130px 120px",gap:14,padding:"11px 0",borderBottom:`1px solid ${T.paper}`,alignItems:"center",cursor:"pointer",transition:"background .15s",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div className={`call-dot ${c.s==="live"?"live":c.s==="done"?"done":"miss"}`}/>
                <div><div className="call-name">{c.n}</div></div>
                <div style={{fontSize:13,color:T.soft}}>{c.phone}</div>
                <div style={{fontSize:13,color:T.soft}}>{c.time}</div>
                <div style={{fontSize:13,color:T.soft}}>{c.dur}</div>
                <span className={`call-badge ${c.b==="order"?"order":c.b==="info"?"info":"missed"}`}>{c.outcome}</span>
                <div style={{fontSize:13,fontWeight:600,color:c.amount?T.ink:T.faint}}>{c.amount||"\u2014"}</div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} calls</div>
            <div style={{display:"flex",gap:8}}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===1?"transparent":T.white,color:page===1?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===1?"default":"pointer",transition:"all .18s"}}>Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===totalPages?"transparent":T.white,color:page===totalPages?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===totalPages?"default":"pointer",transition:"all .18s"}}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
