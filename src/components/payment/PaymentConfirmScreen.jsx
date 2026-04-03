import { T } from "../../utils/tokens";

export default function PaymentConfirmScreen({ onBack, data, type }) {
  const isOrder = type === 'order';
  const isReservation = type === 'reservation';
  const businessName = data?.business?.name || 'the restaurant';
  const amount = isOrder
    ? Number(data?.amount || 0).toFixed(2)
    : Number(data?.depositAmount || 0).toFixed(2);
  const shortId = (data?.id || '').slice(0, 8).toUpperCase();
  const createdAt = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';

  return (
    <div style={{minHeight:"100vh",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 1px 1px, ${T.p200} 1px, transparent 0)`,backgroundSize:"28px 28px",opacity:.2,pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480}}>
        {/* Success icon */}
        <div style={{width:100,height:100,borderRadius:"50%",background:`linear-gradient(135deg,${T.green},#16a34a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,margin:"0 auto 28px",boxShadow:`0 12px 40px rgba(34,197,94,.3)`}}>✓</div>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:900,color:T.ink,marginBottom:10}}>
          {isReservation ? 'Reservation confirmed!' : 'Payment confirmed!'}
        </h1>
        <p style={{fontSize:15,color:T.mid,fontWeight:300,lineHeight:1.65,marginBottom:32}}>
          {isReservation
            ? `Your deposit has been received. Your table at ${businessName} is confirmed.`
            : `Your payment was processed successfully. ${businessName} has been notified.`}
        </p>

        {/* Confirmation stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28}}>
          {isOrder && [
            ["🧾", shortId ? `ORD-${shortId}` : '—', "Order ID"],
            ["💳", `£${amount}`, "Amount paid"],
            ["📅", createdAt || '—', "Date"],
          ].map(([ic, v, l]) => (
            <div key={l} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:"18px 12px",boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
              <div style={{fontSize:22,marginBottom:8}}>{ic}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:900,color:T.p600,marginBottom:4,wordBreak:"break-all"}}>{v}</div>
              <div style={{fontSize:11,color:T.soft,textTransform:"uppercase",letterSpacing:".6px",fontWeight:600}}>{l}</div>
            </div>
          ))}

          {isReservation && [
            ["🧾", shortId ? `RES-${shortId}` : '—', "Reservation ID"],
            ["💳", `£${amount}`, "Deposit paid"],
            ["👥", data?.guests ? `${data.guests} guest${data.guests > 1 ? 's' : ''}` : '—', "Party size"],
          ].map(([ic, v, l]) => (
            <div key={l} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:"18px 12px",boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
              <div style={{fontSize:22,marginBottom:8}}>{ic}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:900,color:T.p600,marginBottom:4}}>{v}</div>
              <div style={{fontSize:11,color:T.soft,textTransform:"uppercase",letterSpacing:".6px",fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Details card */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:24,textAlign:"left",marginBottom:28,boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>

          {isOrder && data && (
            <>
              <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>What you ordered</div>
              {data.items?.split(',').map((item, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.paper}`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:T.green,flexShrink:0}}/>
                  <span style={{fontSize:14,color:T.ink,fontWeight:500}}>{item.trim()}</span>
                </div>
              ))}
              {data.type === 'DELIVERY' && data.deliveryAddress && (
                <div style={{marginTop:14,padding:"12px 14px",background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:10,fontSize:13,color:"#166534",fontWeight:600}}>
                  📍 Delivering to: {data.deliveryAddress}
                </div>
              )}
              {data.type === 'COLLECTION' && (
                <div style={{marginTop:14,padding:"12px 14px",background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,fontSize:13,color:T.p700,fontWeight:600}}>
                  🏃 Collection order — please collect from {businessName}
                </div>
              )}
            </>
          )}

          {isReservation && data && (
            <>
              <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>Booking details</div>
              {[
                ["Guest", data.guestName],
                ["Date & time", data.dateTime ? new Date(data.dateTime).toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'],
                ["Party size", `${data.guests} guest${data.guests > 1 ? 's' : ''}`],
                ["Venue", businessName],
              ].map(([label, value]) => (
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.paper}`}}>
                  <span style={{fontSize:13,color:T.soft}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{value}</span>
                </div>
              ))}
              <div style={{marginTop:14,padding:"12px 14px",background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:10,fontSize:13,color:"#166534",fontWeight:600}}>
                ✓ Your table is confirmed. See you soon!
              </div>
            </>
          )}
        </div>

        <button onClick={onBack} style={{background:T.ink,color:"white",border:"none",borderRadius:50,padding:"14px 32px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          Back to home →
        </button>

        {(data?.customerEmail || data?.guestEmail) && (
          <p style={{fontSize:12,color:T.faint,marginTop:20}}>
            Confirmation sent to {data.customerEmail || data.guestEmail}
          </p>
        )}
      </div>
    </div>
  );
}
