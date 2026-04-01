import { useState } from 'react';
import T from '../../../utils/tokens';
import TopBar from '../TopBar';

export default function PageBilling({ user, agentName }) {
  const invoices = [
    {date:"1 Mar 2026",desc:"Growth plan · March 2026",amount:"£399.00",status:"paid"},
    {date:"1 Feb 2026",desc:"Growth plan · February 2026",amount:"£399.00",status:"paid"},
    {date:"1 Jan 2026",desc:"Growth plan · January 2026",amount:"£399.00",status:"paid"},
    {date:"1 Dec 2025",desc:"Growth plan · December 2025",amount:"£399.00",status:"paid"},
    {date:"1 Nov 2025",desc:"Starter plan · November 2025",amount:"£199.00",status:"paid"},
  ];
  return (
    <>
      <TopBar title={<>Billing</>} subtitle="Manage your subscription and payment details" user={user} agentName={agentName}/>

      <div className="resp-grid-2">
        <div className="card" style={{background:`linear-gradient(135deg,${T.ink},${T.ink2})`,border:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Current plan</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"white",marginBottom:4}}>Growth</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24}}>£399/month · Renews 1 April 2026</div>
          <div style={{display:"flex",gap:8}}>
            <button style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Change plan</button>
            <button style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
          </div>
        </div>
        <div className="card">
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Usage this month</div>
          {[["Calls handled","1,247","Unlimited"],["Orders taken","486","Unlimited"],["Reservations booked","87","Unlimited"]].map(([l,v,limit])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.paper}`}}>
              <span style={{fontSize:13.5,color:T.mid}}>{l}</span>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>{v}</span>
                <span style={{fontSize:11.5,color:T.soft,marginLeft:6}}>{limit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:16}}>Invoice history</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
            {invoices.map((inv,i)=>(
              <div key={i} style={{background:T.white,border:`1px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 8px 24px rgba(112,53,245,.08)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:20,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center"}}>🧾</div>
                  <span className="badge badge-green" style={{padding:"4px 8px"}}>Paid</span>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:4}}>{inv.desc}</div>
                <div style={{fontSize:12,color:T.soft,marginBottom:16}}>{inv.date}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                  <div style={{fontSize:16,fontWeight:700,color:T.ink}}>{inv.amount}</div>
                  <button style={{fontSize:12,padding:"6px 14px",background:"#fff",border:`1.5px solid ${T.line}`,color:T.ink,borderRadius:6,fontWeight:600,cursor:"pointer"}}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{height:"fit-content",position:"sticky",top:20}}>
          <div className="card-head">Payment method</div>
          <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"16px 18px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:22}}>💳</span>
              <span className="badge badge-green">Default</span>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:1.5,marginBottom:6}}>•••• •••• •••• 4242</div>
            <div style={{fontSize:12,color:T.soft}}>Expires 12/27 · Visa</div>
          </div>
          <button style={{width:"100%",background:`linear-gradient(135deg, ${T.ink}, ${T.ink2})`,border:"none",color:"white",fontWeight:600,fontSize:14,padding:"12px 0",borderRadius:10,cursor:"pointer",marginBottom:12,boxShadow:`0 4px 12px rgba(0,0,0,0.15)`}}>Update payment method</button>
          <p style={{fontSize:12,color:T.soft,textAlign:"center",margin:0}}>🔒 Secured by Stripe</p>
        </div>
      </div>
    </>
  );
}
