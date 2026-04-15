import { useState, useEffect, useCallback } from "react";
import { T } from "../../utils/tokens";
import ObShell from "./ObShell";
import { api } from "../../api";

export default function Step5({ onNext, onBack, agentName = "your agent", onPhoneProvisioned }) {
  const [status, setStatus] = useState("loading"); // loading | provisioning | done | error | unavailable
  const [assignedNumber, setAssignedNumber] = useState(null);
  const [error, setError] = useState("");
  const [bizCountry, setBizCountry] = useState("");

  const provision = useCallback(async () => {
    setStatus("provisioning");
    setError("");
    try {
      let country = "GB";
      let countryName = "";
      try {
        const biz = await api.business.get();
        if (biz?.country) { country = biz.country; countryName = biz.country; }
      } catch {}
      setBizCountry(countryName);
      const result = await api.business.setupPhone("new", country);
      if (result?.assignedNumber) {
        setAssignedNumber(result.assignedNumber);
        if (onPhoneProvisioned) onPhoneProvisioned(result.assignedNumber);
        setStatus("done");
      } else {
        setStatus("error");
        setError("Could not provision a number. You can retry or skip.");
      }
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("NO_NUMBER_IN_REGION")) {
        setStatus("unavailable");
      } else {
        setError("Something went wrong provisioning your number. You can retry or continue without one.");
        setStatus("error");
      }
    }
  }, []);

  // On mount: check if number already assigned, else auto-provision
  useEffect(() => {
    api.settings.getPhone().then(d => {
      if (d?.assignedNumber) {
        setAssignedNumber(d.assignedNumber);
        if (onPhoneProvisioned) onPhoneProvisioned(d.assignedNumber);
        setStatus("done");
      } else {
        provision();
      }
    }).catch(() => { provision(); });
  }, [provision]);

  const formatPhone = (num) => {
    if (!num) return "";
    if (num.startsWith("+44") && num.length > 8) {
      return num.replace(/(\+\d{2})(\d{3,4})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
    }
    return num.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4").trim();
  };

  const nextLabel =
    status === "done"       ? "Test your agent →" :
    status === "unavailable"? "Continue without a number →" :
                              "Skip for now →";

  return (
    <ObShell step={5} onNext={onNext} onBack={onBack} nextLabel={nextLabel} loading={status === "provisioning" || status === "loading"}>
      <div className="ob-step-label">Step 6 · Phone number</div>
      <h1 className="ob-heading">Your agent's<br /><em>phone number</em></h1>
      <p className="ob-subheading">
        {status === "done"
          ? `${agentName} now has a dedicated phone number. Customers can call it and ${agentName} will answer.`
          : status === "unavailable"
          ? `No phone numbers are available for your region yet.`
          : `We're assigning a local number to ${agentName}. This only takes a moment.`}
      </p>

      {/* Provisioning / loading state */}
      {(status === "loading" || status === "provisioning") && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.p50}, ${T.mist || "#f3f0ff"})`,
            border: `2px solid ${T.p200}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 44, margin: "0 auto 28px",
          }}>
            📞
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{
              width: 20, height: 20, border: `2.5px solid ${T.p200}`,
              borderTopColor: T.p600, borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
            <span style={{ fontSize: 15, color: T.mid, fontWeight: 600 }}>
              Assigning your number to {agentName}…
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.soft, marginTop: 12 }}>
            We're provisioning a local number based on your business location.
          </div>
        </div>
      )}

      {/* Success state */}
      {status === "done" && assignedNumber && (
        <div style={{
          background: `linear-gradient(135deg, ${T.greenBg || "#f0fdf4"}, #ecfdf5)`,
          border: `1.5px solid ${T.greenBd || "#bbf7d0"}`,
          borderRadius: 20, padding: "32px 28px",
          textAlign: "center",
          animation: "fadeUp .4s ease both",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 18px",
            boxShadow: "0 6px 20px rgba(34,197,94,.3)",
          }}>
            ✅
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green || "#16a34a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
            Number assigned
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 900, color: T.ink,
            letterSpacing: 1, lineHeight: 1, marginBottom: 12,
          }}>
            {formatPhone(assignedNumber)}
          </div>
          <div style={{ fontSize: 13, color: T.mid }}>
            Connected to {agentName} and ready for inbound calls
          </div>
        </div>
      )}

      {/* No numbers available for this country */}
      {status === "unavailable" && (
        <div style={{ marginTop: 18, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>
            📵 No numbers available{bizCountry ? ` for ${bizCountry}` : " in your region"}
          </div>
          <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
            Talkativ doesn't have local phone numbers available for your country yet. You can still continue — your agent will be fully set up, and you can:
          </div>
          <ul style={{ fontSize: 13, color: "#78350f", lineHeight: 1.8, paddingLeft: 18, marginTop: 8, marginBottom: 0 }}>
            <li>Forward calls from your existing number to your agent later</li>
            <li>Contact <strong>support@talkativ.io</strong> to request a number for your region</li>
          </ul>
        </div>
      )}

      {/* Temporary error state */}
      {status === "error" && (
        <div style={{ marginTop: 18, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: T.red, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <div>
            {error}
            <button
              onClick={provision}
              style={{ display: "block", marginTop: 8, background: "none", border: "none", color: T.p600, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif", padding: 0 }}
            >
              🔄 Try again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ObShell>
  );
}
