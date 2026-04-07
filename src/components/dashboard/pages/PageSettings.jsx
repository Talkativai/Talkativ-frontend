import { useState, useEffect, useRef } from 'react';
import "react-phone-number-input/style.css";
import PhoneInput, { parsePhoneNumber, getCountryCallingCode } from 'react-phone-number-input';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import { makeDefaultSchedule, buildHours, parseSchedule, VS_DAY_KEYS, VS_DAY_LABELS } from '../../../utils/schedule';
import ScheduleInlineEditor from '../../ScheduleInlineEditor';
import TopBar from '../TopBar';
import COUNTRIES, { getCurrencySymbol, getFlag } from '../../../utils/countries';

export default function PageSettings({ user, agentName, bizData, onBizNameChange }) {
  const [section, setSection] = useState("Business");

  // ── Phone country detection (IP-based, for flag display) ─────────────────
  const [bizPhoneCountry, setBizPhoneCountry] = useState('US');
  const [fwdPhoneCountry, setFwdPhoneCountry] = useState('US');
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        if (d.country_code) {
          setBizPhoneCountry(d.country_code);
          setFwdPhoneCountry(d.country_code);
          // Pre-fill calling codes if fields are still empty
          try {
            const code = getCountryCallingCode(d.country_code);
            setBizPhone(prev => prev ? prev : `+${code}`);
            setForwardNumber(prev => prev ? prev : `+${code}`);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // ── Business ──────────────────────────────────────────────────────────────
  const [bizName, setBizName] = useState('');
  const [bizType, setBizType] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizCountry, setBizCountry] = useState('');
  const [bizCurrency, setBizCurrency] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef(null);
  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;
  const currencySymbol = getCurrencySymbol(bizCurrency || bizData?.currency);
  const [savingBiz, setSavingBiz] = useState(false);
  // Business schedule
  const [biz24h,   setBiz24h]   = useState(false);
  const [bizSched, setBizSched] = useState(makeDefaultSchedule());
  const [bizSearchHours, setBizSearchHours] = useState(''); // auto-found from search

  // ── Ordering ──────────────────────────────────────────────────────────────
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  const [radiusUnit, setRadiusUnit] = useState('miles');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [collectionEnabled, setCollectionEnabled] = useState(false);
  const [collectionPayNow, setCollectionPayNow] = useState(false);
  const [collectionPayOnPickup, setCollectionPayOnPickup] = useState(false);
  const [deliveryPayNow, setDeliveryPayNow] = useState(false);
  const [deliveryPayOnDelivery, setDeliveryPayOnDelivery] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // ── Reservations ──────────────────────────────────────────────────────────
  const [maxPartySize, setMaxPartySize] = useState(20);
  const [bookingLeadTime, setBookingLeadTime] = useState(24);
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositType, setDepositType] = useState('PER_GUEST');
  const [cancellationHours, setCancellationHours] = useState(24);
  const [refundPercentage, setRefundPercentage] = useState(100);
  const [savingRes, setSavingRes] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({ emailNewOrder:true, emailMissedCall:true, emailDailySummary:true, emailNewReservation:true, emailAgentOffline:true, emailPaymentProcessed:true, emailRefundRequest:true, emailWeeklyReport:true, pushLiveCall:true, pushNewOrder:true });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // ── Phone ─────────────────────────────────────────────────────────────────
  const [assignedNumber, setAssignedNumber] = useState('');
  const [forwardNumber, setForwardNumber] = useState('');
  const [ringsBeforeAi, setRingsBeforeAi] = useState(0);
  const [callRecording, setCallRecording] = useState(true);
  const [voicemailFallback, setVoicemailFallback] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // ── Team ──────────────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffFn, setStaffFn] = useState('');
  const [staffLn, setStaffLn] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('STAFF');
  const [staffAddErr, setStaffAddErr] = useState('');
  const [newStaffCreds, setNewStaffCreds] = useState(null);
  const [copiedPw, setCopiedPw] = useState(false);

  // ── Security ──────────────────────────────────────────────────────────────
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showPw, setShowPw] = useState({ cur:false, new_:false, conf:false });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [otpEnable, setOtpEnable] = useState(true);
  const [sessions, setSessions] = useState([]);

  // Pre-fill from bizData prop (initial load)
  useEffect(() => {
    if (bizData) {
      setBizName(bizData.name || '');
      setBizType(bizData.type || bizData.category || '');
      setBizAddress(bizData.address || '');
      const phone = bizData.phone || '';
      setBizPhone(phone);
      if (phone) { try { const p = parsePhoneNumber(phone); if (p?.country) setBizPhoneCountry(p.country); } catch {} }
      setBizEmail(bizData.email || user?.email || '');
      setBizCountry(bizData.country || '');
      setBizCurrency(bizData.currency || '');
      setCountrySearch(bizData.country || '');
      if (bizData.openingHours) {
        if (bizData.openingHours.searchHours) setBizSearchHours(bizData.openingHours.searchHours);
        if (bizData.openingHours.is24h === "true") setBiz24h(true);
        else { setBiz24h(false); setBizSched(parseSchedule(bizData.openingHours)); }
      }
    } else if (user?.email) {
      setBizEmail(user.email);
    }
  }, [bizData, user]);

  useEffect(() => {
    const handler = (e) => { if (countryRef.current && !countryRef.current.contains(e.target)) setShowCountryDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (user) setTwoFa(user.twoFactorEnabled || false);
  }, [user]);

  // Load section data on nav
  useEffect(() => {
    if (section === 'Business') {
      api.business.get().then(d => {
        if (!d) return;
        setBizName(d.name || '');
        setBizType(d.type || d.category || '');
        setBizAddress(d.address || '');
        setBizPhone(d.phone || '');
        setBizEmail(d.email || user?.email || '');
        setBizCountry(d.country || '');
        setBizCurrency(d.currency || '');
        setCountrySearch(d.country || '');
        if (d.openingHours) {
          if (d.openingHours.searchHours) setBizSearchHours(d.openingHours.searchHours);
          if (d.openingHours.is24h === "true") setBiz24h(true);
          else { setBiz24h(false); setBizSched(parseSchedule(d.openingHours)); }
        }
      }).catch(() => {});
    } else if (section === 'Ordering') {
      api.settings.getOrderingPolicy().then(d => {
        setDeliveryRadius(d.deliveryRadius ?? 5);
        setRadiusUnit(d.deliveryRadiusUnit || 'miles');
        setDeliveryFee(d.deliveryFee ?? 0);
        setDeliveryEnabled(d.deliveryEnabled ?? false);
        setCollectionEnabled(d.collectionEnabled ?? false);
        setCollectionPayNow(d.collectionPayNow ?? false);
        setCollectionPayOnPickup(d.collectionPayOnPickup ?? false);
        setDeliveryPayNow(d.deliveryPayNow ?? false);
        setDeliveryPayOnDelivery(d.deliveryPayOnDelivery ?? false);
      }).catch(() => {});
    } else if (section === 'Reservations') {
      api.settings.getReservationPolicy().then(d => {
        setMaxPartySize(d.maxPartySize ?? 20);
        setBookingLeadTime(d.bookingLeadTime ?? 24);
        setDepositRequired(d.depositRequired ?? false);
        setDepositAmount(d.depositAmount ?? 0);
        setDepositType(d.depositType || 'PER_GUEST');
        setCancellationHours(d.cancellationHours ?? 24);
        setRefundPercentage(d.refundPercentage ?? 100);
      }).catch(() => {});
    } else if (section === 'Notifications') {
      api.settings.getNotifications().then(d => setNotifs(prev => ({ ...prev, ...d }))).catch(() => {});
    } else if (section === 'Phone') {
      api.settings.getPhone().then(d => {
        setAssignedNumber(d.assignedNumber || '');
        const fwd = d.forwardNumber || '';
        setForwardNumber(fwd);
        if (fwd) { try { const p = parsePhoneNumber(fwd); if (p?.country) setFwdPhoneCountry(p.country); } catch {} }
        setRingsBeforeAi(d.ringsBeforeAi ?? 0);
        setCallRecording(d.callRecording ?? true);
        setVoicemailFallback(d.voicemailFallback ?? false);
      }).catch(() => {});
    } else if (section === 'Team') {
      api.settings.getStaff().then(setStaffList).catch(() => {});
    } else if (section === 'Security') {
      api.settings.getSessions().then(setSessions).catch(() => {});
    }
  }, [section]);

  const saveBiz = async () => {
    setSavingBiz(true);
    try {
      await api.settings.updateBusiness({
        name: bizName, type: bizType, address: bizAddress, phone: bizPhone, email: bizEmail,
        country: bizCountry, currency: bizCurrency,
        openingHours: buildHours(biz24h, bizSched),
      });
      if (onBizNameChange) onBizNameChange(bizName);
      api.agent.rebuildPrompt().catch(() => {});
    } catch (e) {} finally { setSavingBiz(false); }
  };

  const saveOrdering = async () => {
    setSavingOrder(true);
    try {
      await api.settings.updateOrderingPolicy({
        deliveryEnabled,
        collectionEnabled,
        deliveryRadius: parseFloat(deliveryRadius),
        deliveryRadiusUnit: radiusUnit,
        deliveryFee: parseFloat(deliveryFee),
        collectionPayNow,
        collectionPayOnPickup,
        deliveryPayNow,
        deliveryPayOnDelivery,
      });
    }
    catch (e) {} finally { setSavingOrder(false); }
  };

  const saveReservation = async () => {
    setSavingRes(true);
    try { await api.settings.updateReservationPolicy({ maxPartySize: parseInt(maxPartySize), bookingLeadTime: parseInt(bookingLeadTime), depositRequired, depositAmount: parseFloat(depositAmount), depositType, cancellationHours: parseInt(cancellationHours), refundPercentage: parseInt(refundPercentage) }); }
    catch (e) {} finally { setSavingRes(false); }
  };

  const saveNotifications = async () => {
    setSavingNotifs(true);
    try { await api.settings.updateNotifications(notifs); }
    catch (e) {} finally { setSavingNotifs(false); }
  };

  const savePhone = async () => {
    setSavingPhone(true);
    try { await api.settings.updatePhone({ assignedNumber: assignedNumber || null, forwardNumber: forwardNumber || null, ringsBeforeAi: parseInt(ringsBeforeAi), callRecording, voicemailFallback }); }
    catch (e) {} finally { setSavingPhone(false); }
  };

  const handleChangePassword = async () => {
    setPwErr(''); setPwMsg('');
    if (!curPw || !newPw || !confPw) { setPwErr('Please fill all fields'); return; }
    if (newPw !== confPw) { setPwErr('New passwords do not match'); return; }
    if (newPw.length < 8) { setPwErr('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await api.settings.changePassword({ currentPassword: curPw, newPassword: newPw });
      setPwMsg('Password changed. A security alert was sent to your email.');
      setCurPw(''); setNewPw(''); setConfPw('');
    } catch (e) { setPwErr(e.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  const handleAddStaff = async () => {
    setStaffAddErr('');
    if (!staffFn || !staffLn) return;
    const emailVal = staffEmail.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setStaffAddErr('Please enter a valid email address.');
      return;
    }
    try {
      const result = await api.settings.createStaff({ firstName: staffFn, lastName: staffLn, email: emailVal || undefined, role: staffRole });
      setNewStaffCreds({ username: result.username, password: result.plainPassword, emailSent: result.emailSent === true });
      setStaffList(prev => [...prev, result]);
      setStaffFn(''); setStaffLn(''); setStaffEmail(''); setStaffRole('STAFF'); setStaffAddErr('');
      setShowAddStaff(false);
    } catch (e) { setStaffAddErr('Failed to create staff member. Please try again.'); }
  };

  const handleDeleteStaff = async (id) => {
    try { await api.settings.deleteStaff(id); setStaffList(prev => prev.filter(s => s.id !== id)); }
    catch (e) {}
  };

  const handleToggle2fa = async (checked) => {
    setOtpEnable(checked);
    try { await api.settings.sendOtp(); setShowOtp(true); setOtpMsg(''); }
    catch (e) { setOtpMsg('Failed to send OTP'); }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    try {
      const res = await api.settings.verifyOtp(otpCode, otpEnable);
      setTwoFa(res.twoFactorEnabled);
      // Update localStorage so initials/user data persists
      try {
        const stored = localStorage.getItem('talkativ_user');
        if (stored) {
          const u = JSON.parse(stored);
          localStorage.setItem('talkativ_user', JSON.stringify({ ...u, twoFactorEnabled: res.twoFactorEnabled }));
        }
      } catch {}
      setShowOtp(false); setOtpCode('');
    } catch (e) { setOtpMsg('Invalid or expired code'); }
  };

  const fi = {width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"};
  const fw = {background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`};
  const lb = {display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"};
  const eyeShow = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const eyeHide = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const sections = ["Business","Ordering","Reservations","Notifications","Phone","Team","Security"];

  return (
    <>
      <style>{`
        .settings-page .PhoneInputInput {
          flex: 1; min-width: 0; border: none; background: transparent;
          font-size: 14px; outline: none; color: inherit; padding-left: 8px;
          font-family: inherit;
        }
        .settings-page .PhoneInputCountry { margin-right: 4px; }
      `}</style>
      <TopBar title={<>Settings</>} subtitle="Manage your account and business preferences" user={user} agentName={agentName}/>

      {/* New staff credentials modal */}
      {newStaffCreds && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setNewStaffCreds(null)}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:440,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,padding:32,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:"fadeUp .3s ease both"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 12px",color:"white"}}>✓</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.ink,margin:0}}>Staff account created</h3>
              <p style={{fontSize:13,color:T.soft,margin:"6px 0 0"}}>
                {newStaffCreds?.emailSent ? "Credentials have been sent to their email" : "Save these credentials — the password won't be shown again"}
              </p>
            </div>
            <div style={{background:T.p50,border:`1.5px solid ${T.p100}`,borderRadius:14,padding:20,marginBottom:20}}>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:".3px",marginBottom:4}}>Username</div>
                <div style={{fontSize:15,fontWeight:700,color:T.ink,fontFamily:"monospace"}}>{newStaffCreds.username}</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.mid,textTransform:"uppercase",letterSpacing:".3px",marginBottom:4}}>Password</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.ink,fontFamily:"monospace",flex:1}}>{newStaffCreds.password}</div>
                  <button onClick={()=>{navigator.clipboard.writeText(newStaffCreds.password);setCopiedPw(true);setTimeout(()=>setCopiedPw(false),2000);}} style={{padding:"6px 14px",borderRadius:8,border:`1.5px solid ${T.p200}`,background:copiedPw?T.p50:T.white,color:copiedPw?T.p600:T.mid,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{copiedPw?"Copied!":"Copy"}</button>
                </div>
              </div>
            </div>
            <button onClick={()=>setNewStaffCreds(null)} className="btn-primary" style={{width:"100%"}}>Done</button>
          </div>
        </div>
      )}

      {/* OTP verification modal */}
      {showOtp && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>{setShowOtp(false);setOtpCode('');}}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:400,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,padding:32,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:"fadeUp .3s ease both"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:40,marginBottom:12}}>🔐</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.ink,margin:0}}>{otpEnable?"Enable":"Disable"} 2FA</h3>
              <p style={{fontSize:13,color:T.soft,margin:"8px 0 0"}}>Enter the 6-digit code sent to your email</p>
            </div>
            <input value={otpCode} onChange={e=>setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" style={{width:"100%",padding:"18px",border:`2px solid ${otpCode.length===6?T.p400:T.line}`,borderRadius:14,background:T.paper,color:T.ink,fontSize:28,fontWeight:900,fontFamily:"monospace",letterSpacing:"12px",textAlign:"center",outline:"none",transition:"border-color .2s",boxSizing:"border-box"}} maxLength={6}/>
            {otpMsg && <div style={{fontSize:13,color:"#e53e3e",textAlign:"center",marginTop:10}}>{otpMsg}</div>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>{setShowOtp(false);setOtpCode('');}} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={handleVerifyOtp} className="btn-primary" style={{flex:1}} disabled={otpCode.length!==6}>Verify</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setShowAddStaff(false)}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:440,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,padding:32,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:"fadeUp .3s ease both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.ink,margin:0}}>Add staff member</h3>
                <p style={{fontSize:13,color:T.soft,margin:"6px 0 0",fontWeight:300}}>Login credentials are auto-generated</p>
              </div>
              <button onClick={()=>setShowAddStaff(false)} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div className="form-group" style={{marginBottom:0}}><label className="form-label">First name</label><input className="form-input" value={staffFn} onChange={e=>setStaffFn(e.target.value)} placeholder="Maria"/></div>
              <div className="form-group" style={{marginBottom:0}}><label className="form-label">Last name</label><input className="form-input" value={staffLn} onChange={e=>setStaffLn(e.target.value)} placeholder="Lopez"/></div>
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <label className="form-label">Email <span style={{fontWeight:400,color:T.soft,textTransform:"none",letterSpacing:0}}>(optional — credentials will be sent here)</span></label>
              <input className="form-input" type="email" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} placeholder="maria@example.com"/>
            </div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-input" value={staffRole} onChange={e=>setStaffRole(e.target.value)}><option value="STAFF">Staff</option></select>
            </div>
            <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:16}}>
              {staffEmail.trim()
                ? `A unique username and password will be auto-generated and sent to ${staffEmail.trim()}.`
                : "A unique username and password will be auto-generated and shown once after creation."}
            </div>
            {staffAddErr && (
              <div style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#ef4444",marginBottom:12}}>
                {staffAddErr}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setShowAddStaff(false);setStaffAddErr('');}} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={handleAddStaff} className="btn-primary" style={{flex:1}} disabled={!staffFn||!staffLn}>Add staff member</button>
            </div>
          </div>
        </div>
      )}

      <div className="resp-grid-sidebar-left settings-page">
        <div className="card" style={{padding:16,height:"fit-content"}}>
          {sections.map(s=>(
            <div key={s} onClick={()=>setSection(s)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:section===s?T.p700:T.mid,background:section===s?T.p50:"transparent",border:`1.5px solid ${section===s?T.p100:"transparent"}`,marginBottom:2,transition:"all .18s"}}>{s}</div>
          ))}
        </div>

        <div>
          {section==="Business" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Business details card */}
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div className="card-head" style={{margin:0}}>Business details</div>
                  <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveBiz} disabled={savingBiz}>{savingBiz?"Saving…":"Save changes"}</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div style={fw}><label style={lb}>Business name</label><input style={fi} value={bizName} onChange={e=>setBizName(e.target.value)}/></div>
                  <div style={fw}><label style={lb}>Business type</label><input style={fi} value={bizType} onChange={e=>setBizType(e.target.value)} placeholder="e.g. Pizza Restaurant"/></div>
                  <div style={{...fw,gridColumn:"1 / -1"}}><label style={lb}>Address</label><input style={fi} value={bizAddress} onChange={e=>setBizAddress(e.target.value)}/></div>
                  <div style={fw}><label style={lb}>Business phone number</label>
                    <PhoneInput
                      international
                      country={bizPhoneCountry}
                      onCountryChange={c => setBizPhoneCountry(c || 'US')}
                      value={bizPhone}
                      onChange={val => setBizPhone(val || '')}
                      style={{...fi, display:'flex', alignItems:'center', padding:'10px 14px'}}
                    />
                  </div>
                  <div style={fw}><label style={lb}>Email</label><input style={fi} value={bizEmail} onChange={e=>setBizEmail(e.target.value)} type="email"/></div>
                  <div style={{...fw,gridColumn:"1 / -1"}} ref={countryRef}>
                    <label style={lb}>Country</label>
                    <div style={{position:"relative"}}>
                      <input
                        style={{...fi, paddingLeft: bizCountry ? 40 : undefined}}
                        placeholder="Start typing your country…"
                        value={countrySearch}
                        onChange={e => {
                          setCountrySearch(e.target.value);
                          setShowCountryDropdown(true);
                          if (!e.target.value.trim()) { setBizCountry(''); setBizCurrency(''); }
                        }}
                        onFocus={() => setShowCountryDropdown(true)}
                      />
                      {bizCountry && (() => { const found = COUNTRIES.find(c => c.name === bizCountry); return found ? <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,pointerEvents:"none",lineHeight:1}}>{getFlag(found.code)}</div> : null; })()}
                      {showCountryDropdown && filteredCountries.length > 0 && (
                        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,boxShadow:"0 12px 36px rgba(134,87,255,.12)",maxHeight:220,overflowY:"auto",zIndex:200}}>
                          {filteredCountries.map(c => (
                            <div key={c.code} onClick={() => { setBizCountry(c.name); setBizCurrency(c.currency); setCountrySearch(c.name); setShowCountryDropdown(false); }}
                              style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,borderBottom:`1px solid ${T.line}`,background:bizCountry===c.name?T.p50:"transparent"}}
                              onMouseEnter={e=>e.currentTarget.style.background=T.paper}
                              onMouseLeave={e=>e.currentTarget.style.background=bizCountry===c.name?T.p50:"transparent"}>
                              <span style={{fontSize:18,lineHeight:1}}>{getFlag(c.code)}</span>
                              <span style={{flex:1,fontWeight:500,color:T.ink}}>{c.name}</span>
                              <span style={{fontSize:11,color:T.soft,fontWeight:600}}>{c.currency} ({c.currencySymbol})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {showCountryDropdown && countrySearch.trim() && filteredCountries.length === 0 && (
                        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,boxShadow:"0 12px 36px rgba(134,87,255,.12)",padding:"16px 20px",textAlign:"center",zIndex:200}}>
                          <div style={{fontSize:13,color:T.soft}}>No country found matching "{countrySearch}"</div>
                        </div>
                      )}
                    </div>
                    {bizCountry && bizCurrency && (
                      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,background:T.p50,border:`1.5px solid ${T.p100}`,borderRadius:12,padding:"10px 16px"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
                          {(() => { const found = COUNTRIES.find(c => c.name === bizCountry); return found ? found.currencySymbol : "💱"; })()}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:700,color:T.p700}}>Currency auto-detected</div>
                          <div style={{fontSize:11.5,color:T.mid}}>{bizCurrency} — based on {bizCountry}</div>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:T.green}}>✓</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Working Schedule card */}
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div>
                    <div className="card-head" style={{margin:0}}>Business Working Schedule</div>
                    <p style={{margin:"4px 0 0",fontSize:12,color:T.soft}}>Set when your business is open — your AI agent uses this to handle calls correctly</p>
                  </div>
                  <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveBiz} disabled={savingBiz}>{savingBiz?"Saving…":"Save changes"}</button>
                </div>
                {bizSearchHours && (
                  <div style={{background:`linear-gradient(135deg, #f0fdf4, #ecfdf5)`,border:`1.5px solid #bbf7d0`,borderRadius:14,padding:"14px 18px",marginTop:12,marginBottom:8,display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:"0 3px 8px rgba(34,197,94,.2)"}}>⏰</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#16a34a",marginBottom:3}}>✓ Auto-found from business search</div>
                      <div style={{fontSize:12,color:T.mid,lineHeight:1.5}}>{bizSearchHours}</div>
                    </div>
                  </div>
                )}
                <ScheduleInlineEditor is24h={biz24h} setIs24h={setBiz24h} schedule={bizSched} setSchedule={setBizSched}/>
              </div>
            </div>
          )}

          {section==="Notifications" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:17,fontWeight:700,color:T.ink}}>Notification preferences</div>
                <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveNotifications} disabled={savingNotifs}>{savingNotifs?"Saving...":"Save changes"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
                {[["📞","New order via call","Notify when agent takes a phone order","emailNewOrder"],["📅","New reservation","Alert when a table is booked","emailNewReservation"],["📱","Missed call","Notify when a call is missed","emailMissedCall"],["📊","Weekly report","Summary every Monday","emailWeeklyReport"],["⚠️","Agent offline","Alert if agent stops responding","emailAgentOffline"],["💳","Payment processed","Confirmation for each charge","emailPaymentProcessed"],["↩️","Refund request","Alert when a refund is requested","emailRefundRequest"]].map(([ic,h,d,key])=>(
                  <div key={h} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 6px 20px rgba(112,53,245,.06)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{width:42,height:42,borderRadius:12,background:T.p50,border:`1px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ic}</div>
                      <label className="toggle"><input type="checkbox" checked={notifs[key]??true} onChange={e=>setNotifs(prev=>({...prev,[key]:e.target.checked}))}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:4}}>{h}</div>
                    <div style={{fontSize:12.5,color:T.soft,lineHeight:1.4}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="Phone" && (
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div className="card-head" style={{margin:0}}>Phone settings</div>
                <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={savePhone} disabled={savingPhone}>{savingPhone?"Saving...":"Save changes"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20,alignItems:"stretch"}}>
                <div style={{...fw,display:"flex",flexDirection:"column"}}>
                  <label style={lb}>Forwarding number (optional)</label>
                  <input value={assignedNumber} onChange={e=>setAssignedNumber(e.target.value)} placeholder="Assigned when you connect a number" style={{...fi,flex:1}}/>
                  <span style={{fontSize:11,color:T.soft,marginTop:4}}>The Talkativ number calls are forwarded to. Set during onboarding.</span>
                </div>
                <div style={{...fw,display:"flex",flexDirection:"column"}}>
                  <label style={lb}>Backup number (optional)</label>
                  <PhoneInput
                    international
                    country={fwdPhoneCountry}
                    onCountryChange={c => setFwdPhoneCountry(c || 'US')}
                    value={forwardNumber}
                    onChange={val => setForwardNumber(val || '')}
                    style={{...fi, display:'flex', alignItems:'center', padding:'10px 14px', flex:1}}
                  />
                  <span style={{fontSize:11,color:T.soft,marginTop:4}}>Fallback number if the agent can't handle a call.</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20,alignItems:"stretch"}}>
                <div style={{...fw,display:"flex",flexDirection:"column"}}>
                  <label style={lb}>Rings before agent answers</label>
                  <select value={ringsBeforeAi} onChange={e=>setRingsBeforeAi(e.target.value)} style={{...fi,flex:1,cursor:"pointer"}}>
                    <option value={0}>Immediately</option><option value={2}>After 2 rings</option><option value={3}>After 3 rings</option><option value={5}>After 5 rings</option>
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Call recording","Record all calls for quality assurance",callRecording,setCallRecording],["Voicemail fallback","If transfer fails, offer voicemail",voicemailFallback,setVoicemailFallback]].map(([title,desc,val,setter])=>(
                  <div key={title} style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{title}</h4>
                      <label className="toggle"><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                    </div>
                    <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="Team" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontSize:17,fontWeight:700,color:T.ink}}>Team members</div>
                <button className="btn-primary" style={{fontSize:13,padding:"8px 18px"}} onClick={()=>setShowAddStaff(true)}>+ Add Staff</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
                {/* Owner card */}
                <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{user?.firstName} {user?.lastName}</div>
                      <div style={{fontSize:12,color:T.soft,marginTop:2}}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                    <span className="badge badge-purple">Owner</span>
                  </div>
                </div>
                {staffList.map(m=>(
                  <div key={m.id} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 6px 20px rgba(112,53,245,.06)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{m.firstName?.[0]}{m.lastName?.[0]}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{m.firstName} {m.lastName}</div>
                        <div style={{fontSize:12,color:T.soft,marginTop:2}}>@{m.username}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                      <span className="badge badge-purple">{m.role}</span>
                      <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>handleDeleteStaff(m.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="Security" && (
            <div className="card">
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:16}}>Two-factor authentication</div>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Enable 2FA</h4>
                  <p style={{margin:0,fontSize:12,color:T.soft,marginTop:4}}>Require a code when logging in from a new device · {twoFa ? <span style={{color:"#38a169",fontWeight:600}}>Enabled</span> : <span style={{color:T.soft}}>Disabled</span>}</p>
                </div>
                <label className="toggle"><input type="checkbox" checked={twoFa} onChange={e=>handleToggle2fa(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
              </div>
              <div style={{paddingTop:20,borderTop:`1px solid ${T.line}`,marginTop:20}}>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>Active sessions</div>
                {sessions.length===0 ? (
                  <div style={{textAlign:"center",padding:32,color:T.soft,fontSize:13}}>No active sessions found</div>
                ) : (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:12}}>
                    {sessions.map(s=>(
                      <div key={s.id} style={{background:T.paper,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{s.device}</div>
                          <div style={{fontSize:11.5,color:T.soft,marginTop:2}}>{s.location} · {new Date(s.lastActive).toLocaleDateString()}</div>
                        </div>
                        <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>{api.settings.revokeSession(s.id).then(()=>setSessions(prev=>prev.filter(x=>x.id!==s.id))).catch(()=>{})}}>Revoke</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {section==="Ordering" && (
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div className="card-head" style={{margin:0}}>Ordering policy</div>
                <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveOrdering} disabled={savingOrder}>{savingOrder?"Saving...":"Save changes"}</button>
              </div>

              {/* ── Ordering type ── */}
              <div style={{marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Ordering type</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[
                    ["🏠","Collection","Allow customers to pick up orders in-store",collectionEnabled,setCollectionEnabled],
                    ["🚗","Delivery","Deliver orders to customers",deliveryEnabled,setDeliveryEnabled],
                  ].map(([ic,h,d,val,setter])=>(
                    <div key={h} style={{background: val ? `linear-gradient(135deg,${T.p50},#f0ebff)` : T.paper, border:`1.5px solid ${val ? T.p200 : T.line}`,borderRadius:14,padding:"18px 16px",display:"flex",flexDirection:"column",gap:10,transition:"all .2s"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{ic}</span><h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{h}</h4></div>
                        <label className="toggle"><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                      </div>
                      <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Payment options ── */}
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Payment options</div>

                {!collectionEnabled && !deliveryEnabled && (
                  <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"28px 24px",textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:8}}>⚙️</div>
                    <div style={{fontSize:13,fontWeight:600,color:T.mid,marginBottom:4}}>No ordering type selected</div>
                    <div style={{fontSize:12,color:T.soft}}>Enable Collection or Delivery above to configure payment options</div>
                  </div>
                )}

                {collectionEnabled && (
                  <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"18px 16px",marginBottom: deliveryEnabled ? 14 : 0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
                      <span style={{fontSize:16}}>🏠</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.p700,letterSpacing:".4px",textTransform:"uppercase"}}>Collection payments</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      {[
                        ["💳","Pay now while food is being prepared","Customer pays via payment link before the order is prepared",collectionPayNow,setCollectionPayNow],
                        ["🤝","Pay while picking it up","Customer pays when they arrive to collect their order",collectionPayOnPickup,setCollectionPayOnPickup],
                      ].map(([ic,h,d,val,setter])=>(
                        <div key={h} style={{background:T.white,border:`1.5px solid ${val ? T.p200 : T.line}`,borderRadius:12,padding:"14px 14px",transition:"border-color .2s"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,flex:1}}><span style={{fontSize:18,flexShrink:0}}>{ic}</span><h4 style={{margin:0,fontSize:12.5,fontWeight:700,color:T.ink,lineHeight:1.3}}>{h}</h4></div>
                            <label className="toggle" style={{flexShrink:0}}><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                          </div>
                          <p style={{margin:0,fontSize:11.5,color:T.soft,lineHeight:1.5}}>{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deliveryEnabled && (
                  <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"18px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
                      <span style={{fontSize:16}}>🚗</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.p700,letterSpacing:".4px",textTransform:"uppercase"}}>Delivery payments</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                      {[
                        ["💳","Pay now while food is being prepared","Customer pays via payment link before the order is prepared",deliveryPayNow,setDeliveryPayNow],
                        ["🚚","Pay later when food is delivered","Customer pays when the order arrives at their door",deliveryPayOnDelivery,setDeliveryPayOnDelivery],
                      ].map(([ic,h,d,val,setter])=>(
                        <div key={h} style={{background:T.white,border:`1.5px solid ${val ? T.p200 : T.line}`,borderRadius:12,padding:"14px 14px",transition:"border-color .2s"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,flex:1}}><span style={{fontSize:18,flexShrink:0}}>{ic}</span><h4 style={{margin:0,fontSize:12.5,fontWeight:700,color:T.ink,lineHeight:1.3}}>{h}</h4></div>
                            <label className="toggle" style={{flexShrink:0}}><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                          </div>
                          <p style={{margin:0,fontSize:11.5,color:T.soft,lineHeight:1.5}}>{d}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <div style={fw}>
                        <label style={lb}>Delivery fee</label>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <span style={{fontSize:16,fontWeight:700,color:T.mid}}>{currencySymbol}</span>
                          <input value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)} style={fi} type="number" min="0" step="0.01"/>
                        </div>
                      </div>
                      <div style={fw}>
                        <label style={lb}>Delivery radius</label>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <input value={deliveryRadius} onChange={e=>setDeliveryRadius(e.target.value)} style={{...fi,width:80,textAlign:"center"}} type="number" min="0"/>
                          <select value={radiusUnit} onChange={e=>setRadiusUnit(e.target.value)} style={{padding:"13px 14px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}><option value="miles">Miles</option><option value="km">Km</option></select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {section==="Reservations" && (
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div className="card-head" style={{margin:0}}>Reservation policy</div>
                <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveReservation} disabled={savingRes}>{savingRes?"Saving...":"Save changes"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                <div style={fw}><label style={lb}>Maximum party size</label><input value={maxPartySize} onChange={e=>setMaxPartySize(e.target.value)} style={fi} type="number" min="1"/></div>
                <div style={fw}>
                  <label style={lb}>Booking lead time (hours)</label>
                  <select value={bookingLeadTime} onChange={e=>setBookingLeadTime(e.target.value)} style={fi}>
                    <option value={1}>1 hour</option><option value={2}>2 hours</option><option value={4}>4 hours</option><option value={24}>24 hours</option><option value={48}>48 hours</option>
                  </select>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Deposit settings</div>
              <div style={{background:T.p50,border:`1.5px solid ${T.p100}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <h4 style={{margin:0,fontSize:14,fontWeight:700,color:T.ink}}>Require deposit</h4>
                    <p style={{margin:0,fontSize:12,color:T.soft,marginTop:4}}>A payment link is sent after the customer agrees to reserve</p>
                  </div>
                  <label className="toggle"><input type="checkbox" checked={depositRequired} onChange={e=>setDepositRequired(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                {depositRequired && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div>
                      <label style={{...lb,fontSize:11}}>Deposit type</label>
                      <select value={depositType} onChange={e=>setDepositType(e.target.value)} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${T.p200}`,borderRadius:10,background:T.white,color:T.ink,fontSize:13,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}><option value="PER_GUEST">Per guest</option><option value="PER_TABLE">Per table</option><option value="FIXED">Fixed amount</option></select>
                    </div>
                    <div>
                      <label style={{...lb,fontSize:11}}>Deposit amount</label>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:14,fontWeight:700,color:T.mid}}>{currencySymbol}</span>
                        <input value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${T.p200}`,borderRadius:10,background:T.white,color:T.ink,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none"}} type="number" min="0" step="0.01"/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Cancellation policy</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={fw}>
                  <label style={lb}>Free cancellation window</label>
                  <select value={cancellationHours} onChange={e=>setCancellationHours(e.target.value)} style={fi}>
                    <option value={2}>2 hours before</option><option value={4}>4 hours before</option><option value={24}>24 hours before</option><option value={48}>48 hours before</option>
                  </select>
                </div>
                <div style={fw}>
                  <label style={lb}>Refund if cancelled in time</label>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input value={refundPercentage} onChange={e=>setRefundPercentage(e.target.value)} style={{...fi,flex:1}} type="number" min="0" max="100"/>
                    <span style={{fontSize:16,fontWeight:700,color:T.mid,flexShrink:0}}>%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
