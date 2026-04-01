import { useState, useEffect } from "react";
import { T } from "../../../utils/tokens";
import TopBar from "../TopBar";
import { getCurrencySymbol } from "../../../utils/countries";

export default function PageOrders({ user, agentName, bizName, bizData }) {
  const currencySymbol = getCurrencySymbol(bizData?.currency);
  const [tab, setTab] = useState("Today");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const orders = [];
  const timeFiltered = tab==="Today"?orders.filter(o=>o.time.includes("pm")||o.time.includes("am")||o.time==="Now"):tab==="Yesterday"?orders.filter(o=>o.time==="Yesterday"):orders;
  const typeFilteredOrders = typeFilter==="All types"?timeFiltered:timeFiltered.filter(o=>o.type===typeFilter);
  const statusFilteredOrders = statusFilter==="All statuses"?typeFilteredOrders:statusFilter==="Completed"?typeFilteredOrders.filter(o=>o.status==="completed"):typeFilteredOrders.filter(o=>o.status==="live");
  const perPage = 5;
  const totalPages = Math.ceil(statusFilteredOrders.length / perPage);
  const paginated = statusFilteredOrders.slice((page-1)*perPage, page*perPage);
  const statusColor = { completed:"order", live:"purple" };
  return (
    <>
      <TopBar title={<>All <strong>Orders</strong></>} subtitle={`Orders taken by ${agentName || 'your agent'} across all calls`} user={user} agentName={agentName}>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Orders today",v:"0",d:"No orders yet"},{l:"Revenue today",v:`${currencySymbol}0`,d:"—"},{l:"Avg. order value",v:`${currencySymbol}0`,d:"—"},{l:"Delivery rate",v:"—",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Today","Yesterday","This week","This month"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setPage(1)}} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${tab===t?T.p500:T.line}`,background:tab===t?T.p50:"transparent",color:tab===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .18s"}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All types</option><option>Delivery</option><option>Collection</option>
            </select>
            <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All statuses</option><option>Completed</option><option>Live</option>
            </select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>🛍️</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No orders yet</div>
            <div style={{fontSize:13,color:T.soft}}>Orders taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((o,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.p600,fontFamily:"monospace"}}>{o.id}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{o.name}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:o.amount==="\u2014"?T.faint:T.ink}}>{o.amount}</div>
                </div>
                <div style={{fontSize:12,color:T.soft,marginBottom:10}}>{o.items}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",gap:8}}>
                    <span className="badge badge-purple">{o.type}</span>
                    <span className={`badge ${o.status==="live"?"badge-green":"badge-green"}`}>{o.status==="live"?"\u25cf Live":"\u2713 Done"}</span>
                  </div>
                  <span style={{fontSize:12,color:T.soft}}>{o.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns:"100px 1fr 200px 110px 100px 110px",gap:14,padding:"8px 0 12px",borderBottom:`1.5px solid ${T.line}`}}>
              {["Order ID","Customer","Items","Type","Status","Total"].map(h=>(
                <div key={h} style={{fontSize:10.5,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px"}}>{h}</div>
              ))}
            </div>
            {paginated.map((o,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"100px 1fr 200px 110px 100px 110px",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.paper}`,alignItems:"center",cursor:"pointer",transition:"background .15s",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{fontSize:12,fontWeight:700,color:T.p600,fontFamily:"monospace"}}>{o.id}</div>
                <div><div className="call-name">{o.name}</div><div className="call-detail">{o.time}</div></div>
                <div style={{fontSize:12.5,color:T.soft}}>{o.items}</div>
                <div><span className="badge badge-purple">{o.type}</span></div>
                <div><span className={`badge ${o.status==="live"?"badge-green":"badge-green"}`}>{o.status==="live"?"\u25cf Live":"\u2713 Done"}</span></div>
                <div style={{fontSize:14,fontWeight:700,color:o.amount==="\u2014"?T.faint:T.ink}}>{o.amount}</div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, statusFilteredOrders.length)} of {statusFilteredOrders.length} orders</div>
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
