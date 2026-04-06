import { useState, useRef } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import { VOICE_CATALOGUE } from "../../utils/constants";
import { makeDefaultSchedule, buildHours } from "../../utils/schedule";
import ObShell from "./ObShell";

const DAY_ENTRIES = [["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"],["sun","Sun"]];

export default function Step4({ onNext, onBack, bizName, bizPhone, onAgentNameChange }) {
  const [gender, setGender] = useState("female");
  const voices = VOICE_CATALOGUE[gender];
  const [vc, setVc] = useState(0);
  const [agentName, setAgentName] = useState("Aria");
  const [nameEdited, setNameEdited] = useState(false);
  const [greetingEdited, setGreetingEdited] = useState(false);
  const displayBiz = bizName || "your restaurant";
  const autoGreeting = `Hi, thanks for calling us at ${displayBiz}! I'm ${agentName}, your AI assistant. Would you like to place an order, check our hours, or something else?`;
  const [greeting, setGreeting] = useState(autoGreeting);
  const [fallbackAction, setFallbackAction] = useState("transfer");

  // Schedule
  const [agentIs24h, setAgentIs24h] = useState(false);
  const [agentSchedule, setAgentSchedule] = useState(makeDefaultSchedule());

  const toggleDay = (day) =>
    setAgentSchedule(prev => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }));
  const updateTime = (day, field, value) =>
    setAgentSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

  // Voice preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const audioRef = useRef(null);

  const handlePreview = async () => {
    if (previewPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPreviewPlaying(false);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await api.agent.previewVoice({ voiceId: voices[vc].id, text: greeting });
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audioRef.current = audio;
      audio.onended = () => { setPreviewPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setPreviewPlaying(false); audioRef.current = null; setPreviewError("Audio failed to play."); };
      await audio.play();
      setPreviewPlaying(true);
    } catch (err) {
      setPreviewError(err?.message || "Preview unavailable — check your ElevenLabs API key.");
    }
    setPreviewLoading(false);
  };

  const handleGenderChange = (g) => {
    setGender(g);
    setVc(0);
    const firstName = VOICE_CATALOGUE[g][0].n;
    if (!nameEdited) setAgentName(firstName);
    if (!greetingEdited) {
      const nameForGreeting = nameEdited ? agentName : firstName;
      setGreeting(`Hi, thanks for calling us at ${displayBiz}! I'm ${nameForGreeting}, your AI assistant. Would you like to place an order, check our hours, or something else?`);
    }
  };

  const handleAgentNameChange = (val) => {
    setNameEdited(true);
    setAgentName(val);
    if (!greetingEdited) {
      setGreeting(`Hi, thanks for calling us at ${displayBiz}! I'm ${val}, your AI assistant. Would you like to place an order, check our hours, or something else?`);
    }
  };

  const handleNext = async () => {
    if (onAgentNameChange) onAgentNameChange(agentName);
    try {
      await api.agent.update({
        name: agentName,
        gender,
        openingGreeting: greeting,
        voiceId: voices[vc].id,
        voiceName: voices[vc].n,
        voiceDescription: voices[vc].d,
        transferNumber: (fallbackAction === "transfer" && bizPhone) ? bizPhone : null,
        agentSchedule: buildHours(agentIs24h, agentSchedule),
      });
    } catch (err) {
      console.error("Failed to save agent settings:", err?.message || err);
    }
    onNext();
  };

  return (
    <ObShell step={4} onNext={handleNext} onBack={onBack} nextLabel="Save & continue →">
      <div className="ob-step-label">Step 5 · Voice & script</div>
      <h1 className="ob-heading">Customise your<br /><em>AI agent</em></h1>
      <p className="ob-subheading">Pick a voice and personalise your greeting. All fields are pre-filled — just change what you want.</p>

      {/* Gender toggle */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label" style={{ marginBottom: 10 }}>Agent gender</label>
        <div style={{ display: "flex", gap: 10 }}>
          {["female", "male"].map(g => (
            <div key={g} onClick={() => handleGenderChange(g)}
              style={{ flex: 1, border: `1.5px solid ${gender === g ? T.p500 : T.line}`, borderRadius: 12, padding: "12px 16px", textAlign: "center", cursor: "pointer", background: gender === g ? T.p50 : T.white, transition: "all .15s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{g === "female" ? "👩" : "👨"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: gender === g ? T.p700 : T.ink, textTransform: "capitalize" }}>{g}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice picker — 4 voices, no name shown */}
      <label className="form-label" style={{ marginBottom: 12 }}>Choose a voice</label>
      <div className="voice-grid">
        {voices.map((v, i) => (
          <div key={v.id} className={`voice-card ${vc === i ? "selected" : ""}`} onClick={() => setVc(i)}>
            <div className="voice-desc">{v.d}</div>
            {vc === i ? (
              <div className="voice-wave">
                <div className="voice-wave-bar" style={{ animationDelay: '0s' }} />
                <div className="voice-wave-bar" style={{ animationDelay: '0.15s' }} />
                <div className="voice-wave-bar" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : (
              <div className="voice-play-btn">▶</div>
            )}
          </div>
        ))}
      </div>

      <div className="form-group"><label className="form-label">Agent name</label><input className="form-input" value={agentName} onChange={e => handleAgentNameChange(e.target.value)} /></div>

      {/* Greeting */}
      <div className="form-group">
        <label className="form-label">Greeting message</label>
        <textarea className="form-input" rows={3} value={greeting} onChange={e => { setGreetingEdited(true); setGreeting(e.target.value); }} />
        <div style={{ fontSize: 11.5, color: T.soft, marginTop: 6 }}>Keep under 20 seconds of speech for the best experience</div>
      </div>

      {/* Hear your agent preview */}
      <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Hear how your agent sounds</div>
        <div style={{ fontSize: 12, color: T.soft, marginBottom: 16 }}>Based on your voice selection, name and greeting message.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            style={{ width: 48, height: 48, borderRadius: "50%", border: "none", background: previewPlaying ? T.red : `linear-gradient(135deg,${T.p400},${T.p700})`, color: "white", fontSize: 18, cursor: previewLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px rgba(112,53,245,.3)`, transition: "all .2s", opacity: previewLoading ? 0.7 : 1 }}>
            {previewPlaying ? "⏹" : "▶"}
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 3, height: 36 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 4,
                background: previewPlaying ? T.p500 : T.line,
                height: previewPlaying
                  ? `${20 + Math.sin(i * 0.7) * 14 + Math.cos(i * 1.3) * 8}px`
                  : `${6 + Math.sin(i * 0.5) * 4}px`,
                transition: "height .3s ease, background .3s ease",
                animation: previewPlaying ? `audioBar .8s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate` : "none",
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.soft, whiteSpace: "nowrap" }}>
            {previewLoading ? "Generating…" : previewPlaying ? "Playing…" : `${agentName} · ${voices[vc].d}`}
          </div>
        </div>
        {previewError && (
          <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: T.red, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>{previewError}</span>
          </div>
        )}
      </div>

      {/* Fallback */}
      <div className="form-group">
        <label className="form-label">When agent can't help, it should…</label>
        <select className="form-input" value={fallbackAction} onChange={e => setFallbackAction(e.target.value)}>
          <option value="transfer">Transfer to your phone number</option>
          <option value="voicemail">Take a voicemail</option>
          <option value="callback">Ask caller to call back later</option>
        </select>
      </div>

      {/* Agent Working Schedule — Step2 grid style */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: T.soft, marginBottom: 4 }}>Agent working schedule</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 16 }}>When should your agent be active?</div>

        <label
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", userSelect: "none" }}
          onClick={() => setAgentIs24h(v => !v)}
        >
          <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${agentIs24h ? T.p600 : T.line}`, background: agentIs24h ? T.p600 : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
            {agentIs24h && <span style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>We operate 24/7</span>
        </label>

        {!agentIs24h && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {DAY_ENTRIES.map(([key, label]) => {
              const day = agentSchedule[key];
              return (
                <div key={key} style={{ background: T.white, border: `1.5px solid ${day.open ? T.p400 : T.line}`, borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "border-color .15s", minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day.open ? T.p700 : T.ink }}>{label}</div>
                  <div onClick={() => toggleDay(key)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${day.open ? T.p600 : T.line}`, background: day.open ? T.p600 : T.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s" }}>
                    {day.open && <span style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                  </div>
                  {day.open && (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div>
                        <div style={{ fontSize: 9, color: T.soft, marginBottom: 2, textAlign: "center" }}>Open</div>
                        <input type="time" value={day.openTime} onChange={e => updateTime(key, "openTime", e.target.value)} style={{ width: "100%", border: `1.5px solid ${T.line}`, borderRadius: 7, padding: "4px 4px", fontSize: 11, fontFamily: "'Outfit',sans-serif", color: T.ink, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: T.soft, marginBottom: 2, textAlign: "center" }}>Close</div>
                        <input type="time" value={day.closeTime} onChange={e => updateTime(key, "closeTime", e.target.value)} style={{ width: "100%", border: `1.5px solid ${T.line}`, borderRadius: 7, padding: "4px 4px", fontSize: 11, fontFamily: "'Outfit',sans-serif", color: T.ink, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {agentIs24h && (
          <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: T.green, fontWeight: 600 }}>
            Your agent will answer calls around the clock, every day.
          </div>
        )}
      </div>
    </ObShell>
  );
}
