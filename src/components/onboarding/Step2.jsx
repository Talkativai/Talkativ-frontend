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
  const [selected, setSelected] = useState(null);
  const searchTimerRef = useRef(null);

  // Editable fields (filled from search or manually)
  const [bizName, setBizName] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizHours, setBizHours] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [editing, setEditing] = useState(false);

  // Country & currency
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

  const handleSelectCountry = (c) => {
    setCountry(c.name);
    setCurrency(c.currency);
    setCountrySearch(c.name);
    setShowCountryDropdown(false);
  };

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

  const handleSearch = async (query) => {
    const q = (query || searchQuery).trim();
    if (!q || q.length < 2) return;
    setSearching(true);
    setShowResults(false);
    setSelected(null);
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
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (val.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => handleSearch(val), 600);
    }
  };

  const handleSelect = (biz) => {
    setSelected(biz);
    setBizName(biz.name);
    setBizAddress(biz.address);
    setBizHours(biz.hours);
    setBizPhone(biz.phone);
    setBizCategory(biz.category);
    setShowResults(false);
    setEditing(false);
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

  const shortHours = (h) => {
    if (!h) return "";
    if (h.length < 40) return h;
    const parts = h.split(",").map(s => s.trim());
    if (parts.length <= 2) return parts.join(", ");
    return parts[0] + " … " + parts[parts.length - 1];
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
      <p className="ob-subheading">Search your business name and we'll pull your address, hours, and category from Google automatically.</p>

      {/* Search Input */}
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
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && !selected && (
        <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 14, overflow: "hidden", marginBottom: 20, boxShadow: `0 8px 24px rgba(134,87,255,.08)` }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.line}`, fontSize: 11, fontWeight: 600, color: T.soft, textTransform: "uppercase", letterSpacing: ".5px" }}>
            {results.length} result{results.length > 1 ? "s" : ""} found
          </div>
          {results.map((biz, i) => (
            <div
              key={biz.placeId || i}
              onClick={() => handleSelect(biz)}
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

      {/* No Results Message */}
      {showResults && results.length === 0 && !searching && (
        <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "20px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>No results found</div>
          <div style={{ fontSize: 13, color: T.soft }}>Try a different search or fill in the details manually below.</div>
          <button
            onClick={() => { setSelected({ manual: true }); setBizName(searchQuery); setEditing(true); }}
            style={{ marginTop: 12, background: T.p600, color: "white", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
          >
            Fill in manually →
          </button>
        </div>
      )}

      {/* Selected Business — Display Card + Editable Fields */}
      {selected && (
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
                <div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink }}>Edit your details</div>
              )}
            </div>
            {!editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, color: T.green }}>✓ Found</div>
                <div onClick={() => setEditing(true)} style={{ fontSize: 12, color: T.p600, cursor: "pointer", fontWeight: 600 }}>Edit ✏️</div>
              </div>
            ) : (
              <div onClick={() => setEditing(false)} style={{ fontSize: 12, color: T.green, cursor: "pointer", fontWeight: 600 }}>Done ✓</div>
            )}
          </div>

          {!editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {[["📍", "Address", bizAddress], ["🕐", "Hours", shortHours(bizHours)], ["📞", "Phone", bizPhone || "Not found"], ["🌐", "Category", bizCategory || "Not found"]].map(([ic, l, v]) => (
                <div key={l} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: T.soft, marginBottom: 3 }}>{ic} {l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{v || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="form-group"><label className="form-label">Business name</label><input className="form-input" value={bizName} onChange={e => setBizName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={bizAddress} onChange={e => setBizAddress(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={bizCategory} onChange={e => setBizCategory(e.target.value)} placeholder="e.g. Pizza Restaurant" /></div>
            </div>
          )}
        </div>
      )}

      {/* ────── Country Dropdown ────── */}
      <div style={{ marginTop: 24 }} ref={countryRef}>
        <div className="form-group">
          <label className="form-label">Country</label>
          <div style={{ position: "relative" }}>
            <input
              className="form-input"
              placeholder="Start typing your country…"
              value={countrySearch}
              onChange={e => {
                setCountrySearch(e.target.value);
                setShowCountryDropdown(true);
                if (!e.target.value.trim()) {
                  setCountry("");
                  setCurrency("");
                }
              }}
              onFocus={() => setShowCountryDropdown(true)}
              style={{ paddingLeft: country ? 40 : undefined }}
            />
            {/* Flag on the left if a country is selected */}
            {country && (() => {
              const found = COUNTRIES.find(c => c.name === country);
              return found ? (
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none", lineHeight: 1 }}>
                  {getFlag(found.code)}
                </div>
              ) : null;
            })()}

            {/* Dropdown */}
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 14,
                boxShadow: "0 12px 36px rgba(134,87,255,.12)", maxHeight: 220, overflowY: "auto",
                zIndex: 100,
              }}>
                {filteredCountries.map(c => (
                  <div
                    key={c.code}
                    onClick={() => handleSelectCountry(c)}
                    style={{
                      padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer", transition: "background .12s", fontSize: 14,
                      borderBottom: `1px solid ${T.line}`,
                      background: country === c.name ? T.p50 : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.paper}
                    onMouseLeave={e => e.currentTarget.style.background = country === c.name ? T.p50 : "transparent"}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{getFlag(c.code)}</span>
                    <span style={{ flex: 1, fontWeight: 500, color: T.ink }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: T.soft, fontWeight: 600 }}>{c.currency} ({c.currencySymbol})</span>
                  </div>
                ))}
              </div>
            )}

            {showCountryDropdown && countrySearch.trim() && filteredCountries.length === 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 14,
                boxShadow: "0 12px 36px rgba(134,87,255,.12)", padding: "16px 20px", textAlign: "center",
                zIndex: 100,
              }}>
                <div style={{ fontSize: 13, color: T.soft }}>No country found matching "{countrySearch}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Currency badge */}
        {country && currency && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginTop: 10,
            background: T.p50, border: `1.5px solid ${T.p100}`, borderRadius: 12,
            padding: "10px 16px", animation: "fadeUp .25s ease both",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              {(() => { const found = COUNTRIES.find(c => c.name === country); return found ? found.currencySymbol : "💱"; })()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.p700 }}>Currency auto-detected</div>
              <div style={{ fontSize: 11.5, color: T.mid }}>{currency} — based on {country}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.green }}>✓</div>
          </div>
        )}
      </div>

      {/* Working Hours Schedule */}
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
