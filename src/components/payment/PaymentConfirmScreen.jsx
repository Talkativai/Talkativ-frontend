import { T } from "../../utils/tokens";

export default function PaymentConfirmScreen({ onBack }) {
  return (
    <div style={{minHeight:"100vh",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      {/* Background decoration */}
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 1px 1px, ${T.p200} 1px, transparent 0)`,backgroundSize:"28px 28px",opacity:.2,pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480,animation:"fadeUp .6s ease both"}}>
        {/* Success Icon */}
        <div style={{width:100,height:100,borderRadius:"50%",background:`linear-gradient(135deg,${T.green},#16a34a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,margin:"0 auto 28px",boxShadow:`0 12px 40px rgba(34,197,94,.3)`,animation:"countUp .6s cubic-bezier(.34,1.56,.64,1) both"}}>✓</div>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:900,color:T.ink,marginBottom:10,letterSpacing:"-1px"}}>Payment confirmed!</h1>
        <p style={{fontSize:16,color:T.mid,fontWeight:300,lineHeight:1.65,marginBottom:36}}>Your payment has been processed successfully. A confirmation has been sent to your phone and email.</p>

        {/* Confirmation Details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:36}}>
          {[["🧾","ORD-2847","Order ID"],["💳","£29.45","Amount paid"],["🕐","25-30 min","Est. delivery"]].map(([ic,v,l])=>(
            <div key={l} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:"20px 16px",boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
              <div style={{fontSize:24,marginBottom:10}}>{ic}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.p600,marginBottom:4}}>{v}</div>
              <div style={{fontSize:11,color:T.soft,textTransform:"uppercase",letterSpacing:".6px",fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:24,textAlign:"left",marginBottom:32,boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>What you ordered</div>
          {["Large Pepperoni Pizza ×1","Garlic Bread ×2","Coke 330ml ×2"].map(i=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.paper}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.green,flexShrink:0}}/>
              <span style={{fontSize:14,color:T.ink,fontWeight:500}}>{i}</span>
            </div>
          ))}
          <div style={{marginTop:14,padding:"12px 14px",background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:10,fontSize:13,color:"#166534",fontWeight:600}}>
            📍 Delivering to: 42 Oxford Road, Manchester M1 5QA
          </div>
        </div>

        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={onBack} className="btn-hero" style={{fontSize:14,padding:"14px 28px"}}>Back to home →</button>
        </div>
        <p style={{fontSize:12,color:T.faint,marginTop:20}}>Confirmation sent to +44 7811 234 567 · tony@email.com</p>
      </div>
    </div>
  );
}
