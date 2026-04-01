import { useState } from "react";
import { T } from "../../utils/tokens";
import PaymentConfirmScreen from "./PaymentConfirmScreen";

export default function PaymentLinkScreen({ onBack }) {
  const [paid, setPaid] = useState(false);
  if (paid) return <PaymentConfirmScreen onBack={onBack} />;
  return (
    <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:480,animation:"fadeUp .6s ease both"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontStyle:"italic",fontSize:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}>t</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.ink}}>talkativ</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-.5px"}}>Complete your payment</h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>Secure payment for your order at Tony's Pizzeria</p>
        </div>

        {/* Order Summary Card */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,marginBottom:20,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>Order summary</div>
          <div style={{borderBottom:`1px solid ${T.paper}`,paddingBottom:14,marginBottom:14}}>
            {[{n:"Large Pepperoni Pizza",q:1,p:"£14.99"},{n:"Garlic Bread",q:2,p:"£7.98"},{n:"Coke 330ml",q:2,p:"£3.98"}].map(i=>(
              <div key={i.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
                <div>
                  <span style={{fontSize:14,fontWeight:600,color:T.ink}}>{i.n}</span>
                  <span style={{fontSize:12,color:T.soft,marginLeft:8}}>×{i.q}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:T.ink}}>{i.p}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}>
            <span style={{fontSize:13,color:T.soft}}>Delivery fee</span>
            <span style={{fontSize:13,fontWeight:600,color:T.ink}}>£2.50</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:`1.5px solid ${T.line}`,marginTop:10}}>
            <span style={{fontSize:16,fontWeight:700,color:T.ink}}>Total</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:T.p600}}>£29.45</span>
          </div>
        </div>

        {/* Payment Form */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>Payment details</div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Card number</label>
            <input placeholder="4242 4242 4242 4242" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",letterSpacing:1}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Expiry date</label>
              <input placeholder="MM / YY" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>CVC</label>
              <input placeholder="123" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Name on card</label>
            <input placeholder="John Smith" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
          </div>
          <button onClick={()=>setPaid(true)} style={{width:"100%",padding:"16px",background:T.ink,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s"}}>Pay £29.45 →</button>
          <div style={{textAlign:"center",marginTop:14}}>
            <span style={{fontSize:12,color:T.soft}}>🔒 Secured by Stripe · 256-bit SSL encryption</span>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:28}}>
          <span style={{fontSize:12,color:T.faint}}>Payment link generated by Talkativ AI for Tony's Pizzeria</span>
        </div>
      </div>
    </div>
  );
}
