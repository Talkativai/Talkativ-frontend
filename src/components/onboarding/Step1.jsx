import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";

export default function Step1({ onNext, onBack, onPhoneChange, onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googlePrefilled, setGooglePrefilled] = useState(false);

  // Pre-fill from Google OAuth profile if it came back from the callback
  useEffect(() => {
    const stored = sessionStorage.getItem('talkativ_google_profile');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.firstName) setFirstName(data.firstName);
        if (data.lastName) setLastName(data.lastName);
        if (data.email) setEmail(data.email);
        setGooglePrefilled(true);
        sessionStorage.removeItem('talkativ_google_profile');
      } catch {}
    }
  }, []);

  const handleRegister = async () => {
    setError(null);
    if (!firstName.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setError("Please fill in your first name, email, password, and business phone number.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.register(email.trim(), password, firstName.trim(), lastName.trim(), phone.trim());
      if (onPhoneChange) onPhoneChange(phone.trim());
      if (onRegister) onRegister(data.user || { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      onNext();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    window.location.href = api.auth.googleLoginUrl('register');
  };

  return (
    <ObShell step={1} onNext={handleRegister} onBack={onBack} nextLabel={loading ? "Creating account…" : "Create account →"}>
      <div className="ob-step-label">Step 2 · Account</div>
      <h1 className="ob-heading">Create your<br /><em>account</em></h1>
      <p className="ob-subheading">No credit card required. 14-day free trial on all plans — cancel any time.</p>

      {/* Google pre-fill success banner */}
      {googlePrefilled && (
        <div style={{ background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.green }}>Google account connected — just set a password to finish.</div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: T.redBg, border: `1.5px solid #fecaca`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.red }}>{error}</div>
        </div>
      )}

      {/* Show Google button only if not already pre-filled from Google */}
      {!googlePrefilled && (
        <>
          <div className="sso-row">
            <button className="sso-btn" onClick={handleGoogleSignIn}>🔵 Continue with Google</button>
          </div>
          <div className="divider-row"><div className="divider-line" /><span className="divider-text">or continue with email</span><div className="divider-line" /></div>
        </>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">First name</label><input className="form-input" placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Last name</label><input className="form-input" placeholder="Chen" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
      </div>
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input className="form-input" placeholder="maria@restaurant.com" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          readOnly={googlePrefilled}
          style={googlePrefilled ? { background: T.paper, color: T.mid } : {}} />
        {googlePrefilled && <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>Email confirmed via Google</div>}
      </div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="At least 8 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <div className="form-group">
        <label className="form-label">Business phone number</label>
        <input className="form-input" placeholder="+1 (555) 000-0000" type="tel" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} />
        <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>This will be your managed business number for calls &amp; texts.</div>
      </div>
      <p style={{ fontSize: 12.5, color: T.soft, marginTop: 6 }}>By continuing you agree to our <span style={{ color: T.p600, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: T.p600, cursor: "pointer" }}>Privacy Policy</span>.</p>
    </ObShell>
  );
}
