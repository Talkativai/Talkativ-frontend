import { useState, useRef, useEffect } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";
import COUNTRIES, { getFlag } from "../../utils/countries.js";

export default function Step2({ onNext, onBack, onBizNameChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimerRef = useRef(null);

  // View state: 'search' | 'map' | 'confirmed'
  const [view, setView] = useState('search');
  const [pendingBiz, setPendingBiz] = useState(null);

  // Confirmed business fields
  const [selected, setSelected] = useState(null);
  const [bizName, setBizName] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizHours, setBizHours] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [editing, setEditing] = useState(false);

  // Country & currency (auto-detected from result or IP)
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");

  // IP-based country detection
  const [ipCallingCode, setIpCallingCode] = useState("");
  const [ipCountryCode, setIpCountryCode] = useState("");

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) setIpCountryCode(data.country_code);
        if (data.country_calling_code) setIpCallingCode(data.country_calling_code);
        if (data.country_name) {
          const found = COUNTRIES.find(c => c.code === data.country_code);
          if (found && !country) setIpCountryCode(found.code);
        }
      })
      .catch(() => {});
  }, []);

  // Schedule state
  const [is24h, setIs24h] = useState(false);
  const [schedule, setSchedule] = useState({
    mon: { open: false, openTime: "09:00", closeTime: "17:00" },
    tue: { open: false, openTime: "09:00", closeTime: "17:00" },
    wed: { open: false, openTime: "09:00", closeTime: "17:00" },
    thu: { open: false, openTime: "09:00", closeTime: "17:00" },
    fri: { open: false, openTime: "09:00", closeTime: "17:00" },
    sat: { open: false, openTime: "09:00", closeTime: "17:00" },
    sun: { open: false, openTime: "09:00", closeTime: "17:00" },
  });

  const toggleDay = (day) => setSchedule(prev => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }));
  const updateTime = (day, field, value) => setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

  const buildOpeningHours = () => {
    if (is24h) return { is24h: "true" };
    const result = { is24h: "false" };
    Object.entries(schedule).forEach(([day, val]) => {
      result[day] = val.open ? `${val.openTime}-${val.closeTime}` : "closed";
    });
    return result;
  };

  const detectCountry = (biz) => {
    let found = null;
    if (biz.countryCode) found = COUNTRIES.find(c => c.code === biz.countryCode.toUpperCase());
    if (!found && biz.country) found = COUNTRIES.find(c => c.name.toLowerCase() === biz.country.toLowerCase());
    if (found) {
      setCountry(found.name);
      setCurrency(found.currency);
      setCurrencySymbol(found.currencySymbol);
    }
  };

  const handleSearch = async (query) => {
    const q = (query || searchQuery).trim();
    if (!q || q.length < 2) return;
    setSearching(true);
    setShowResults(false);
    setSelected(null);
    setView('search');
    setPendingBiz(null);
    try {
      const data = await api.public.searchBusiness(q);
      setResults(data.results || []);
      setShowResults(true);
    } catch {
      setResults([]);
      setShowResults(true);
    }
    setSearching(false);
  };

  const handleSearchQueryChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelected(null);
    setShowResults(false);
    setView('search');
    setPendingBiz(null);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (val.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => handleSearch(val), 600);
    }
  };

  // User clicks a result → show inline map
  const handleResultClick = (biz) => {
    setPendingBiz(biz);
    setShowResults(false);
    setView('map');
  };

  // User confirms on inline map
  const handleConfirm = () => {
    const biz = pendingBiz;
    setSelected(biz);
    setBizName(biz.name);
    setBizAddress(biz.address);
    setBizHours(biz.hours);
    setBizPhone(biz.phone);
    setBizCategory(biz.category);
    detectCountry(biz);
    setEditing(false);
    setView('confirmed');
    setPendingBiz(null);
  };

  // User rejects → back to search results
  const handleNotMine = () => {
    setView('search');
    setShowResults(true);
    setPendingBiz(null);
  };

  // Switch to manual entry
  const enterManual = () => {
    setSelected({ manual: true });
    setBizName(searchQuery);
    setEditing(true);
    setView('confirmed');
    setShowResults(false);
    setPendingBiz(null);
    if (ipCallingCode && !bizPhone) setBizPhone(`+${ipCallingCode.replace('+', '')} `);
    if (ipCountryCode && !country) {
      const found = COUNTRIES.find(c => c.code === ipCountryCode);
      if (found) { setCountry(found.name); setCurrency(found.currency); setCurrencySymbol(found.currencySymbol); }
    }
  };

  const emojiForCategory = (cat) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("pizza")) return "🍕";
    if (c.includes("sushi") || c.includes("japanese")) return "🍣";
    if (c.includes("indian") || c.includes("curry")) return "🍛";
    if (c.includes("chinese") || c.includes("thai") || c.includes("asian")) return "🥡";
    if (c.includes("mexican") || c.includes("taco")) return "🌮";
    if (c.includes("burger") || c.includes("fast food")) return "🍔";
    if (c.includes("coffee") || c.includes("cafe") || c.includes("café")) return "☕";
    if (c.includes("bakery") || c.includes("pastry")) return "🧁";
    if (c.includes("bar") || c.includes("pub")) return "🍺";
    if (c.includes("seafood") || c.includes("fish")) return "🐟";
    return "🍽️";
  };

  // Build OSM embed URL from lat/lng
  const osmEmbedUrl = (lat, lng) => {
    if (!lat && !lng) return null;
    const delta = 0.004;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  return (
    <ObShell step={2} onNext={async () => {
      if (!bizName.trim()) return;
      try {
        await api.settings.updateBusiness({
          name: bizName,
          type: bizCategory,
          address: bizAddress,
          phone: bizPhone,
          country: country,
          currency: currency,
          openingHours: buildOpeningHours(),
        });
      } catch {}
      if (onBizNameChange) onBizNameChange(bizName);
      onNext();
    }} onBack={onBack} nextLabel="Looks good →">
      <div className="ob-step-label">Step 3 · Business profile</div>
      <h1 className="ob-heading">Tell us about<br /><em>your business</em></h1>
      <p className="ob-subheading">Search your business name and we'll pull your address and details automatically.</p>

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Business name</label>
        <div style={{ position: "relative" }}>
          <input
            className="form-input"
            placeholder="e.g. Tony's Pizzeria"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            style={{ paddingRight: searching ? 110 : undefined }}
          />
          {searching && (
            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.soft, fontWeight: 600, pointerEvents: "none" }}>
              ⏳ Searching...
            </div>
          )}
        </div>
        {/* Can't find it link — visible once a search has been done */}
        {(showResults || view === 'map') && view !== 'confirmed' && (
          <button
            onClick={enterManual}
            style={{ marginTop: 8, background: "none", border: "none", padding: 0, fontSize: 12, color: T.p600, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
          >
            Can't find it? Fill in manually →
          </button>
        )}
      </div>

      {/* ── Search Results ───────────────────────────────────────────────── */}
      {showResults && results.length > 0 && view === 'search' && (
        <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 14, overflow: "hidden", marginBottom: 20, boxShadow: `0 8px 24px rgba(134,87,255,.08)` }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}`, fontSize: 11, fontWeight: 600, color: T.soft, textTransform: "uppercase", letterSpacing: ".5px" }}>
            {results.length} result{results.length > 1 ? "s" : ""} found — select your business
          </div>
          {results.map((biz, i) => (
            <div
              key={biz.placeId || i}
              onClick={() => handleResultClick(biz)}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: i < results.length - 1 ? `1px solid ${T.line}` : "none", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.paper}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {emojiForCategory(biz.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{biz.name}</div>
                <div style={{ fontSize: 12, color: T.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{biz.category ? `${biz.category} · ` : ""}{biz.address}</div>
              </div>
              <div style={{ fontSize: 12, color: T.p600, fontWeight: 600, flexShrink: 0 }}>Select →</div>
            </div>
          ))}
        </div>
      )}

      {/* ── No Results ───────────────────────────────────────────────────── */}
      {showResults && results.length === 0 && !searching && view === 'search' && (
        <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "20px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>No results found</div>
          <div style={{ fontSize: 13, color: T.soft }}>Try a different search or fill in your details manually.</div>
          <button
            onClick={enterManual}
            style={{ marginTop: 12, background: T.p600, color: "white", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
          >
            Fill in manually →
          </button>
        </div>
      )}

      {/* ── Inline Map Confirmation ──────────────────────────────────────── */}
      {view === 'map' && pendingBiz && (
        <div style={{ marginBottom: 20, animation: "fadeUp .25s ease both" }}>
          {/* Business name header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {emojiForCategory(pendingBiz.category)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.ink }}>{pendingBiz.name}</div>
              <div style={{ fontSize: 12, color: T.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingBiz.address}</div>
            </div>
          </div>

          {/* Small inline map */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.line}`, height: 200, marginBottom: 12, background: T.paper }}>
            {pendingBiz.lat && pendingBiz.lng ? (
              <iframe
                title="Business location"
                src={osmEmbedUrl(pendingBiz.lat, pendingBiz.lng)}
                style={{ width: "100%", height: "100%", border: "none" }}
                loading="lazy"
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: T.soft }}>
                <span style={{ fontSize: 28 }}>📍</span>
                <span style={{ fontSize: 13 }}>Map not available for this location</span>
              </div>
            )}
          </div>

          {/* Category + phone chips */}
          {(pendingBiz.category || pendingBiz.phone) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {pendingBiz.category && (
                <span style={{ background: T.paper, border: `1.5px solid ${T.line}`, color: T.mid, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
                  {emojiForCategory(pendingBiz.category)} {pendingBiz.category}
                </span>
              )}
              {pendingBiz.phone && (
                <span style={{ background: T.paper, border: `1.5px solid ${T.line}`, color: T.mid, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
                  📞 {pendingBiz.phone}
                </span>
              )}
            </div>
          )}

          {/* Confirm / reject buttons */}
          <button
            onClick={handleConfirm}
            style={{
              width: "100%", padding: "14px", background: `linear-gradient(135deg,${T.p500},${T.p700})`,
              color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: 8,
            }}
          >
            ✓ This is my business
          </button>
          <button
            onClick={handleNotMine}
            style={{
              width: "100%", padding: "10px", background: "transparent",
              color: T.soft, border: `1.5px solid ${T.line}`, borderRadius: 12,
              fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 500,
            }}
          >
            Not my business — go back
          </button>
        </div>
      )}

      {/* ── Confirmed Business Card ──────────────────────────────────────── */}
      {view === 'confirmed' && selected && (
        <div className="info-block" style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 46, height: 46, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {emojiForCategory(bizCategory)}
            </div>
            <div style={{ flex: 1 }}>
              {!editing ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink }}>{bizName}</div>
                  <div style={{ fontSize: 12, color: T.soft }}>{bizCategory ? `${bizCategory} · ` : ""}{bizAddress ? bizAddress.split(",").slice(-2).join(",").trim() : ""}</div>
                </>
              ) : (
                <div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink }}>
                  {selected.manual ? "Enter your details" : "Edit your details"}
                </div>
              )}
            </div>
            {!editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, color: T.green }}>
                  {selected.manual ? "✎ Manual" : "✓ Found"}
                </div>
                <div onClick={() => setEditing(true)} style={{ fontSize: 12, color: T.p600, cursor: "pointer", fontWeight: 600 }}>Edit ✏️</div>
              </div>
            ) : (
              <div onClick={() => setEditing(false)} style={{ fontSize: 12, color: T.green, cursor: "pointer", fontWeight: 600 }}>Done ✓</div>
            )}
          </div>

          {!editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                {[
                  ["📍", "Address", bizAddress],
                  ["📞", "Phone", bizPhone || "Not found"],
                  ["🌐", "Category", bizCategory || "Not found"],
                  ["🗺️", "Country", country || "Not detected"],
                ].map(([ic, l, v]) => (
                  <div key={l} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: T.soft, marginBottom: 3 }}>{ic} {l}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{v || "—"}</div>
                  </div>
                ))}
              </div>

              {country && currency && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, background: T.p50, border: `1.5px solid ${T.p100}`, borderRadius: 12, padding: "10px 16px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "white", fontWeight: 700 }}>
                    {currencySymbol}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.p700 }}>Currency auto-detected</div>
                    <div style={{ fontSize: 11.5, color: T.mid }}>{currency} — based on {country}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.green }}>✓</div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="form-group"><label className="form-label">Business name</label><input className="form-input" value={bizName} onChange={e => setBizName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={bizAddress} onChange={e => setBizAddress(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={bizPhone} onChange={e => setBizPhone(e.target.value)} placeholder="+1 234 567 8900" /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={bizCategory} onChange={e => setBizCategory(e.target.value)} placeholder="e.g. Pizza Restaurant" /></div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  className="form-input"
                  value={country}
                  placeholder="e.g. United Kingdom"
                  onChange={e => {
                    setCountry(e.target.value);
                    const found = COUNTRIES.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                    if (found) { setCurrency(found.currency); setCurrencySymbol(found.currencySymbol); }
                  }}
                />
                {country && currency && (
                  <div style={{ fontSize: 11.5, color: T.p600, marginTop: 4, fontWeight: 600 }}>
                    {currencySymbol} {currency} detected
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Working Hours Schedule ───────────────────────────────────────── */}
      <div style={{ marginTop: 28, animation: "fadeUp .3s ease both" }}>
        <div style={{ fontSize: 13, color: T.soft, marginBottom: 4 }}>When are you open?</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Set your working schedule</div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", userSelect: "none" }}
          onClick={() => setIs24h(v => !v)}>
          <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${is24h ? T.p600 : T.line}`, background: is24h ? T.p600 : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
            {is24h && <span style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>We operate 24/7</span>
        </label>

        {!is24h && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {[["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"],["sun","Sun"]].map(([key, label]) => {
              const day = schedule[key];
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

        {is24h && (
          <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: T.green, fontWeight: 600 }}>
            Your agent will let customers know you're available around the clock.
          </div>
        )}
      </div>
    </ObShell>
  );
}
