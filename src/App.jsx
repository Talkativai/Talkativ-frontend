import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { api } from "./api.js";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginScreenExternal from "./components/auth/LoginScreen.jsx";
import ResetPasswordScreen from "./components/auth/ResetPasswordScreen.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import RequireAdmin from "./components/auth/RequireAdmin.jsx";
import Landing from "./components/landing/Landing.jsx";

// const Step0 = lazy(() => import("./components/onboarding/Step0.jsx")); // Commented out — onboarding now starts at Step1 (create account)
const Step1 = lazy(() => import("./components/onboarding/Step1.jsx"));
const Step2 = lazy(() => import("./components/onboarding/Step2.jsx"));
const Step3 = lazy(() => import("./components/onboarding/Step3.jsx"));
const Step4 = lazy(() => import("./components/onboarding/Step4.jsx"));
const Step5 = lazy(() => import("./components/onboarding/Step5.jsx"));
const Step6 = lazy(() => import("./components/onboarding/Step6.jsx"));
const Step7 = lazy(() => import("./components/onboarding/Step7.jsx"));
const SuccessScreen = lazy(() => import("./components/success/SuccessScreen.jsx"));
const DashboardApp = lazy(() => import("./components/dashboard/DashboardApp.jsx"));
const AdminApp = lazy(() => import("./components/admin/AdminApp.jsx"));
const PaymentLinkScreen = lazy(() => import("./components/payment/PaymentLinkScreen.jsx"));
const PaymentConfirmScreen = lazy(() => import("./components/payment/PaymentConfirmScreen.jsx"));


/* ═══════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════ */
const T = {
  ivory:   "#FDFCFA",
  white:   "#FFFFFF",
  paper:   "#F8F6FF",
  mist:    "#F2EEFF",
  frost:   "#EAE4FF",
  lavBlue: "#E0D9FF",
  p50:     "#F5F2FF",
  p100:    "#ECE5FF",
  p200:    "#D9CEFF",
  p300:    "#BBA8FF",
  p400:    "#9E7EFF",
  p500:    "#8657FF",
  p600:    "#7035F5",
  p700:    "#5E24D8",
  p800:    "#4B1AB5",
  ink:     "#130D2E",
  ink2:    "#2D2150",
  mid:     "#6B5E8A",
  soft:    "#9E92BA",
  faint:   "#C8C0DC",
  line:    "#EBE6F5",
  green:   "#22C55E",
  greenBg: "#F0FDF4",
  greenBd: "#BBF7D0",
  red:     "#EF4444",
  redBg:   "#FEF2F2",
  amber:   "#F59E0B",
};

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
const G = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  font-family: 'Outfit', sans-serif;
  background: ${T.ivory};
  color: ${T.ink};
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${T.paper}; }
::-webkit-scrollbar-thumb { background: ${T.p300}; border-radius: 4px; }

/* ── KEYFRAMES ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes floatA {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(1deg); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-8px) rotate(-1deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .55; transform: scale(1.35); }
}
@keyframes wave {
  0%, 100% { height: 4px; }
  50%       { height: 26px; }
}
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}
@keyframes ringGrow {
  0%   { transform: scale(1); opacity: .6; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(134,87,255,.15); }
  50%       { box-shadow: 0 0 50px rgba(134,87,255,.3); }
}

/* ── NAV ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; height: 68px;
  background: rgba(253,252,250,.88);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid ${T.line};
  animation: fadeIn .6s ease both;
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: ${T.ink};
  letter-spacing: -.3px; text-decoration: none;
}
.nav-logo-mark {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, ${T.p500} 0%, ${T.p700} 100%);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 16px; font-family: 'Playfair Display', serif;
  font-style: italic; font-weight: 700;
  box-shadow: 0 4px 16px rgba(134,87,255,.35);
}
.nav-center {
  display: flex; gap: 36px; align-items: center;
  position: absolute; left: 50%; transform: translateX(-50%);
}
.nav-link {
  font-size: 14px; font-weight: 500; color: ${T.mid};
  cursor: pointer; transition: color .2s; text-decoration: none;
}
.nav-link:hover { color: ${T.p600}; }
.nav-right { display: flex; align-items: center; gap: 12px; }

/* ── BUTTONS ── */
.btn-ghost {
  background: transparent; border: 1.5px solid ${T.line};
  color: ${T.mid}; border-radius: 50px; padding: 9px 22px;
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .2s;
}
.btn-ghost:hover { border-color: ${T.p300}; color: ${T.p600}; }

.btn-primary {
  background: ${T.ink}; color: white; border: none;
  border-radius: 50px; padding: 10px 24px;
  font-size: 13.5px; font-weight: 600; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .22s;
  box-shadow: 0 2px 12px rgba(19,13,46,.2);
}
.btn-primary:hover {
  background: ${T.p700};
  box-shadow: 0 4px 20px rgba(134,87,255,.35);
  transform: translateY(-1px);
}

.btn-hero {
  display: inline-flex; align-items: center; gap: 8px;
  background: ${T.ink}; color: white; border: none;
  border-radius: 50px; padding: 16px 36px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .25s;
  box-shadow: 0 4px 24px rgba(19,13,46,.18);
}
.btn-hero:hover {
  background: ${T.p700};
  box-shadow: 0 8px 36px rgba(134,87,255,.4);
  transform: translateY(-2px);
}
.btn-hero-outline {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: ${T.ink}; border: 1.5px solid ${T.faint};
  border-radius: 50px; padding: 15px 32px;
  font-size: 15px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .22s;
}
.btn-hero-outline:hover { border-color: ${T.p400}; color: ${T.p600}; background: ${T.p50}; }

/* ── HERO ── */
.hero-wrap {
  min-height: 100vh;
  background: ${T.ivory};
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; padding: 0;
}
.hero-bg-shape {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
}
.hero-left {
  padding: 130px 64px 80px 80px;
  position: relative; z-index: 2;
  animation: fadeUp .8s .1s ease both;
}
.hero-right {
  position: relative; z-index: 2;
  padding: 130px 80px 80px 40px;
  display: flex; flex-direction: column; gap: 20px;
  animation: fadeUp .8s .25s ease both;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 50px; padding: 7px 18px;
  font-size: 12.5px; font-weight: 600; color: ${T.p600};
  margin-bottom: 28px; letter-spacing: .3px;
  box-shadow: 0 2px 12px rgba(134,87,255,.08);
}
.hero-dot { width: 7px; height: 7px; border-radius: 50%; background: ${T.green}; animation: pulse 2s infinite; }
.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(48px, 5.5vw, 76px);
  font-weight: 900; line-height: 1.05;
  letter-spacing: -2px; color: ${T.ink};
  margin-bottom: 22px;
}
.hero-h1 em { font-style: italic; color: ${T.p600}; }
.hero-sub {
  font-size: 17px; color: ${T.mid}; line-height: 1.75;
  max-width: 460px; margin-bottom: 40px; font-weight: 300;
}
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 52px; }
.hero-trust {
  display: flex; align-items: center; gap: 16px;
  font-size: 13px; color: ${T.soft};
}
.trust-avatars { display: flex; }
.trust-av {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid ${T.white}; margin-left: -8px;
  font-size: 14px; display: flex; align-items: center; justify-content: center;
  background: ${T.mist};
}
.trust-av:first-child { margin-left: 0; }

/* hero right — bento cards */
.bento-stack { position: relative; }
.bento-main {
  background: ${T.white};
  border: 1.5px solid ${T.line};
  border-radius: 24px; padding: 24px;
  box-shadow: 0 20px 60px rgba(134,87,255,.1), 0 4px 20px rgba(19,13,46,.05);
  animation: floatA 6s ease-in-out infinite;
}
.bento-float {
  position: absolute;
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 18px; padding: 16px 20px;
  box-shadow: 0 12px 40px rgba(134,87,255,.1);
  animation: floatB 5s .5s ease-in-out infinite;
}
.call-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.call-avatar {
  width: 44px; height: 44px; border-radius: 14px;
  background: linear-gradient(135deg, ${T.p400}, ${T.p700});
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.call-name { font-size: 14px; font-weight: 600; color: ${T.ink}; }
.call-sub { font-size: 11px; color: ${T.soft}; margin-top: 2px; }
.live-badge {
  margin-left: auto;
  display: flex; align-items: center; gap: 5px;
  background: ${T.greenBg}; border: 1px solid ${T.greenBd};
  border-radius: 50px; padding: 4px 10px;
  font-size: 10px; font-weight: 700; color: ${T.green};
}
.waveform { display: flex; align-items: center; gap: 3px; padding: 12px 0; }
.wave-bar {
  width: 3.5px; border-radius: 3px; background: ${T.p400};
  animation: wave .9s ease-in-out infinite;
}
.chat-bubble {
  border-radius: 14px; padding: 11px 14px;
  font-size: 12.5px; line-height: 1.55; margin-bottom: 8px;
}
.chat-ai { background: ${T.p50}; border: 1px solid ${T.p100}; color: ${T.ink2}; }
.chat-user { background: ${T.paper}; border: 1px solid ${T.line}; color: ${T.mid}; }
.chat-tag { font-size: 10px; font-weight: 700; display: block; margin-bottom: 4px; color: ${T.p500}; }
.chat-user .chat-tag { color: ${T.soft}; }

/* stat cards */
.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  margin-top: 20px;
}
.stat-c {
  background: ${T.paper}; border-radius: 16px; padding: 16px;
  border: 1.5px solid ${T.line};
}
.stat-n {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 900; color: ${T.p600};
  line-height: 1; margin-bottom: 4px;
}
.stat-l { font-size: 11px; color: ${T.soft}; font-weight: 500; text-transform: uppercase; letter-spacing: .8px; }

/* ── SOCIAL PROOF ── */
.proof-bar {
  background: ${T.ink}; padding: 18px 80px;
  display: flex; align-items: center; justify-content: space-between;
}
.proof-item { text-align: center; }
.proof-n { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: white; }
.proof-l { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 3px; text-transform: uppercase; letter-spacing: .8px; font-weight: 500; }
.proof-div { width: 1px; height: 36px; background: rgba(255,255,255,.12); }

/* ── FEATURES ── */
.features-section {
  padding: 120px 80px; max-width: 1240px; margin: 0 auto;
}
.section-tag {
  display: inline-block; font-size: 11px; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase; color: ${T.p600};
  margin-bottom: 16px;
}
.section-h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 4vw, 56px); font-weight: 900;
  letter-spacing: -1.5px; color: ${T.ink}; line-height: 1.12;
  margin-bottom: 12px;
}
.section-h2 em { font-style: italic; color: ${T.p500}; }
.section-sub { font-size: 16px; color: ${T.mid}; max-width: 480px; line-height: 1.7; font-weight: 300; }
.features-bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto;
  gap: 16px; margin-top: 60px;
}
.feat-card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 22px; padding: 32px 28px;
  transition: all .28s cubic-bezier(.25,.8,.25,1);
  position: relative; overflow: hidden;
}
.feat-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(134,87,255,.04), transparent 60%);
  opacity: 0; transition: opacity .25s;
}
.feat-card:hover { border-color: ${T.p200}; transform: translateY(-5px); box-shadow: 0 24px 60px rgba(134,87,255,.1); }
.feat-card:hover::after { opacity: 1; }
.feat-icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: ${T.paper}; border: 1.5px solid ${T.line};
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-bottom: 22px;
  transition: transform .25s;
}
.feat-card:hover .feat-icon { transform: scale(1.08); }
.feat-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 700; color: ${T.ink};
  margin-bottom: 10px; letter-spacing: -.3px;
}
.feat-card p { font-size: 14px; color: ${T.mid}; line-height: 1.7; font-weight: 300; }

/* ── TESTIMONIALS ── */
.testi-section {
  background: ${T.ink}; padding: 100px 80px;
  position: relative; overflow: hidden;
}
.testi-section::before {
  content: ''; position: absolute; top: -100px; left: -100px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(rgba(134,87,255,.18), transparent 65%);
  pointer-events: none;
}
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 52px; }
.testi-card {
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
  border-radius: 22px; padding: 32px 28px;
  transition: all .25s;
}
.testi-card:hover { background: rgba(255,255,255,.08); border-color: rgba(134,87,255,.3); transform: translateY(-4px); }
.testi-stars { color: ${T.amber}; font-size: 14px; letter-spacing: 2px; margin-bottom: 16px; }
.testi-q { font-size: 14px; color: rgba(255,255,255,.75); line-height: 1.75; margin-bottom: 20px; font-weight: 300; }
.testi-author { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.45); }
.testi-author strong { color: ${T.p300}; font-weight: 600; }

/* ── FOOTER CTA ── */
.footer-cta {
  padding: 120px 80px; text-align: center;
  background: ${T.paper}; position: relative; overflow: hidden;
}
.footer-cta::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, ${T.p200} 1px, transparent 0);
  background-size: 32px 32px; opacity: .35;
}
.footer-cta-inner { position: relative; z-index: 1; }

/* ══════════════════════════════════════════
   ONBOARDING SHELL
══════════════════════════════════════════ */
.ob-wrap { min-height: 100vh; display: flex; background: ${T.paper}; }
.ob-sidebar {
  width: 300px; flex-shrink: 0;
  background: ${T.white}; border-right: 1.5px solid ${T.line};
  padding: 36px 28px; display: flex; flex-direction: column;
}
.ob-sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 700; color: ${T.ink};
  margin-bottom: 48px;
}
.ob-sidebar-logo-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, ${T.p500}, ${T.p700});
  display: flex; align-items: center; justify-content: center;
  color: white; font-style: italic; font-size: 15px;
  font-family: 'Playfair Display', serif; font-weight: 700;
}
.ob-step-item { display: flex; align-items: flex-start; gap: 14px; padding: 9px 0; }
.ob-step-num {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; transition: all .25s;
}
.sn-done { background: ${T.p600}; color: white; box-shadow: 0 3px 12px rgba(112,53,245,.3); }
.sn-active { background: ${T.p50}; color: ${T.p600}; border: 2px solid ${T.p500}; }
.sn-upcoming { background: transparent; color: ${T.faint}; border: 1.5px solid ${T.line}; }
.ob-step-info .step-name { font-size: 13.5px; font-weight: 500; padding-top: 4px; transition: color .2s; }
.ob-step-info .step-name.done  { color: ${T.p500}; }
.ob-step-info .step-name.active { color: ${T.ink}; }
.ob-step-info .step-name.upcoming { color: ${T.faint}; }
.ob-step-info .step-time { font-size: 11px; color: ${T.soft}; margin-top: 3px; }
.ob-step-line { width: 1px; height: 18px; background: ${T.line}; margin-left: 14px; }

.ob-main {
  flex: 1; padding: 52px 72px;
  display: flex; flex-direction: column;
  overflow-y: auto; max-width: 720px;
}
.ob-progress-bar {
  height: 3px; background: ${T.line}; border-radius: 3px;
  overflow: hidden; margin-bottom: 52px;
}
.ob-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${T.p500}, ${T.p400});
  border-radius: 3px; transition: width .6s cubic-bezier(.25,.8,.25,1);
}
.ob-progress-label { font-size: 11.5px; color: ${T.soft}; margin-top: 10px; font-weight: 500; }

.ob-step-label {
  font-size: 11px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: ${T.p500}; margin-bottom: 10px;
}
.ob-heading {
  font-family: 'Playfair Display', serif;
  font-size: 34px; font-weight: 900; letter-spacing: -1px;
  color: ${T.ink}; line-height: 1.2; margin-bottom: 10px;
}
.ob-heading em { font-style: normal; color: ${T.p600}; }
.ob-subheading { font-size: 14.5px; color: ${T.mid}; line-height: 1.65; margin-bottom: 36px; font-weight: 300; }

/* form */
.form-group { margin-bottom: 18px; }
.form-label {
  display: block; font-size: 12px; font-weight: 600;
  color: ${T.mid}; margin-bottom: 7px; letter-spacing: .3px;
  text-transform: uppercase;
}
.form-input {
  width: 100%; padding: 13px 18px;
  border: 1.5px solid ${T.line}; border-radius: 12px;
  background: ${T.white}; color: ${T.ink};
  font-size: 14px; font-family: 'Outfit', sans-serif;
  outline: none; transition: all .2s;
}
.form-input:focus { border-color: ${T.p500}; box-shadow: 0 0 0 4px rgba(134,87,255,.08); }
.form-input::placeholder { color: ${T.faint}; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
select.form-input { cursor: pointer; }
textarea.form-input { resize: none; line-height: 1.6; }

.sso-row { display: flex; gap: 12px; margin-bottom: 20px; }
.sso-btn {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 9px; padding: 12px; border-radius: 12px;
  border: 1.5px solid ${T.line}; background: ${T.white};
  font-size: 13.5px; font-weight: 500; color: ${T.mid};
  cursor: pointer; transition: all .2s; font-family: 'Outfit', sans-serif;
}
.sso-btn:hover { border-color: ${T.p300}; color: ${T.p600}; background: ${T.p50}; }
.divider-row { display: flex; align-items: center; gap: 14px; margin: 18px 0; }
.divider-line { flex: 1; height: 1px; background: ${T.line}; }
.divider-text { font-size: 12px; color: ${T.soft}; }

/* voice picker */
.voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.voice-card {
  border: 1.5px solid ${T.line}; border-radius: 16px;
  padding: 18px; cursor: pointer; transition: all .22s;
  background: ${T.white}; position: relative; overflow: hidden;
}
.voice-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(134,87,255,.04), transparent);
  opacity: 0; transition: opacity .22s;
}
.voice-card.selected { border-color: ${T.p500}; box-shadow: 0 0 0 3px rgba(134,87,255,.1); }
.voice-card.selected::before { opacity: 1; }
.voice-card:hover:not(.selected) { border-color: ${T.p300}; }
.voice-name { font-size: 14.5px; font-weight: 600; color: ${T.ink}; margin-bottom: 3px; }
.voice-desc { font-size: 12px; color: ${T.soft}; }
.voice-play-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: ${T.paper}; border: 1.5px solid ${T.line};
  display: flex; align-items: center; justify-content: center;
  margin-top: 12px; font-size: 10px; color: ${T.p500};
  cursor: pointer; transition: all .2s;
}
.voice-card.selected .voice-play-btn { background: ${T.p600}; border-color: ${T.p600}; color: white; }
@keyframes miniWave { 0%, 100% { height: 4px; } 50% { height: 16px; } }
@keyframes audioBar { 0% { transform: scaleY(0.4); } 100% { transform: scaleY(1); } }
.voice-wave {
  display: flex; align-items: center; justify-content: center; gap: 2.5px;
  width: 30px; height: 30px; border-radius: 50%;
  background: ${T.p600}; border: 1.5px solid ${T.p600}; margin-top: 12px;
}
.voice-wave-bar {
  width: 2.5px; border-radius: 3px; background: white;
  animation: miniWave .75s ease-in-out infinite;
}

/* import options */
.import-list { display: flex; flex-direction: column; gap: 11px; }
.import-item {
  display: flex; align-items: center; gap: 16px;
  border: 1.5px solid ${T.line}; border-radius: 16px;
  padding: 18px 20px; cursor: pointer; transition: all .22s;
  background: ${T.white};
}
.import-item.selected { border-color: ${T.p500}; background: ${T.p50}; }
.import-item:hover:not(.selected) { border-color: ${T.p300}; }
.import-item-icon { font-size: 24px; width: 44px; text-align: center; }
.import-item-info h4 { font-size: 14px; font-weight: 600; color: ${T.ink}; }
.import-item-info p { font-size: 12px; color: ${T.soft}; margin-top: 2px; }
.import-badge {
  margin-left: auto; padding: 4px 10px; border-radius: 50px;
  background: ${T.p100}; color: ${T.p700};
  font-size: 11px; font-weight: 700;
}
.radio-dot {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.radio-inner { width: 8px; height: 8px; border-radius: 50%; background: white; }

/* phone connect options */
.phone-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
.phone-opt {
  border: 1.5px solid ${T.line}; border-radius: 18px;
  padding: 24px 20px; cursor: pointer; transition: all .22s;
  background: ${T.white};
}
.phone-opt.selected { border-color: ${T.p500}; box-shadow: 0 0 0 3px rgba(134,87,255,.1); }
.phone-opt:hover:not(.selected) { border-color: ${T.p300}; }
.phone-opt-icon { font-size: 30px; margin-bottom: 12px; }
.phone-opt h4 { font-size: 14px; font-weight: 600; color: ${T.ink}; margin-bottom: 5px; }
.phone-opt p { font-size: 12.5px; color: ${T.soft}; line-height: 1.55; }

/* test call */
.test-call-card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 24px; padding: 44px; text-align: center;
  position: relative; overflow: hidden;
}
.test-call-card::before {
  content: ''; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 360px; height: 360px; border-radius: 50%;
  background: radial-gradient(${T.p100}, transparent 65%);
  pointer-events: none;
}
.test-call-icon {
  position: relative; z-index: 1;
  width: 100px; height: 100px; border-radius: 50%;
  border: 2.5px solid ${T.p200}; background: ${T.p50};
  display: flex; align-items: center; justify-content: center;
  font-size: 42px; margin: 0 auto 28px;
  animation: glowPulse 2.5s ease-in-out infinite;
}
.test-call-icon::before, .test-call-icon::after {
  content: ''; position: absolute; inset: -10px;
  border-radius: 50%; border: 1.5px solid ${T.p200};
  animation: ringGrow 2.5s ease-out infinite;
}
.test-call-icon::after { animation-delay: 1.25s; }
.test-call-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 700; color: ${T.ink};
  margin-bottom: 10px; position: relative; z-index: 1;
}
.test-call-card p { font-size: 14px; color: ${T.mid}; margin-bottom: 28px; line-height: 1.65; font-weight: 300; position: relative; z-index: 1; }

/* plan cards */
.plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.plan-card {
  border: 1.5px solid ${T.line}; border-radius: 22px;
  padding: 30px 26px; cursor: pointer; transition: all .25s;
  background: ${T.white}; position: relative;
}
.plan-card.selected { border-color: ${T.p500}; box-shadow: 0 0 0 3px rgba(134,87,255,.1); }
.plan-card:hover:not(.selected) { border-color: ${T.p300}; transform: translateY(-2px); }
.plan-popular-badge {
  position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, ${T.p600}, ${T.p700});
  color: white; font-size: 11px; font-weight: 700;
  padding: 4px 16px; border-radius: 50px;
  box-shadow: 0 3px 12px rgba(112,53,245,.35);
}
.plan-name { font-size: 12.5px; font-weight: 700; color: ${T.soft}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .8px; }
.plan-price {
  font-family: 'Playfair Display', serif;
  font-size: 42px; font-weight: 900; color: ${T.p700}; line-height: 1;
}
.plan-price span { font-size: 14px; font-family: 'Outfit', sans-serif; color: ${T.soft}; font-weight: 400; }
.plan-feature-list { margin-top: 20px; }
.plan-feature { display: flex; align-items: center; gap: 9px; font-size: 13px; color: ${T.mid}; padding: 5px 0; }
.plan-feature::before { content: '✓'; color: ${T.p500}; font-size: 12px; font-weight: 700; }

/* info block */
.info-block {
  background: ${T.p50}; border: 1.5px solid ${T.p100};
  border-radius: 16px; padding: 20px; margin-top: 18px;
}

/* footer */
.ob-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 44px; padding-top: 26px; border-top: 1.5px solid ${T.line};
}
.btn-back {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: none; color: ${T.soft};
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: color .2s;
}
.btn-back:hover { color: ${T.mid}; }
.btn-next {
  display: flex; align-items: center; gap: 8px;
  background: ${T.ink}; color: white; border: none;
  border-radius: 50px; padding: 13px 30px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .22s;
  box-shadow: 0 3px 16px rgba(19,13,46,.18);
}
.btn-next:hover { background: ${T.p700}; box-shadow: 0 6px 24px rgba(134,87,255,.4); transform: translateY(-1px); }

/* ══════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════ */
.success-screen {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px; text-align: center;
  background: ${T.ivory}; position: relative; overflow: hidden;
}
.success-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 0%, ${T.mist}, transparent 60%),
    radial-gradient(ellipse 40% 40% at 80% 80%, ${T.frost}, transparent 55%);
  background-image: radial-gradient(circle at 1px 1px, ${T.p200} 1px, transparent 0);
  background-size: 28px 28px;
  opacity: .3;
}
.success-icon {
  width: 104px; height: 104px; border-radius: 50%;
  background: linear-gradient(135deg, ${T.p500}, ${T.p700});
  display: flex; align-items: center; justify-content: center;
  font-size: 48px; margin-bottom: 32px;
  box-shadow: 0 12px 50px rgba(134,87,255,.3);
  animation: countUp .6s cubic-bezier(.34,1.56,.64,1) both;
  position: relative; z-index: 1;
}
.success-h1 {
  font-family: 'Playfair Display', serif;
  font-size: 60px; font-weight: 900; letter-spacing: -2px;
  color: ${T.ink}; position: relative; z-index: 1;
}
.success-sub { font-size: 17px; color: ${T.mid}; margin: 14px 0 44px; font-weight: 300; line-height: 1.65; max-width: 440px; position: relative; z-index: 1; }
.success-stats {
  display: flex; gap: 16px; margin-bottom: 44px;
  position: relative; z-index: 1;
}
.ss-card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 20px; padding: 22px 32px; text-align: center;
  box-shadow: 0 6px 24px rgba(134,87,255,.07);
}
.ss-val {
  font-family: 'Playfair Display', serif;
  font-size: 30px; font-weight: 900; color: ${T.p600};
}
.ss-label { font-size: 11px; color: ${T.soft}; margin-top: 5px; text-transform: uppercase; letter-spacing: .8px; font-weight: 500; }

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
.dash-wrap { display: flex; min-height: 100vh; background: ${T.paper}; }
.dash-sidebar {
  width: 256px; flex-shrink: 0;
  background: ${T.white}; border-right: 1.5px solid ${T.line};
  padding: 28px 20px; display: flex; flex-direction: column;
  overflow-y: auto;
}
.dash-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Playfair Display', serif;
  font-size: 19px; font-weight: 700; color: ${T.ink};
  margin-bottom: 40px;
}
.dash-logo-mark {
  width: 30px; height: 30px; border-radius: 9px;
  background: linear-gradient(135deg, ${T.p500}, ${T.p700});
  display: flex; align-items: center; justify-content: center;
  color: white; font-style: italic; font-size: 14px;
  font-family: 'Playfair Display', serif; font-weight: 700;
}
.dash-section-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${T.faint}; padding: 16px 12px 7px; }
.dash-nav-item {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px; border-radius: 11px;
  font-size: 13.5px; font-weight: 500; color: ${T.mid};
  cursor: pointer; transition: all .18s; margin-bottom: 2px;
}
.dash-nav-item:hover { background: ${T.paper}; color: ${T.ink}; }
.dash-nav-item.active { background: ${T.p50}; color: ${T.p700}; border: 1.5px solid ${T.p100}; }
.dash-nav-icon { font-size: 16px; width: 22px; text-align: center; }

.dash-main { flex: 1; overflow: auto; padding: 36px 40px; }
.dash-topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 30px;
}
.dash-greeting {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 900; letter-spacing: -.8px; color: ${T.ink};
}
.dash-greeting em { font-style: italic; color: ${T.p600}; }
.dash-date { font-size: 12px; color: ${T.soft}; margin-bottom: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: .5px; }
.dash-topbar-right { display: flex; align-items: center; gap: 12px; }
.dash-live-badge {
  display: flex; align-items: center; gap: 6px;
  background: ${T.greenBg}; border: 1.5px solid ${T.greenBd};
  border-radius: 50px; padding: 7px 16px;
  font-size: 12px; font-weight: 700; color: ${T.green};
}
.dash-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, ${T.p400}, ${T.p700});
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: white;
}

/* KPI row */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.kpi-card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 18px; padding: 22px 20px;
  transition: all .2s;
}
.kpi-card:hover { border-color: ${T.p200}; box-shadow: 0 6px 24px rgba(134,87,255,.07); }
.kpi-label { font-size: 11px; font-weight: 700; color: ${T.soft}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .8px; }
.kpi-value {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 900; color: ${T.ink}; line-height: 1; margin-bottom: 6px;
}
.kpi-delta { font-size: 12px; font-weight: 600; color: ${T.green}; }
.kpi-delta.neg { color: ${T.red}; }

/* live call banner */
.live-banner {
  background: linear-gradient(135deg, ${T.p600} 0%, ${T.p700} 100%);
  border-radius: 18px; padding: 20px 26px;
  display: flex; align-items: center; gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 6px 32px rgba(112,53,245,.25);
  animation: glowPulse 3s ease-in-out infinite;
}
.lb-icon { font-size: 28px; }
.lb-content h4 { font-size: 14.5px; font-weight: 600; color: white; margin-bottom: 3px; }
.lb-content p { font-size: 12.5px; color: rgba(255,255,255,.7); }
.lb-wave { display: flex; align-items: center; gap: 2.5px; margin-left: auto; }
.lb-wave-bar { width: 3px; border-radius: 3px; background: rgba(255,255,255,.65); animation: wave .75s ease-in-out infinite; }
.lb-btn {
  background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.28);
  border-radius: 50px; padding: 8px 18px; font-size: 12.5px; font-weight: 600;
  color: white; cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all .2s; margin-left: 18px;
}
.lb-btn:hover { background: rgba(255,255,255,.28); }

/* dash grid */
.dash-grid { display: grid; grid-template-columns: 1fr 330px; gap: 18px; }
.dash-card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 20px; padding: 24px;
}
.dash-card-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
  font-size: 15px; font-weight: 700; color: ${T.ink};
  font-family: 'Playfair Display', serif; letter-spacing: -.2px;
}
.dash-card-link { font-size: 12px; color: ${T.p500}; font-weight: 500; cursor: pointer; font-family: 'Outfit', sans-serif; }

/* call log */
.call-log-item {
  display: flex; align-items: center; gap: 14px;
  padding: 11px 0; border-bottom: 1px solid ${T.paper};
}
.call-log-item:last-child { border-bottom: none; }
.call-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.call-dot.live { background: ${T.p400}; box-shadow: 0 0 0 3px ${T.p100}; animation: pulse 1.2s infinite; }
.call-dot.done { background: ${T.green}; }
.call-dot.miss { background: ${T.red}; }
.call-name { font-size: 13.5px; font-weight: 500; color: ${T.ink}; }
.call-detail { font-size: 11.5px; color: ${T.soft}; margin-top: 2px; }
.call-badge { font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 50px; }
.call-badge.order { background: ${T.greenBg}; color: ${T.green}; }
.call-badge.info { background: ${T.p50}; color: ${T.p700}; }
.call-badge.missed { background: ${T.redBg}; color: ${T.red}; }

/* chart */
.mini-bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 76px; margin-top: 8px; }
.chart-bar { flex: 1; border-radius: 4px 4px 0 0; background: ${T.frost}; transition: all .2s; cursor: pointer; }
.chart-bar:hover { background: ${T.p400}; }
.chart-bar.active { background: ${T.p600}; }
.chart-labels { display: flex; gap: 6px; margin-top: 7px; }
.chart-label { flex: 1; text-align: center; font-size: 10px; color: ${T.soft}; }

/* agent card */
.agent-card {
  background: linear-gradient(135deg, ${T.p50}, ${T.mist});
  border: 1.5px solid ${T.p100}; border-radius: 16px; padding: 18px;
  display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
}
.agent-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, ${T.p400}, ${T.p700});
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; box-shadow: 0 4px 16px rgba(134,87,255,.22);
}
.agent-name { font-size: 14.5px; font-weight: 600; color: ${T.ink}; }
.agent-status { font-size: 11.5px; color: ${T.green}; margin-top: 3px; display: flex; align-items: center; gap: 5px; font-weight: 500; }
.agent-status-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.green}; animation: pulse 2s infinite; }
.agent-edit-btn {
  margin-left: auto; font-size: 12px; color: ${T.p600}; font-weight: 600;
  cursor: pointer; border: 1.5px solid ${T.p200}; border-radius: 9px;
  padding: 6px 14px; background: white; font-family: 'Outfit', sans-serif; transition: all .2s;
}
.agent-edit-btn:hover { border-color: ${T.p500}; background: ${T.p50}; }

.agent-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.agent-meta-item {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 12px; padding: 11px 14px;
}
.agent-meta-label { font-size: 10.5px; color: ${T.soft}; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
.agent-meta-value { font-size: 13px; font-weight: 600; color: ${T.ink}; }

/* quick actions */
.quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.qa-item {
  display: flex; align-items: center; gap: 10px;
  border: 1.5px solid ${T.line}; border-radius: 13px; padding: 14px;
  cursor: pointer; transition: all .18s; background: ${T.white};
}
.qa-item:hover { border-color: ${T.p300}; background: ${T.p50}; transform: translateY(-2px); }
.qa-icon { font-size: 18px; }
.qa-label { font-size: 12.5px; font-weight: 500; color: ${T.mid}; }

/* ── GENERIC CARD ── */
.card {
  background: ${T.white}; border: 1.5px solid ${T.line};
  border-radius: 20px; padding: 24px;
  transition: all .2s;
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
  font-size: 15px; font-weight: 700; color: ${T.ink};
  font-family: 'Playfair Display', serif; letter-spacing: -.2px;
}
.card-link { font-size: 12px; color: ${T.p500}; font-weight: 500; cursor: pointer; font-family: 'Outfit', sans-serif; }

/* ── BUTTON SECONDARY ── */
.btn-secondary {
  background: ${T.white}; color: ${T.mid}; border: 1.5px solid ${T.line};
  border-radius: 50px; padding: 9px 22px;
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all .2s;
}
.btn-secondary:hover { border-color: ${T.p300}; color: ${T.p600}; background: ${T.p50}; }

/* ── PAGE TITLE / SUB ── */
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 900; color: ${T.ink};
  letter-spacing: -.5px; line-height: 1.2;
}
.page-sub { font-size: 13px; color: ${T.soft}; margin-top: 3px; }

/* ── BADGES ── */
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 50px; font-size: 11.5px; font-weight: 600; }
.badge-green { background: ${T.greenBg}; color: ${T.green}; }
.badge-purple { background: ${T.p50}; color: ${T.p700}; }
.badge-red { background: ${T.redBg}; color: ${T.red}; }
.badge-amber { background: #FFFBEB; color: ${T.amber}; }

/* ── PROGRESS ── */
.prog-track { height: 6px; background: ${T.line}; border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg, ${T.p500}, ${T.p400}); border-radius: 3px; transition: width .4s; }

/* ── TOGGLE ── */
.toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track {
  width: 40px; height: 22px; background: ${T.faint}; border-radius: 11px;
  transition: background .2s; flex-shrink: 0;
}
.toggle input:checked ~ .toggle-track { background: ${T.p500}; }
.toggle-thumb {
  position: absolute; left: 3px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; border-radius: 50%;
  background: white; box-shadow: 0 1px 4px rgba(0,0,0,.2);
  transition: left .2s;
  pointer-events: none;
}
.toggle input:checked ~ .toggle-thumb { left: 21px; }

/* ── RESPONSIVE INLINE GRID UTILITIES ── */
.resp-2col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.resp-3col-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

/* ── TRANSCRIPT PANEL ── */
@keyframes slideDown {
  from { max-height: 0; opacity: 0; }
  to   { max-height: 600px; opacity: 1; }
}
.transcript-panel {
  overflow: hidden;
  animation: slideDown .35s ease forwards;
  background: ${T.paper};
  border: 1.5px solid ${T.line};
  border-radius: 16px;
  margin: 6px 0 10px;
  padding: 20px;
}
.transcript-meta {
  display: flex; gap: 20px; flex-wrap: wrap;
  margin-bottom: 16px; padding-bottom: 14px;
  border-bottom: 1px solid ${T.line};
}
.transcript-meta-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: ${T.mid};
}
.transcript-meta-item strong {
  color: ${T.ink}; font-weight: 600;
}
.transcript-meta-icon { font-size: 14px; }
.transcript-body {
  max-height: 350px; overflow-y: auto;
  padding-right: 8px;
}
.transcript-turn {
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
}
.transcript-turn.agent {
  background: ${T.p50}; border: 1px solid ${T.p100};
  color: ${T.ink2};
  margin-right: 40px;
}
.transcript-turn.caller {
  background: ${T.white}; border: 1px solid ${T.line};
  color: ${T.mid};
  margin-left: 40px;
}
.transcript-turn-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .5px;
  margin-bottom: 4px; display: block;
}
.transcript-turn.agent .transcript-turn-label { color: ${T.p500}; }
.transcript-turn.caller .transcript-turn-label { color: ${T.soft}; }
.transcript-empty {
  text-align: center; padding: 24px;
  font-size: 13px; color: ${T.soft};
}
.transcript-toggle-btn {
  background: none; border: none;
  color: ${T.p600}; font-size: 12px;
  font-weight: 600; cursor: pointer;
  padding: 4px 10px; border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  transition: all .15s;
  display: inline-flex; align-items: center; gap: 4px;
}
.transcript-toggle-btn:hover { background: ${T.p50}; }

/* ── LANDING NAV CENTER LINKS ── */
.landing-nav-links {
  display: flex; align-items: center; gap: 32px;
  position: absolute; left: 50%; transform: translateX(-50%);
}

/* ── RESPONSIVE CLASSES ── */
.resp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.resp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.resp-grid-dashboard-hub { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 18px; }
.resp-grid-sidebar-left { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 18px; }

.resp-show-mobile { display: none !important; }
.mob-close-btn { display: none; }

/* ── MEDIA QUERIES ── */

/* TABLET (max 1024px) */
@media (max-width: 1024px) {
  .bento-stack { margin-top: 32px; }
  .bento-main { position: relative; }
  .hero-wrap { grid-template-columns: 1fr !important; }
  .hero-left { padding: 110px 48px 40px !important; }
  .hero-right { padding: 0 48px 60px !important; }
  .features-section { padding: 80px 40px; }
  .testi-section { padding: 80px 40px; }
  .footer-cta { padding: 80px 40px; }
  .proof-bar { padding: 18px 40px; }
  .testi-grid { grid-template-columns: 1fr 1fr !important; }
  .features-bento { grid-template-columns: repeat(6, 1fr) !important; }
  .feat-card { grid-column: span 3 !important; }
  .kpi-row { grid-template-columns: repeat(2, 1fr) !important; }
  .landing-nav-links { display: none !important; }
  .resp-3col-grid { grid-template-columns: 1fr 1fr !important; }

  /* Off-canvas Navigation Overlay */
  .dash-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 900;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
  }
  body.mob-nav-open .dash-overlay { opacity: 1; pointer-events: auto; }
  body.mob-nav-open { overflow: hidden; }

  /* Hamburger Toggle */
  .resp-show-mobile { display: block !important; }
  .mob-close-btn { display: flex !important; }

  /* Off-canvas Sidebar */
  .dash-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 280px; height: 100vh;
    z-index: 1000; box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  body.mob-nav-open .dash-sidebar { transform: translateX(0); }
  .dash-main { padding: 36px 32px; }

  .resp-grid-dashboard-hub { grid-template-columns: 1fr !important; }
  .resp-grid-sidebar-left { grid-template-columns: 1fr !important; }

  /* Off-canvas Onboarding Sidebar */
  .ob-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 280px; height: 100vh;
    z-index: 1000; box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-right: none !important;
  }
  .ob-sidebar.ob-open { transform: translateX(0); }
  .ob-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 900;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
  }
  .ob-overlay.ob-open { opacity: 1; pointer-events: auto; }
  .ob-hamburger { display: flex !important; }
}

/* MOBILE (max 768px) */
@media (max-width: 768px) {
  .hero-wrap, .ob-wrap, .testi-grid, .footer-cta { display: flex; flex-direction: column; }
  .hero-left, .hero-right { padding: 32px 20px !important; }
  .hero-left { padding-top: 90px !important; }
  .hero-h1 { font-size: 36px !important; letter-spacing: -1px; }
  .hero-sub { font-size: 15px; }
  .features-section, .testi-section { padding: 60px 20px; }
  .footer-cta { padding: 60px 20px; }
  .ob-sidebar { width: 100%; border-right: none; border-bottom: 1.5px solid #EBE6F5; padding: 24px; }
  .ob-main { padding: 24px; }
  .nav-center { display: none; }
  .nav { padding: 0 20px; height: 60px; }
  .nav-logo { font-size: 19px; }
  .section-h2 { font-size: 28px !important; }
  .ob-wrap { display: flex; flex-direction: column; }
  .ob-sidebar { width: 280px; }
  .ob-main { padding: 24px 20px; }

  /* Grid Fallbacks */
  .resp-grid-2, .resp-grid-3, .resp-grid-dashboard-hub, .resp-grid-sidebar-left, .dash-grid {
    grid-template-columns: 1fr !important;
  }
  .resp-2col-grid { grid-template-columns: 1fr !important; }
  .resp-3col-grid { grid-template-columns: 1fr !important; }
  .form-row { grid-template-columns: 1fr !important; }
  .phone-opts { grid-template-columns: 1fr !important; }
  .plan-grid { grid-template-columns: 1fr !important; }
  .voice-grid { grid-template-columns: 1fr !important; }
  .features-bento { grid-template-columns: 1fr !important; }
  .feat-card { grid-column: span 1 !important; }
  .testi-grid { grid-template-columns: 1fr !important; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .dash-main { padding: 24px 16px; }
  .card { overflow-x: auto; scrollbar-width: none; }
  .live-banner { flex-direction: column; text-align: center; gap: 12px; }
  .lb-wave { margin: 10px auto; }
  .lb-btn { margin-left: 0; }
  .proof-bar { padding: 20px; flex-direction: column; gap: 16px; }
  .proof-div { display: none; }
  .dash-topbar { flex-wrap: wrap; gap: 10px; align-items: flex-start; }
  .dash-topbar-right { width: 100%; justify-content: flex-end; }
  .page-title { font-size: 20px !important; }
  .page-sub { font-size: 12px; }
  .landing-nav-links { display: none !important; }

  /* Success screen */
  .success-screen { padding: 40px 24px; }
  .success-h1 { font-size: 38px !important; letter-spacing: -1px; }
  .success-sub { font-size: 15px; max-width: 340px; margin: 10px 0 32px; }
  .success-stats { flex-direction: column; gap: 12px; width: 100%; }
  .ss-card { padding: 16px 20px; }
  .success-icon { width: 80px; height: 80px; font-size: 36px; margin-bottom: 24px; }

  /* Calls card list on mobile */
  .calls-table-header { display: none !important; }
  .calls-table-row { display: none !important; }

  /* Landing grids */
  .features-section > div:first-child { grid-template-columns: 1fr !important; gap: 20px !important; }
  .testi-section > div > div:first-child { grid-template-columns: 1fr !important; gap: 20px !important; }
}

/* SMALL PHONE (max 480px) */
@media (max-width: 480px) {
  .hero-h1 { font-size: 30px !important; }
  .hero-sub { font-size: 14px; }
  .hero-cta { flex-direction: column; gap: 10px; }
  .btn-hero, .btn-hero-outline { width: 100%; justify-content: center; text-align: center; }
  .kpi-row { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
  .kpi-card { padding: 16px !important; }
  .kpi-value { font-size: 22px !important; }
  .nav { padding: 0 16px; }
  .dash-main { padding: 16px 12px; }
  .card { padding: 16px !important; border-radius: 14px !important; }
  .card-head { font-size: 14px !important; }
  .page-title { font-size: 18px !important; }
  .section-h2 { font-size: 24px !important; }
  .feat-card { padding: 24px 20px; }
  .proof-bar { padding: 16px; }
  .success-screen { padding: 32px 16px; }
  .success-h1 { font-size: 30px !important; }
  .success-sub { font-size: 14px; max-width: 300px; }
  .ss-val { font-size: 24px; }
  .resp-2col-grid { grid-template-columns: 1fr !important; }
  .resp-3col-grid { grid-template-columns: 1fr !important; }
  .dash-topbar { margin-bottom: 20px; }
  .dash-topbar-right { flex-wrap: wrap; gap: 8px; }
  .dash-live-badge { font-size: 11px; padding: 5px 12px; }
  .btn-secondary { font-size: 12px; padding: 8px 16px; }
  .ob-main { padding: 20px 16px; }
  .ob-heading { font-size: 26px !important; }
  .plan-price { font-size: 34px !important; }
  .transcript-turn.agent { margin-right: 16px; }
  .transcript-turn.caller { margin-left: 16px; }
}

\n`;

function AppRoutes() {
  const navigate = useNavigate();
  const { authChecked, handleLogin } = useAuth();
  const [obBizName, setObBizName] = useState("");
  const [obAgentName, setObAgentName] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obBizHours, setObBizHours] = useState(null); // hours found during business search
  const [obPhoneNumber, setObPhoneNumber] = useState(""); // phone number provisioned in Step5

  // Restore onboarding state from the backend after a page refresh
  useEffect(() => {
    if (!authChecked) return;
    api.agent.get().then(a => {
      if (a?.name) setObAgentName(a.name);
    }).catch(() => {});
    api.business.get().then(b => {
      if (b?.name) setObBizName(b.name);
      if (b?.phone) setObPhone(b.phone);
      if (b?.phoneConfig?.assignedNumber) setObPhoneNumber(b.phoneConfig.assignedNumber);
    }).catch(() => {});
  }, [authChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  const goOb = (n) => { window.scrollTo(0,0); navigate(`/onboarding/${n}`); };

  if (!authChecked) return <style>{G}</style>;

  return (
    <>
      <style>{G}</style>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing onCTA={() => navigate('/onboarding/1')} onLogin={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginScreenExternal />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          {/* <Route path="/onboarding/0" element={<Step0 onNext={() => goOb(1)} onBack={() => navigate('/')} />} /> */}
          <Route path="/onboarding/1" element={<Step1 onNext={() => goOb(2)} onBack={() => navigate('/')} onRegister={(userData) => handleLogin(userData)} />} />
          <Route path="/onboarding/2" element={<Step2 onNext={() => goOb(3)} onBack={() => goOb(1)} onBizNameChange={setObBizName} onBizPhoneChange={setObPhone} onHoursFound={setObBizHours} />} />
          <Route path="/onboarding/3" element={<Step3 onNext={() => goOb(4)} onBack={() => goOb(2)} />} />
          <Route path="/onboarding/4" element={<Step4 onNext={() => goOb(5)} onBack={() => goOb(3)} bizName={obBizName} bizPhone={obPhone} onAgentNameChange={setObAgentName} bizHoursFromSearch={obBizHours} />} />
          <Route path="/onboarding/5" element={<Step5 onNext={() => goOb(6)} onBack={() => goOb(4)} agentName={obAgentName} onPhoneProvisioned={setObPhoneNumber} />} />
          <Route path="/onboarding/6" element={<Step6 onNext={() => goOb(7)} onBack={() => goOb(5)} agentName={obAgentName} phoneNumber={obPhoneNumber} />} />
          <Route path="/onboarding/7" element={<Step7 onNext={() => navigate('/success')} onBack={() => goOb(6)} />} />
          <Route path="/success" element={<SuccessScreen onDashboard={() => navigate('/dashboard')} agentName={obAgentName} bizName={obBizName} />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardApp /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminApp /></RequireAdmin>} />
          <Route path="/pay" element={<PaymentLinkScreen onBack={() => navigate('/')} />} />
          <Route path="/pay/confirm" element={<PaymentConfirmScreen onBack={() => navigate('/')} />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
