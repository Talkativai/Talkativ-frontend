import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../context/AuthContext";

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

export default function LoginScreen() {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const [mode, setMode]                 = useState("owner");
  const [alert, setAlert]               = useState(null);
  const [loading, setLoading]           = useState(false);
  // Owner form state
  const [ownerEmail, setOwnerEmail]     = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  // Staff form state
  const [staffBusiness, setStaffBusiness] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  // Forgot password
  const [forgotEmail, setForgotEmail]   = useState("");
  const [forgotSent, setForgotSent]     = useState(false);

  // ── Owner login via email/password ─────────────────────────────────────────
  const handleOwnerLogin = async () => {
    if (!ownerEmail || !ownerPassword) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }
    setLoading(true); setAlert(null);
    try {
      const data = await api.auth.login(ownerEmail, ownerPassword);
      handleLogin(data.user);
      setAlert({ type: "success", message: "Welcome back! Redirecting…" });
      const dest = data.user?.role === "ADMIN" ? "/admin"
        : !data.onboardingDone ? `/onboarding/${data.onboardingStep || 1}` : "/dashboard";
      setTimeout(() => navigate(dest), 400);
    } catch (err) {
      setAlert({
        type: "error", message: err.message || "Invalid email or password.",
        action: { label: "Create an account →", onClick: () => navigate("/onboarding/1") },
      });
    }
    setLoading(false);
  };

  // ── Google login via OAuth redirect ───────────────────────────────────────
  const handleGoogleLogin = () => {
    window.location.href = api.auth.googleLoginUrl();
  };

  // ── Google login via Clerk SSO (commented out — using Google OAuth) ────────
  // const handleGoogleLogin = async () => {
  //   if (!clerkLoaded || !signIn) return;
  //   setLoading(true); setAlert(null);
  //   try {
  //     await signIn.authenticateWithRedirect({
  //       strategy: "oauth_google",
  //       redirectUrl: `${window.location.origin}/#/sso-callback`,
  //       redirectUrlComplete: `${window.location.origin}/#/dashboard`,
  //     });
  //   } catch (err) {
  //     setAlert({ type: "error", message: err.message || "Google sign-in failed. Please try again." });
  //     setLoading(false);
  //   }
  // };

  // ── Staff login ────────────────────────────────────────────────────────────
  const handleStaffLogin = async () => {
    if (!staffBusiness || !staffUsername || !staffPassword) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }
    setLoading(true); setAlert(null);
    try {
      const data = await api.auth.staffLogin(staffBusiness, staffUsername, staffPassword);
      setAlert({ type: "success", message: "Welcome back! Redirecting…" });
      handleLogin(data.user);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "No staff found with those credentials." });
    }
    setLoading(false);
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!forgotEmail) { setAlert({ type: "error", message: "Please enter your email." }); return; }
    setLoading(true); setAlert(null);
    try {
      await api.auth.forgotPassword(forgotEmail);
      setForgotSent(true);
      setAlert({ type: "success", message: "If that email exists, a reset link has been sent." });
    } catch {
      setAlert({ type: "error", message: "Failed to send reset link. Please try again later." });
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
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-.5px"}}>Welcome back</h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>Sign in to your account to continue</p>
        </div>

        {/* Mode Toggle */}
        {mode !== "forgot" && (
          <div style={{display:"flex",background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:4,marginBottom:24}}>
            {["owner","staff"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setAlert(null);}} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .2s",background:mode===m?T.ink:"transparent",color:mode===m?"white":T.mid}}>{m==="owner"?"Owner":"Staff"}</button>
            ))}
          </div>
        )}

        {/* Alert */}
        {alert && (
          <div style={{background:alert.type==="error"?T.redBg:T.greenBg,border:`1.5px solid ${alert.type==="error"?"#fecaca":T.greenBd}`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{alert.type==="error"?"⚠️":"✅"}</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:alert.type==="error"?T.red:T.green}}>{alert.message}</div>
              {alert.action && <div style={{fontSize:12,color:T.p600,cursor:"pointer",marginTop:4,fontWeight:600}} onClick={alert.action.onClick}>{alert.action.label}</div>}
            </div>
          </div>
        )}

        {/* Owner Login */}
        {mode==="owner" && (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            <div className="sso-row" style={{marginBottom:16}}>
              <button className="sso-btn" style={{width:"100%"}} onClick={handleGoogleLogin}>🔵 Continue with Google</button>
            </div>
            <div className="divider-row"><div className="divider-line"/><span className="divider-text">or sign in with email</span><div className="divider-line"/></div>
            <div style={{marginTop:16}}>
              <div className="form-group"><label className="form-label">Email address</label><input className="form-input" placeholder="you@restaurant.com" type="email" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOwnerLogin()}/></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="Enter your password" type="password" value={ownerPassword} onChange={e=>setOwnerPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOwnerLogin()}/></div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:18}}>
                <span onClick={()=>{setMode("forgot");setAlert(null);setForgotSent(false);}} style={{fontSize:12.5,color:T.p600,cursor:"pointer",fontWeight:500}}>Forgot password?</span>
              </div>
              <button disabled={loading} onClick={handleOwnerLogin} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s"}}>{loading?"Signing in…":"Sign in →"}</button>
            </div>
          </div>
        )}

        {/* Staff Login */}
        {mode==="staff" && (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            <div className="form-group"><label className="form-label">Business name</label><input className="form-input" placeholder="e.g. Tony's Pizzeria" value={staffBusiness} onChange={e=>setStaffBusiness(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Username</label><input className="form-input" placeholder="Your staff username" value={staffUsername} onChange={e=>setStaffUsername(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="Enter your password" type="password" value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleStaffLogin()}/></div>
            <button disabled={loading} onClick={handleStaffLogin} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s",marginTop:8}}>{loading?"Signing in…":"Sign in as staff →"}</button>
          </div>
        )}

        {/* Forgot Password */}
        {mode==="forgot" && (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            {forgotSent ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${T.p50},${T.p100})`,border:`1.5px solid ${T.p200}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px"}}>✉️</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:T.ink,marginBottom:8}}>Check your email</h3>
                <p style={{fontSize:13.5,color:T.mid,marginBottom:24,lineHeight:1.6}}>We've sent password reset instructions to <strong>{forgotEmail}</strong>.</p>
                <button onClick={()=>{setMode("owner");setForgotSent(false);setAlert(null);}} style={{width:"100%",padding:"14px",background:T.white,color:T.ink,border:`1.5px solid ${T.line}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>← Back to login</button>
              </div>
            ) : (
              <>
                <div style={{marginBottom:20}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:T.ink,margin:0}}>Forgot Password</h3>
                  <p style={{fontSize:13,color:T.soft,marginTop:6,marginBottom:0}}>Enter your email and we'll send you a reset link.</p>
                </div>
                <div className="form-group"><label className="form-label">Email address</label><input className="form-input" placeholder="you@restaurant.com" type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()}/></div>
                <button disabled={loading} onClick={handleForgotPassword} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s",marginBottom:12}}>{loading?"Sending…":"Send reset link"}</button>
                <div style={{textAlign:"center"}}>
                  <span onClick={()=>{setMode("owner");setAlert(null);}} style={{fontSize:13,color:T.mid,cursor:"pointer",fontWeight:500}}>← Back to login</span>
                </div>
              </>
            )}
          </div>
        )}

        {mode !== "forgot" && (
          <div style={{textAlign:"center",marginTop:24}}>
            <span style={{fontSize:13,color:T.soft}}>Don't have an account? </span>
            <span style={{fontSize:13,color:T.p600,cursor:"pointer",fontWeight:600}} onClick={()=>navigate("/onboarding/1")}>Create one free →</span>
          </div>
        )}
      </div>
    </div>
  );
}
