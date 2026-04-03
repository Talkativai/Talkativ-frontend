import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import PaymentConfirmScreen from "./PaymentConfirmScreen";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PaymentLinkScreen({ onBack }) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Read params from URL — hash routing puts params after the # (e.g. /#/pay?pi=...)
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(queryString);
  const pi = params.get('pi');
  const orderId = params.get('order_id');
  const reservationId = params.get('reservation_id');
  const type = params.get('type'); // 'order' or 'reservation'

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (type === 'order' && orderId) {
          const res = await fetch(`${API_URL}/api/public/order/${orderId}`);
          if (res.ok) setData(await res.json());
        } else if (type === 'reservation' && reservationId) {
          const res = await fetch(`${API_URL}/api/public/reservation/${reservationId}`);
          if (res.ok) setData(await res.json());
        }
      } catch (e) {
        setError('Could not load payment details');
      }
      setLoading(false);
    };
    fetchDetails();
  }, []);

  const handlePay = async () => {
    setProcessing(true);
    // In production: use Stripe.js to confirm payment with pi
    // For now simulate success
    setTimeout(() => { setPaid(true); setProcessing(false); }, 1500);
  };

  if (paid) return <PaymentConfirmScreen onBack={onBack} data={data} type={type} />;

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.paper}}>
      <div style={{fontSize:14,color:T.soft}}>Loading payment details…</div>
    </div>
  );

  const businessName = data?.business?.name || 'the restaurant';
  const isOrder = type === 'order';
  const isReservation = type === 'reservation';
  const amount = isOrder
    ? Number(data?.amount || 0).toFixed(2)
    : Number(data?.depositAmount || 0).toFixed(2);

  return (
    <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:480}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontStyle:"italic",fontSize:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}>t</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.ink}}>talkativ</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:T.ink,marginBottom:8}}>
            {isOrder ? 'Complete your order' : 'Confirm your reservation'}
          </h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>
            {isOrder ? `Secure payment for your order at ${businessName}` : `Deposit payment for your reservation at ${businessName}`}
          </p>
        </div>

        {/* Summary Card */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,marginBottom:20,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>
            {isOrder ? 'Order summary' : 'Reservation summary'}
          </div>

          {isOrder && data && (
            <>
              <div style={{borderBottom:`1px solid ${T.paper}`,paddingBottom:14,marginBottom:14}}>
                {data.items?.split(',').map((item, i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
                    <span style={{fontSize:14,color:T.ink}}>{item.trim()}</span>
                  </div>
                ))}
              </div>
              {data.type === 'DELIVERY' && (
                <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
                  <span style={{fontSize:13,color:T.soft}}>Delivery fee</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.ink}}>included</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:`1.5px solid ${T.line}`,marginTop:8}}>
                <span style={{fontSize:16,fontWeight:700,color:T.ink}}>Total</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:T.p600}}>£{amount}</span>
              </div>
              {data.type === 'DELIVERY' && data.deliveryAddress && (
                <div style={{fontSize:12,color:T.soft,marginTop:8}}>📍 Delivering to: {data.deliveryAddress}</div>
              )}
            </>
          )}

          {isReservation && data && (
            <>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,color:T.soft}}>Guest name</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{data.guestName}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,color:T.soft}}>Party size</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{data.guests} guest{data.guests > 1 ? 's' : ''}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,color:T.soft}}>Date & time</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.ink}}>
                    {new Date(data.dateTime).toLocaleDateString('en-GB', {weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                  </span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1.5px solid ${T.line}`,paddingTop:12,marginTop:4}}>
                  <span style={{fontSize:16,fontWeight:700,color:T.ink}}>Deposit</span>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:T.p600}}>£{amount}</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{fontSize:13,color:T.red,textAlign:"center",padding:"20px 0"}}>{error}</div>
          )}
        </div>

        {/* Payment Form */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>Payment details</div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Card number</label>
            <input placeholder="4242 4242 4242 4242" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",letterSpacing:1,boxSizing:"border-box"}}/>
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
          <button
            onClick={handlePay}
            disabled={processing}
            style={{width:"100%",padding:"16px",background:processing?T.soft:T.ink,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:processing?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .22s"}}>
            {processing ? "Processing…" : `Pay £${amount} →`}
          </button>
          <div style={{textAlign:"center",marginTop:14}}>
            <span style={{fontSize:12,color:T.soft}}>🔒 Secured by Stripe · 256-bit SSL encryption</span>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:28}}>
          <span style={{fontSize:12,color:T.faint}}>Payment link generated by Talkativ AI for {businessName}</span>
        </div>
      </div>
    </div>
  );
}
