import { useState, useEffect } from "react";
import { T } from "../../../utils/tokens";
import TopBar from "../TopBar";

export default function PageReservations({ user, agentName, bizName }) {
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const reservations = [];
  const perPage = 5;
  const totalPages = Math.ceil(reservations.length / perPage);
  const paginated = reservations.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>Reservations</>} subtitle={`Bookings taken by ${agentName || 'your agent'} via phone`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>+ Add booking</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Today's covers",v:"0",d:"No bookings yet"},{l:"This week",v:"0",d:"—"},{l:"Avg. party size",v:"—",d:"—"},{l:"No-show rate",v:"—",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div className="card-head" style={{marginBottom:0}}>Upcoming bookings</div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>📅</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No reservations yet</div>
            <div style={{fontSize:13,color:T.soft}}>Bookings taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((r,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:40,height:40,borderRadius:12,background:r.status==="confirmed"?T.p50:T.amberBg,border:`1.5px solid ${r.status==="confirmed"?T.p100:T.amberBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👥</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{r.name}</div>
                      <div style={{fontSize:12,color:T.soft,marginTop:2}}>{r.guests} guests</div>
                    </div>
                  </div>
                  <span className={`badge ${r.status==="confirmed"?"badge-green":"badge-amber"}`}>{r.status==="confirmed"?"\u2713 Confirmed":"\u25cf Pending"}</span>
                </div>
                <div style={{fontSize:12,color:T.soft,marginBottom:8}}>{r.phone} \u00b7 {r.note||"No special requests"}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.date}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-secondary" style={{fontSize:12,padding:"6px 12px"}}>Edit</button>
                    <button className="btn-danger" style={{fontSize:12,padding:"6px 12px"}}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {paginated.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:`1px solid ${T.paper}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:48,height:48,borderRadius:14,background:r.status==="confirmed"?T.p50:T.amberBg,border:`1.5px solid ${r.status==="confirmed"?T.p100:T.amberBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👥</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{r.name}</div>
                  <div style={{fontSize:12,color:T.soft,marginTop:2}}>{r.phone} \u00b7 {r.note||"No special requests"}</div>
                </div>
                <div style={{textAlign:"center",minWidth:80}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.guests} guests</div>
                  <div style={{fontSize:11,color:T.soft,marginTop:2}}>party size</div>
                </div>
                <div style={{textAlign:"center",minWidth:140}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.date}</div>
                </div>
                <div><span className={`badge ${r.status==="confirmed"?"badge-green":"badge-amber"}`}>{r.status==="confirmed"?"\u2713 Confirmed":"\u25cf Pending"}</span></div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn-secondary" style={{fontSize:12,padding:"6px 12px"}}>Edit</button>
                  <button className="btn-danger" style={{fontSize:12,padding:"6px 12px"}}>Cancel</button>
                </div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, reservations.length)} of {reservations.length} reservations</div>
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
