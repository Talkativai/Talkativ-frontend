import { useState } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";

export default function Step1({ onNext, onBack, onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const handleRegister = async () => {
    setError(null);
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your first name, email, and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.register(email.trim(), password, firstName.trim(), lastName.trim());
      if (onRegister) onRegister(data.user || { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      onNext();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <ObShell step={1} onNext={handleRegister} onBack={onBack} nextLabel={loading ? "Creating account…" : "Create account →"} loading={loading}>
      <div className="ob-step-label">Step 2 · Account</div>
      <h1 className="ob-heading">Create your<br /><em>account</em></h1>
      <p className="ob-subheading">No credit card required. 14-day free trial on all plans — cancel any time.</p>

      {error && (
        <div style={{ background: T.redBg, border: `1.5px solid #fecaca`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.red }}>{error}</div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">First name</label><input className="form-input" placeholder="Maria" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Last name</label><input className="form-input" placeholder="Chen" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
      </div>
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input className="form-input" placeholder="maria@restaurant.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input className="form-input" placeholder="At least 8 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} />
      </div>
      <p style={{ fontSize: 12.5, color: T.soft, marginTop: 6 }}>By continuing you agree to our <span style={{ color: T.p600, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: T.p600, cursor: "pointer" }}>Privacy Policy</span>.</p>
    </ObShell>
  );
}
