import { useState, useRef } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import { POS_SYSTEMS } from "../../utils/constants";
import ObShell from "./ObShell";

export default function Step3({ onNext, onBack }) {
  const [sel, setSel] = useState(0);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [posSelected, setPosSelected] = useState(null);
  const [posFields, setPosFields] = useState({});
  // Integration setup state
  const [configuredSystems, setConfiguredSystems] = useState({});
  const [setupModal, setSetupModal] = useState(null); // null | "picker" | "ordering" | "reservation"
  const [setupFields, setSetupFields] = useState({});
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState(null);
  const [setupDone, setSetupDone] = useState(null);
  const fileInputRef = useRef(null);

  const opts = [
    { icon: "🌐", title: "Import from URL", desc: "Paste your website or online menu link", badge: "Fastest" },
    { icon: "📁", title: "Upload your file", desc: "PDF, DOCX, or PNG accepted" },
    { icon: "🔌", title: "Connect your POS", desc: "Clover, Square, resOS", badge: "Recommended" },
  ];

  const resetResult = () => { setResult(null); setError(null); };
  const handleSelChange = (i) => { setSel(i); resetResult(); setPosSelected(null); setPosFields({}); };
  const handlePosSelect = (name) => { setPosSelected(name); setPosFields(configuredSystems[name] || {}); resetResult(); };

  // Setup wizard helpers
  const setupSystem = setupModal === "ordering"
    ? POS_SYSTEMS.find(p => p.name === "Square")
    : setupModal === "reservation"
    ? POS_SYSTEMS.find(p => p.name === "resOS")
    : null;

  const handleSetupConnect = () => {
    if (!setupSystem) return;
    const missing = setupSystem.fields.find(f => !setupFields[f.key]?.trim());
    if (missing) { setSetupError(`${missing.label} is required.`); return; }
    setSetupLoading(true);
    setSetupError(null);
    setTimeout(() => {
      setConfiguredSystems(prev => ({ ...prev, [setupSystem.name]: { ...setupFields } }));
      setSetupDone(setupSystem.name);
      setSetupLoading(false);
    }, 800);
  };

  const closeSetupModal = () => { setSetupModal(null); setSetupFields({}); setSetupError(null); setSetupDone(null); };

  const handleFileSelect = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!allowed.includes(f.type)) { setError("Only PDF, DOCX, or PNG files are supported."); return; }
    setFile(f);
    resetResult();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    setError(null);
    if (sel === 0) {
      if (!url.trim()) { setError("Please enter a URL."); return; }
    } else if (sel === 1) {
      if (!file) { setError("Please select a file."); return; }
    } else {
      if (!posSelected) { setError("Please select an integration."); return; }
      const pos = POS_SYSTEMS.find(p => p.name === posSelected);
      const missing = pos?.fields.find(f => !posFields[f.key]?.trim());
      if (missing) { setError(`${missing.label} is required.`); return; }
      setLoading(true);
      try {
        const data = await api.menu.importFromPos(posSelected, posFields);
        setResult({ pos: data });
      } catch (err) { setError(err.message || "Connection failed. Please check your credentials."); }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let importUrl = url.trim();
      if (importUrl && !/^https?:\/\//i.test(importUrl)) importUrl = `https://${importUrl}`;
      const data = sel === 0
        ? await api.menu.importFromUrl(importUrl)
        : await api.menu.importFromFile(file);
      setResult(data.categorized ? data.categorized : data);
    } catch (err) {
      setError(err.message || "Import failed. Please try again.");
    }
    setLoading(false);
  };

  const CategoryRow = ({ icon, label, found, detail }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` }}>
      <span style={{ fontSize: 16 }}>{found ? "✅" : "⚠️"}</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: found ? T.ink : T.soft }}>{label}</span>
        {detail && <span style={{ fontSize: 12, color: T.soft, marginLeft: 8 }}>{detail}</span>}
      </div>
      <span style={{ fontSize: 12, color: found ? T.green : T.soft, fontWeight: 600 }}>{found ? "Found" : "Not found"}</span>
    </div>
  );

  const ResultsPanel = ({ r }) => {
    if (r.pos) {
      const p = r.pos;
      return (
        <div style={{ marginTop: 18, background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 8 }}>✅ {p.posSystem} connected</div>
          <div style={{ fontSize: 13, color: T.mid, marginBottom: p.categories?.length > 0 ? 10 : 0 }}>{p.message}</div>
          {p.categories?.length > 0 && p.categories.map(c => (
            <div key={c.name} style={{ fontSize: 12, color: T.mid, paddingTop: 3 }}>· {c.name}: {c.itemCount} item{c.itemCount !== 1 ? 's' : ''}</div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ marginTop: 18, background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 12 }}>✅ Import complete — here's what we found:</div>
        <CategoryRow icon="🍽️" label="Menu items"
          found={r.menu?.found}
          detail={r.menu?.found ? `${r.menu.savedItems} new items saved across ${r.menu.categories?.length} categories${r.menu.duplicatesSkipped > 0 ? ` · ${r.menu.duplicatesSkipped} duplicates skipped` : ''}` : "No menu items detected"} />
        {r.menu?.found && r.menu.categories?.length > 0 && (
          <div style={{ paddingLeft: 26, paddingBottom: 6 }}>
            {r.menu.categories.map(c => (
              <div key={c.name} style={{ fontSize: 12, color: T.mid, paddingTop: 4 }}>
                · {c.name}: {c.itemCount} item{c.itemCount !== 1 ? 's' : ''}
              </div>
            ))}
          </div>
        )}
        <CategoryRow icon="🕐" label="Opening hours" found={r.hours?.found} />
        <CategoryRow icon="❓" label="FAQs" found={r.faq?.found} detail={r.faq?.found ? `${r.faq.count} entries` : null} />
        <CategoryRow icon="📋" label="Business details" found={r.contact?.found} />
        <CategoryRow icon="📝" label="Business summary" found={r.summary?.found} />
        {r.other?.found && <CategoryRow icon="ℹ️" label="Other info" found={true} />}
      </div>
    );
  };

  return (
    <>
    <ObShell step={3} onNext={result ? onNext : handleImport} onBack={onBack}
      nextLabel={loading ? (sel === 2 ? "Connecting…" : "Importing…") : result ? "Continue →" : sel === 2 ? (posSelected ? "Connect POS →" : "Skip for now →") : "Import menu →"}>
      <div className="ob-step-label">Step 4 · Menu</div>
      <h1 className="ob-heading">Import your<br /><em>menu</em></h1>
      <p className="ob-subheading">We parse it automatically — no manual entry. Your AI uses this to answer customer questions and take orders.</p>

      <div className="import-list">
        {opts.map((o, i) => (
          <div key={o.title} className={`import-item ${sel === i ? "selected" : ""}`} onClick={() => handleSelChange(i)}>
            <div className="import-item-icon">{o.icon}</div>
            <div className="import-item-info"><h4>{o.title}</h4><p>{o.desc}</p></div>
            {o.badge && <div className="import-badge">{o.badge}</div>}
            <div className="radio-dot" style={{ borderColor: sel === i ? T.p500 : T.faint, background: sel === i ? T.p500 : "transparent" }}>
              {sel === i && <div className="radio-inner" />}
            </div>
          </div>
        ))}
      </div>

      {/* URL panel */}
      {sel === 0 && (
        <div style={{ marginTop: 18 }}>
          <label className="form-label">Menu URL</label>
          <input className="form-input" placeholder="e.g. tonys-pizzeria.com/menu" style={{ marginTop: 6 }}
            value={url} onChange={e => { setUrl(e.target.value); resetResult(); }} />
        </div>
      )}

      {/* File upload panel */}
      {sel === 1 && (
        <div style={{ marginTop: 18 }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.png,.jpg" style={{ display: "none" }}
            onChange={e => handleFileSelect(e.target.files[0])} />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{ border: `2px dashed ${dragging ? T.p400 : file ? T.green : T.faint}`, borderRadius: 16, padding: "28px 24px", textAlign: "center", cursor: "pointer", background: dragging ? T.p50 : T.paper, transition: "all .18s" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{file ? "📄" : "📁"}</div>
            {file ? (
              <>
                <div style={{ fontWeight: 600, color: T.ink, fontSize: 14 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: T.soft, marginTop: 4 }}>Click to change file</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, color: T.ink, fontSize: 14 }}>Drop your file here</div>
                <div style={{ fontSize: 12.5, color: T.soft, marginTop: 4 }}>PDF, DOCX, or PNG · or <span style={{ color: T.p600, fontWeight: 600 }}>click to browse</span></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* POS / Integration panel */}
      {sel === 2 && (
        <div style={{ marginTop: 18 }}>
          {/* 3-column integration cards */}
          <div className="resp-3col-grid" style={{marginBottom: 14}}>
            {POS_SYSTEMS.map(p => {
              const active = posSelected === p.name;
              const configured = !!configuredSystems[p.name];
              return (
                <div key={p.name} onClick={() => handlePosSelect(p.name)}
                  style={{ border: `1.5px solid ${active ? T.p500 : configured ? T.greenBd : T.line}`, borderRadius: 14, padding: "14px 10px", textAlign: "center", cursor: "pointer", background: active ? T.p50 : configured ? T.greenBg : T.white, transition: "all .18s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = configured ? T.greenBd : T.p300; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = configured ? T.greenBd : T.line; }}>
                  {configured && (
                    <div style={{ position: "absolute", top: 7, right: 8, background: T.green, color: "white", borderRadius: 999, fontSize: 8, fontWeight: 800, padding: "2px 5px" }}>✓</div>
                  )}
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? T.p700 : T.ink }}>{p.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: p.type === "reservation" ? "#7C3AED" : T.soft }}>
                    {p.type === "reservation" ? "Reservations" : "Ordering"}
                  </span>
                  {configured && <span style={{ fontSize: 10, fontWeight: 700, color: T.green }}>Connected</span>}
                </div>
              );
            })}
          </div>

          {/* Credential fields for selected integration */}
          {posSelected && (() => {
            const pos = POS_SYSTEMS.find(p => p.name === posSelected);
            return (
              <div style={{ background: T.paper, borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${T.line}`, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>{pos.icon} {pos.name} credentials</div>
                {pos.fields.map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: T.soft, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".3px" }}>{f.label}</label>
                    <input value={posFields[f.key] || ""} onChange={e => { setPosFields(v => ({ ...v, [f.key]: e.target.value })); setError(null); }} placeholder={f.ph} className="form-input" style={{ marginTop: 0 }} />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* "Don't have integration yet?" button */}
          <button
            onClick={() => { setSetupModal("picker"); setSetupFields({}); setSetupError(null); setSetupDone(null); }}
            style={{ width: "100%", border: `1.5px dashed ${T.line}`, borderRadius: 12, padding: "12px 16px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: T.soft, textAlign: "center", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.p300; e.currentTarget.style.background = T.p50; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.background = "transparent"; }}
          >
            Don't have any integration yet?{" "}
            <span style={{ color: T.p600, fontWeight: 700 }}>Setup your integration →</span>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 14, background: T.redBg, border: `1.5px solid #fecaca`, borderRadius: 12, padding: "11px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <span>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.red }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: 18, background: T.p50, border: `1.5px solid ${T.p100}`, borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: T.p600, fontWeight: 600 }}>⏳ Extracting and categorising your data with AI…</div>
          <div style={{ fontSize: 12, color: T.soft, marginTop: 4 }}>This may take 10–20 seconds</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && <ResultsPanel r={result} />}
    </ObShell>

    {/* ── Integration Setup Modal ── */}
    {setupModal && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
        onClick={e => { if (e.target === e.currentTarget) closeSetupModal(); }}>
        <div style={{ background: T.white, borderRadius: 22, padding: "28px 26px", maxWidth: 460, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,.22)", animation: "fadeUp .22s ease both" }}>

          {/* Modal header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: T.ink }}>
              {setupModal === "picker" ? "Setup your integration" : setupModal === "ordering" ? "🟦 Connect Square" : "📅 Connect resOS"}
            </div>
            <div onClick={closeSetupModal} style={{ cursor: "pointer", fontSize: 20, color: T.soft, lineHeight: 1, padding: "2px 8px" }}>✕</div>
          </div>

          {/* Step: Picker */}
          {setupModal === "picker" && !setupDone && (
            <div>
              <p style={{ fontSize: 13, color: T.soft, marginBottom: 20, lineHeight: 1.6 }}>Choose an integration to connect to your AI agent. You can set up multiple.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  onClick={() => { setSetupModal("ordering"); setSetupFields({}); setSetupError(null); }}
                  style={{ border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.p400; e.currentTarget.style.background = T.p50; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 48, height: 48, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🟦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>Ordering — Connect with your KDS</div>
                    <div style={{ fontSize: 12, color: T.soft, marginTop: 3 }}>Sync orders with Square Point of Sale</div>
                  </div>
                  {configuredSystems["Square"] && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "3px 9px", flexShrink: 0 }}>Connected</span>}
                  <span style={{ fontSize: 18, color: T.p500, flexShrink: 0 }}>→</span>
                </div>
                <div
                  onClick={() => { setSetupModal("reservation"); setSetupFields({}); setSetupError(null); }}
                  style={{ border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#F5F3FF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>Reservation — Connect with resOS</div>
                    <div style={{ fontSize: 12, color: T.soft, marginTop: 3 }}>Manage bookings and table reservations</div>
                  </div>
                  {configuredSystems["resOS"] && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "3px 9px", flexShrink: 0 }}>Connected</span>}
                  <span style={{ fontSize: 18, color: "#7C3AED", flexShrink: 0 }}>→</span>
                </div>
              </div>
            </div>
          )}

          {/* Step: Credentials form */}
          {(setupModal === "ordering" || setupModal === "reservation") && !setupDone && setupSystem && (
            <div>
              <p style={{ fontSize: 13, color: T.soft, marginBottom: 20, lineHeight: 1.6 }}>
                Enter your <strong>{setupSystem.name}</strong> credentials. You can find these in your{" "}
                {setupModal === "ordering" ? "Square Developer Dashboard" : "resOS account settings"}.
              </p>
              {setupSystem.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: T.soft, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".3px" }}>{f.label}</label>
                  <input value={setupFields[f.key] || ""} onChange={e => { setSetupFields(v => ({ ...v, [f.key]: e.target.value })); setSetupError(null); }} placeholder={f.ph} className="form-input" style={{ marginTop: 0 }} />
                </div>
              ))}
              {setupError && (
                <div style={{ fontSize: 12, color: T.red, background: T.redBg, border: `1px solid #fecaca`, borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{setupError}</div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={() => { setSetupModal("picker"); setSetupError(null); }}
                  style={{ flex: 1, border: `1.5px solid ${T.line}`, background: "transparent", borderRadius: 12, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: T.soft, fontFamily: "'Outfit',sans-serif" }}>← Back</button>
                <button onClick={handleSetupConnect} disabled={setupLoading} className="btn-primary" style={{ flex: 2, justifyContent: "center", fontSize: 13, padding: "11px" }}>
                  {setupLoading ? "Connecting…" : `Connect ${setupSystem.name} →`}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {setupDone && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: 17, color: T.ink, marginBottom: 8 }}>{setupDone} connected!</div>
              <div style={{ fontSize: 13, color: T.soft, marginBottom: 28, lineHeight: 1.6 }}>
                {setupDone === "resOS" ? "Reservation management is now linked to your agent." : "Order sync with your KDS is now active."}
                <br />You can still set up your other integration below.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => { setSetupDone(null); setSetupModal("picker"); setSetupFields({}); }}
                  style={{ border: `1.5px solid ${T.line}`, background: "transparent", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: T.mid, fontFamily: "'Outfit',sans-serif" }}>
                  Set up another integration
                </button>
                <button onClick={closeSetupModal} className="btn-primary" style={{ justifyContent: "center", fontSize: 13, padding: "12px" }}>
                  Back to import menu →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  );
}
