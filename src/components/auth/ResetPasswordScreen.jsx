import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api.js";

const T = {
  ivory: "#FDFCFA", white: "#FFFFFF", paper: "#F8F6FF", mist: "#F2EEFF",
  frost: "#EAE4FF", lavBlue: "#E0D9FF",
  p50: "#F5F2FF", p100: "#ECE5FF", p200: "#D9CEFF", p300: "#BBA8FF",
  p400: "#9E7EFF", p500: "#8657FF", p600: "#7035F5", p700: "#5E24D8", p800: "#4B1AB5",
  ink: "#130D2E", ink2: "#2D2150", mid: "#6B5E8A", soft: "#9E92BA",
  faint: "#C8C0DC", line: "#EBE6F5",
  green: "#22C55E", greenBg: "#F0FDF4", greenBd: "#BBF7D0",
  red: "#EF4444", redBg: "#FEF2F2", amber: "#F59E0B",
};

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  // If no token is present, we show an error early on.
  if (!token) {
    return (
      <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:460,animation:"fadeUp .6s ease both",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:24}}>⚠️</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:T.ink,marginBottom:8}}>Invalid Link</h1>
          <p style={{fontSize:14,color:T.mid,marginBottom:32}}>This password reset link is invalid or missing the reset token.</p>
          <button onClick={() => navigate('/login')} style={{padding:"12px 24px",background:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Return to Login</button>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    setAlert(null);
    if (!newPassword || !confirmPassword) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", message: "Your passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setAlert({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Failed to reset password. The link may have expired." });
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:460,animation:"fadeUp .6s ease both"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontStyle:"italic",fontSize:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}>t</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.ink}}>talkativ</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-.5px"}}>Reset your password</h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>Create a secure, new password for your account.</p>
        </div>

        {/* Alert */}
        {alert && !success && (
          <div style={{background:alert.type==="error"?T.redBg:T.greenBg,border:`1.5px solid ${alert.type==="error"?"#fecaca":T.greenBd}`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{alert.type==="error"?"⚠️":"✅"}</span>
            <div style={{fontSize:13,fontWeight:600,color:alert.type==="error"?T.red:T.green}}>{alert.message}</div>
          </div>
        )}

        {/* Success / Form */}
        {success ? (
           <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:40,textAlign:"center",boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
             <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${T.greenBg},#dcfce7)`,border:`2px solid ${T.greenBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px",color:T.green}}>✓</div>
             <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:T.ink,marginBottom:8}}>Password Reset!</h2>
             <p style={{fontSize:14,color:T.mid,marginBottom:24,lineHeight:1.6}}>Your password has been successfully updated. You can now use it to log in.</p>
             <p style={{fontSize:12,color:T.soft,fontWeight:600}}>Redirecting to login...</p>
           </div>
        ) : (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" placeholder="Create a strong password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleReset()}/>
            </div>
            <div className="form-group" style={{marginBottom: 24}}>
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" placeholder="Repeat your new password" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleReset()}/>
            </div>
            
            <button disabled={loading} onClick={handleReset} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s"}}>{loading?"Saving...":"Save changes →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
