import { useState, useRef, useEffect, useCallback } from "react";
import "react-phone-number-input/style.css";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";
import COUNTRIES, { getFlag } from "../../utils/countries.js";

// Required fields for the business details form
const REQUIRED = ["bizName", "bizAddress", "bizPhone", "bizCategory", "country"];

export default function Step2({ onNext, onBack, onBizNameChange, onBizPhoneChange, onHoursFound }) {
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
  const [formError, setFormError] = useState(null);

  // Country & currency
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");

  // IP-based detection — used as initial country for the phone flag
  const [ipCountryCode, setIpCountryCode] = useState("US"); // 2-letter ISO for PhoneInput
  const [phoneCountry, setPhoneCountry] = useState("US"); // controlled country for PhoneInput flag

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setIpCountryCode(data.country_code);
          setPhoneCountry(data.country_code);
          // Pre-fill the calling code so user sees e.g. "+234" immediately (only if empty)
          try {
            const code = getCountryCallingCode(data.country_code);
            setBizPhone(prev => prev ? prev : `+${code}`);
          } catch {}
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

  // Whether hours were auto-found from search
  const [hoursFromSearch, setHoursFromSearch] = useState(false);
  const [showScheduleOverride, setShowScheduleOverride] = useState(false);

  // Photo viewer state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

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

  // Try to set country+currency from a biz result. Returns true if country was found.
  const applyCountry = (nameOrCode, isCode = false) => {
    const found = isCode
      ? COUNTRIES.find(c => c.code === nameOrCode.toUpperCase())
      : COUNTRIES.find(c => c.name.toLowerCase() === nameOrCode.toLowerCase());
    if (found) {
      setCountry(found.name);
      setCurrency(found.currency);
      setCurrencySymbol(found.currencySymbol);
      return true;
    }
    return false;
  };

  // Apply country from IP as fallback
  const applyCountryFromIp = () => {
    if (ipCountryCode) applyCountry(ipCountryCode, true);
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
    setFormError(null);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (val.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => handleSearch(val), 250);
    }
  };

  const handleResultClick = (biz) => {
    setPendingBiz(biz);
    setShowResults(false);
    setView('map');
    setActivePhotoIdx(0);
  };

  const handleConfirm = () => {
    const biz = pendingBiz;

    // Set all fields from result
    setSelected(biz);
    setBizName(biz.name || "");
    setBizAddress(biz.address || "");
    setBizHours(biz.hours || "");
    setBizPhone(biz.phone || "");
    setBizCategory(biz.category || "");

    // Sync phone flag country with business country
    if (biz.countryCode) setPhoneCountry(biz.countryCode);
    else if (ipCountryCode) setPhoneCountry(ipCountryCode);

    // Detect country from biz result, fall back to IP
    let countryFound = false;
    if (biz.countryCode) countryFound = applyCountry(biz.countryCode, true);
    if (!countryFound && biz.country) countryFound = applyCountry(biz.country, false);
    if (!countryFound) applyCountryFromIp(); // auto-fill from IP

    // If hours were found from search, flag it and bubble up to parent
    if (biz.hours && biz.hours.trim().length > 0) {
      setHoursFromSearch(true);
      setShowScheduleOverride(false);
      if (onHoursFound) onHoursFound(biz.hours);
    } else {
      setHoursFromSearch(false);
      if (onHoursFound) onHoursFound(null);
    }

    setView('confirmed');
    setPendingBiz(null);

    // Auto-open edit if any required field is missing
    const needsEdit = !biz.phone || !biz.category || (!biz.countryCode && !biz.country);
    setEditing(needsEdit);
    setFormError(null);
  };

  const handleNotMine = () => {
    setView('search');
    setShowResults(true);
    setPendingBiz(null);
  };

  const enterManual = () => {
    setSelected({ manual: true });
    setBizName(searchQuery);
    setBizAddress("");
    setBizPhone("");
    setBizCategory("");
    applyCountryFromIp();
    setEditing(true);
    setView('confirmed');
    setShowResults(false);
    setPendingBiz(null);
    setFormError(null);
    setHoursFromSearch(false);
  };

  // Country autocomplete state
  const [countryQuery, setCountryQuery] = useState("");
  const [countryDropdown, setCountryDropdown] = useState([]);
  const countryInputRef = useRef(null);

  // Sync the text input with the confirmed country value
  useEffect(() => { setCountryQuery(country); }, [country]);

  const handleCountryInput = (val) => {
    setCountryQuery(val);
    if (val.trim().length < 1) {
      setCountryDropdown([]);
      setCountry("");
      setCurrency("");
      setCurrencySymbol("");
      return;
    }
    const lower = val.toLowerCase();
    setCountryDropdown(
      COUNTRIES.filter(c => c.name.toLowerCase().startsWith(lower) || c.name.toLowerCase().includes(lower)).slice(0, 8)
    );
  };

  const selectCountry = (c) => {
    setCountry(c.name);
    setCurrency(c.currency);
    setCurrencySymbol(c.currencySymbol);
    setCountryQuery(c.name);
    setCountryDropdown([]);
  };

  // Change country + auto-update currency (legacy helper, kept for applyCountry)
  const handleCountryChange = (val) => {
    setCountry(val);
    const found = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (found) {
      setCurrency(found.currency);
      setCurrencySymbol(found.currencySymbol);
    }
  };

  // Validate & proceed
  const handleNext = async () => {
    const missing = [];
    if (!bizName.trim()) missing.push("Business name");
    if (!bizAddress.trim()) missing.push("Address");
    if (!bizPhone || !bizPhone.trim()) missing.push("Phone number");
    if (!bizCategory.trim()) missing.push("Category");
    if (!country.trim()) missing.push("Country");

    if (missing.length > 0) {
      setFormError(`Please fill in: ${missing.join(", ")}`);
      if (view === 'confirmed') setEditing(true);
      return;
    }

    setFormError(null);

    // Build the opening hours payload
    // If hours were found from search and user didn't override, save the search hours as a string
    const openingHoursPayload = hoursFromSearch && !showScheduleOverride
      ? { searchHours: bizHours, is24h: "false" }
      : buildOpeningHours();

    try {
      await api.settings.updateBusiness({
        name: bizName,
        type: bizCategory,
        address: bizAddress,
        phone: bizPhone,
        country: country,
        currency: currency,
        openingHours: openingHoursPayload,
      });
    } catch {}
    if (onBizNameChange) onBizNameChange(bizName);
    if (onBizPhoneChange) onBizPhoneChange(bizPhone);
    onNext();
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

  const osmEmbedUrl = (lat, lng) => {
    if (!lat && !lng) return null;
    const delta = 0.004;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  // Which fields are still missing (for the incomplete banner)
  const missingFields = view === 'confirmed' && selected ? [
    !bizName.trim() && "Business name",
    !bizAddress.trim() && "Address",
    !bizPhone?.trim() && "Phone number",
    !bizCategory.trim() && "Category",
    !country.trim() && "Country",
  ].filter(Boolean) : [];

  return (
    <ObShell step={2} onNext={handleNext} onBack={onBack} nextLabel="Looks good →">
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
            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.soft, fontWeight: 600, pointerEvents: "none" }}>
              <div style={{ width: 14, height: 14, border: `2px solid ${T.p300}`, borderTopColor: T.p600, borderRadius: "50%", animation: "spin .6s linear infinite" }} />
              Searching…
            </div>
          )}
        </div>
        {(showResults || view === 'map') && view !== 'confirmed' && (
          <button
            onClick={enterManual}
            style={{ marginTop: 8, background: "none", border: "none", padding: 0, fontSize: 12, color: T.p600, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
          >
            Can't find it? Fill in manually →
          </button>
        )}
      </div>

      {/* ── Search Results (autocomplete style) ──────────────────────────── */}
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
              {/* Thumbnail from photos or emoji fallback */}
              {biz.photos && biz.photos.length > 0 ? (
                <div style={{ width: 40, height: 40, borderRadius: 11, overflow: "hidden", flexShrink: 0 }}>
                  <img src={biz.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = `linear-gradient(135deg,${T.p400},${T.p700})`; e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:18px">${emojiForCategory(biz.category)}</div>`; }} />
                </div>
              ) : (
                <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {emojiForCategory(biz.category)}
                </div>
              )}
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

      {/* ── Inline Map + Photos Confirmation ─────────────────────────────── */}
      {view === 'map' && pendingBiz && (
        <div style={{ marginBottom: 20, animation: "fadeUp .25s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {/* Thumbnail photo or emoji */}
            {pendingBiz.photos && pendingBiz.photos.length > 0 ? (
              <div style={{ width: 40, height: 40, borderRadius: 11, overflow: "hidden", flexShrink: 0 }}>
                <img src={pendingBiz.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {emojiForCategory(pendingBiz.category)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: T.ink }}>{pendingBiz.name}</div>
              <div style={{ fontSize: 12, color: T.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingBiz.address}</div>
            </div>
          </div>

          {/* Map + Photos side by side (Google Maps style) */}
          <div style={{ display: "grid", gridTemplateColumns: pendingBiz.photos?.length > 0 ? "1fr 1fr" : "1fr", gap: 0, marginBottom: 12, borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.line}` }}>
            {/* Map panel */}
            <div style={{ height: 200, background: T.paper, position: "relative" }}>
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
                  <span style={{ fontSize: 13 }}>Map not available</span>
                </div>
              )}
              {/* Expand icon overlay (decorative) */}
              {pendingBiz.lat && pendingBiz.lng && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 1px 4px rgba(0,0,0,.15)", cursor: "pointer" }}
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${pendingBiz.lat}&mlon=${pendingBiz.lng}#map=17/${pendingBiz.lat}/${pendingBiz.lng}`, '_blank')}
                  title="Open in OpenStreetMap"
                >
                  ↗
                </div>
              )}
            </div>

            {/* Photos gallery panel */}
            {pendingBiz.photos && pendingBiz.photos.length > 0 && (
              <div style={{ height: 200, position: "relative", background: T.paper }}>
                <img
                  src={pendingBiz.photos[activePhotoIdx] || pendingBiz.photos[0]}
                  alt={`${pendingBiz.name} photo`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Navigation arrows for multiple photos */}
                {pendingBiz.photos.length > 1 && (
                  <>
                    <div
                      onClick={() => setActivePhotoIdx(p => p > 0 ? p - 1 : pendingBiz.photos.length - 1)}
                      style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.45)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", backdropFilter: "blur(4px)", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.7)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,.45)"}
                    >
                      ‹
                    </div>
                    <div
                      onClick={() => setActivePhotoIdx(p => p < pendingBiz.photos.length - 1 ? p + 1 : 0)}
                      style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.45)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", backdropFilter: "blur(4px)", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.7)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,.45)"}
                    >
                      ›
                    </div>
                  </>
                )}
                {/* Photo dots */}
                {pendingBiz.photos.length > 1 && (
                  <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                    {pendingBiz.photos.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        style={{
                          width: idx === activePhotoIdx ? 18 : 7,
                          height: 7,
                          borderRadius: 4,
                          background: idx === activePhotoIdx ? "white" : "rgba(255,255,255,.5)",
                          cursor: "pointer",
                          transition: "all .2s",
                          boxShadow: "0 1px 4px rgba(0,0,0,.3)",
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* See photos label */}
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.6)", color: "white", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 4 }}>
                  📷 See photos
                </div>
              </div>
            )}
          </div>

          {/* Bottom photo strip — shows small thumbnails like Google Maps "See photos" / "See outside" */}
          {pendingBiz.photos && pendingBiz.photos.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {pendingBiz.photos.slice(0, 4).map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: `2px solid ${idx === activePhotoIdx ? T.p500 : "transparent"}`,
                    transition: "border-color .15s",
                    position: "relative",
                  }}
                >
                  <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.parentElement.style.display = "none"; }} />
                  {idx === 0 && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2px 6px", background: "rgba(0,0,0,.55)", fontSize: 9, fontWeight: 600, color: "white", textAlign: "center" }}>See photos</div>
                  )}
                  {idx === 1 && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2px 6px", background: "rgba(0,0,0,.55)", fontSize: 9, fontWeight: 600, color: "white", textAlign: "center" }}>See outside</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags: category, phone, hours */}
          {(pendingBiz.category || pendingBiz.phone || pendingBiz.hours) && (
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
              {pendingBiz.hours && (
                <span style={{ background: T.greenBg || "#f0fdf4", border: `1.5px solid ${T.greenBd || "#bbf7d0"}`, color: T.green || "#16a34a", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500 }}>
                  ⏰ Hours found
                </span>
              )}
            </div>
          )}

          {/* Missing data notice */}
          {(!pendingBiz.phone || !pendingBiz.category) && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#92400e", fontWeight: 500 }}>
              ⚠️ Some details weren't found — you'll fill them in after confirming.
            </div>
          )}

          <button
            onClick={handleConfirm}
            style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg,${T.p500},${T.p700})`, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: 8 }}
          >
            ✓ This is my business
          </button>
          <button
            onClick={handleNotMine}
            style={{ width: "100%", padding: "10px", background: "transparent", color: T.soft, border: `1.5px solid ${T.line}`, borderRadius: 12, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}
          >
            Not my business — go back
          </button>
        </div>
      )}

      {/* ── Confirmed Business Card ──────────────────────────────────────── */}
      {view === 'confirmed' && selected && (
        <div className="info-block" style={{ animation: "fadeUp .3s ease both" }}>

          {/* Incomplete fields banner */}
          {missingFields.length > 0 && !editing && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#92400e", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚠️</span>
              <span>Missing: <strong>{missingFields.join(", ")}</strong> — please edit to complete.</span>
            </div>
          )}

          {/* Form error */}
          {formError && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#991b1b", fontWeight: 500 }}>
              ⚠️ {formError}
            </div>
          )}

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
                  {selected.manual ? "Enter your details" : "Complete your details"}
                </div>
              )}
            </div>
            {!editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {missingFields.length === 0
                  ? <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, color: T.green }}>{selected.manual ? "✎ Manual" : "✓ Found"}</div>
                  : <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, color: "#92400e" }}>⚠ Incomplete</div>
                }
                <div onClick={() => { setEditing(true); setFormError(null); }} style={{ fontSize: 12, color: T.p600, cursor: "pointer", fontWeight: 600 }}>Edit ✏️</div>
              </div>
            ) : (
              <div onClick={() => setEditing(false)} style={{ fontSize: 12, color: T.green, cursor: "pointer", fontWeight: 600 }}>Done ✓</div>
            )}
          </div>

          {/* ── Read-only view ── */}
          {!editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                {[
                  ["📍", "Address", bizAddress],
                  ["📞", "Phone", bizPhone || null],
                  ["🌐", "Category", bizCategory || null],
                  ["🗺️", "Country", country || null],
                ].map(([ic, l, v]) => (
                  <div
                    key={l}
                    onClick={() => { setEditing(true); setFormError(null); }}
                    style={{ background: T.white, border: `1.5px solid ${v ? T.line : "#fde68a"}`, borderRadius: 11, padding: "10px 14px", cursor: !v ? "pointer" : "default", position: "relative" }}
                  >
                    <div style={{ fontSize: 11, color: T.soft, marginBottom: 3 }}>{ic} {l}</div>
                    {v
                      ? <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{v}</div>
                      : <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>Required — tap to add</div>
                    }
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
            /* ── Edit form ── */
            <div>
              <style>{`
                .PhoneInputInput {
                  flex: 1;
                  min-width: 0;
                  border: none;
                  background: transparent;
                  font-size: 15px;
                  outline: none;
                  color: inherit;
                  padding-left: 8px;
                  font-family: 'Outfit', sans-serif;
                }
                .PhoneInputCountry { margin-right: 4px; }
              `}</style>

              <div className="form-group">
                <label className="form-label">Business name <span style={{ color: T.red }}>*</span></label>
                <input className="form-input" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Tony's Pizzeria" style={{ borderColor: !bizName.trim() ? "#fca5a5" : undefined }} />
              </div>

              <div className="form-group">
                <label className="form-label">Address <span style={{ color: T.red }}>*</span></label>
                <input className="form-input" value={bizAddress} onChange={e => setBizAddress(e.target.value)} placeholder="123 Main St, City, Country" style={{ borderColor: !bizAddress.trim() ? "#fca5a5" : undefined }} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone number <span style={{ color: T.red }}>*</span></label>
                <PhoneInput
                  className="form-input"
                  international
                  country={phoneCountry}
                  onCountryChange={c => setPhoneCountry(c || "US")}
                  value={bizPhone}
                  onChange={val => setBizPhone(val || "")}
                  style={{ fontSize: 15, padding: "10px 14px", display: "flex", alignItems: "center", borderColor: !bizPhone?.trim() ? "#fca5a5" : undefined }}
                />
                {!bizPhone?.trim() && (
                  <div style={{ fontSize: 11.5, color: "#d97706", marginTop: 4, fontWeight: 500 }}>Required — enter your business phone</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Category <span style={{ color: T.red }}>*</span></label>
                <input className="form-input" value={bizCategory} onChange={e => setBizCategory(e.target.value)} placeholder="e.g. Pizza Restaurant" style={{ borderColor: !bizCategory.trim() ? "#fca5a5" : undefined }} />
              </div>

              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Country <span style={{ color: T.red }}>*</span></label>
                <input
                  ref={countryInputRef}
                  className="form-input"
                  value={countryQuery}
                  placeholder="e.g. United Kingdom"
                  onChange={e => handleCountryInput(e.target.value)}
                  onBlur={() => setTimeout(() => setCountryDropdown([]), 150)}
                  style={{ borderColor: !country.trim() ? "#fca5a5" : undefined }}
                  autoComplete="off"
                />
                {/* Country dropdown */}
                {countryDropdown.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: T.white, border: `1.5px solid ${T.p200}`, borderRadius: 12, zIndex: 100, boxShadow: "0 8px 24px rgba(134,87,255,.12)", overflow: "hidden", marginTop: 4 }}>
                    {countryDropdown.map(c => (
                      <div
                        key={c.code}
                        onMouseDown={() => selectCountry(c)}
                        style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, borderBottom: `1px solid ${T.line}`, transition: "background .12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = T.paper}
                        onMouseLeave={e => e.currentTarget.style.background = T.white}
                      >
                        <span style={{ fontWeight: 600, color: T.ink }}>{c.name}</span>
                        <span style={{ fontSize: 11.5, color: T.soft, fontWeight: 500 }}>{c.currencySymbol} {c.currency}</span>
                      </div>
                    ))}
                  </div>
                )}
                {country && currency ? (
                  <div style={{ fontSize: 11.5, color: T.p600, marginTop: 4, fontWeight: 600 }}>
                    {currencySymbol} {currency} detected
                  </div>
                ) : countryQuery && !country ? (
                  <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>Select a country from the list</div>
                ) : (
                  <div style={{ fontSize: 11.5, color: "#d97706", marginTop: 4, fontWeight: 500 }}>Required — enter your country</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Validation error (shown below the card too) ──────────────────── */}
      {formError && view === 'confirmed' && !editing && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginTop: 8, fontSize: 12, color: "#991b1b", fontWeight: 500 }}>
          ⚠️ {formError}
        </div>
      )}

      {/* ── Working Hours Schedule ───────────────────────────────────────── */}
      {/* When hours are found from search, show a compact confirmation banner.
          The full manual schedule editor is in Step4 (Agent schedule).
          Only show the manual editor here if NO hours were auto-detected. */}
      {hoursFromSearch && !showScheduleOverride ? (
        <div style={{ marginTop: 28, animation: "fadeUp .3s ease both" }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.greenBg || "#f0fdf4"}, #ecfdf5)`,
            border: `1.5px solid ${T.greenBd || "#bbf7d0"}`,
            borderRadius: 16,
            padding: "20px 22px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative corner */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,.08)" }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `linear-gradient(135deg, #22c55e, #16a34a)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0, boxShadow: "0 4px 12px rgba(34,197,94,.25)",
              }}>
                ⏰
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
                  ✓ Business hours found automatically
                </div>
                <div style={{ fontSize: 12.5, color: T.mid, lineHeight: 1.5 }}>
                  {bizHours}
                </div>
                <div style={{ fontSize: 11, color: T.soft, marginTop: 6, fontStyle: "italic" }}>
                  These will be saved as your business working hours. You can set your AI agent's schedule on the next screen.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowScheduleOverride(true);
                setHoursFromSearch(false);
              }}
              style={{
                marginTop: 14, background: "transparent", border: `1.5px solid ${T.greenBd || "#bbf7d0"}`,
                borderRadius: 10, padding: "7px 16px", fontSize: 12, fontWeight: 600,
                color: T.green || "#16a34a", cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              ✏️ Edit hours manually instead
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 28, animation: "fadeUp .3s ease both" }}>
          <div style={{ fontSize: 13, color: T.soft, marginBottom: 4 }}>When are you open?</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Set your business working hours</div>

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
              Your business will be marked as available around the clock.
            </div>
          )}
        </div>
      )}

      {/* Spinner keyframe for search */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </ObShell>
  );
}
