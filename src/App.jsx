import { useState, useEffect, useRef } from "react";
import { Conversation } from "@elevenlabs/client";
import { api, setAccessToken, getAccessToken, clearAccessToken } from "./api.js";

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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');

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
\n
/* ── RESPONSIVE CLASSES ── */
.resp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.resp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.resp-grid-dashboard-hub { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 18px; }
.resp-grid-sidebar-left { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 18px; }

.resp-show-mobile { display: none !important; }
.mob-close-btn { display: none; }

/* ── MEDIA QUERIES ── */

/* TABLET (max 1440px) */
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
  .resp-grid-2, .resp-grid-3, .resp-grid-dashboard-hub, .resp-grid-sidebar-left, .kpi-row, .dash-grid {
    grid-template-columns: 1fr !important;
  }
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
  .kpi-row { gap: 10px !important; }
  .kpi-card { padding: 16px !important; }
  .kpi-value { font-size: 22px !important; }
  .nav { padding: 0 16px; }
  .dash-main { padding: 16px 12px; }
  .card { padding: 16px !important; border-radius: 14px !important; }
  .card-head { font-size: 15px !important; }
  .section-h2 { font-size: 24px !important; }
  .feat-card { padding: 24px 20px; }
  .proof-bar { padding: 16px; }
  .success-screen { padding: 32px 16px; }
  .success-h1 { font-size: 30px !important; }
  .success-sub { font-size: 14px; max-width: 300px; }
  .ss-val { font-size: 24px; }
}

\n`;

/* ═══════════════════════════════════════════
   STEP DEFINITIONS
═══════════════════════════════════════════ */
const STEPS = [
  { name: "Hear it live",     time: "~2 min" },
  { name: "Create account",   time: "~1 min" },
  { name: "Business info",    time: "~1 min" },
  { name: "Import menu",      time: "~3 min" },
  { name: "AI voice & script",time: "~4 min" },
  { name: "Phone number",     time: "~3 min" },
  { name: "Test call",        time: "~2 min" },
  { name: "Choose plan",      time: "~2 min" },
];

/* ═══════════════════════════════════════════
   SHARED ONBOARDING SHELL
═══════════════════════════════════════════ */
function ObShell({ step, children, onNext, onBack, nextLabel = "Continue →" }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  const [obOpen, setObOpen] = useState(false);
  return (
    <div className="ob-wrap">
      <style>{G}</style>
      {/* Overlay for mobile sidebar */}
      <div className={`ob-overlay ${obOpen?"ob-open":""}`} onClick={()=>setObOpen(false)}/>
      <aside className={`ob-sidebar ${obOpen?"ob-open":""}`}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div className="ob-sidebar-logo">
            <div className="ob-sidebar-logo-mark">t</div>
            talkativ
          </div>
          <button className="ob-hamburger" onClick={()=>setObOpen(false)} style={{display:"none",background:"none",border:"none",cursor:"pointer",fontSize:22,color:T.mid,padding:4,borderRadius:8,alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "upcoming";
          return (
            <div key={s.name}>
              <div className="ob-step-item">
                <div className={`ob-step-num ${state === "done" ? "sn-done" : state === "active" ? "sn-active" : "sn-upcoming"}`}>
                  {state === "done" ? "✓" : i + 1}
                </div>
                <div className="ob-step-info">
                  <div className={`step-name ${state}`}>{s.name}</div>
                  {state === "active" && <div className="step-time">{s.time}</div>}
                </div>
              </div>
              {i < STEPS.length - 1 && <div className="ob-step-line" />}
            </div>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1.5px solid ${T.line}` }}>
          <div style={{ fontSize: 12, color: T.soft, marginBottom: 7 }}>Need help?</div>
          <div style={{ fontSize: 13.5, color: T.p600, fontWeight: 600, cursor: "pointer" }}>💬 Chat with us</div>
        </div>
      </aside>

      <div className="ob-main">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <button className="ob-hamburger" onClick={()=>setObOpen(true)} style={{display:"none",background:"none",border:"none",cursor:"pointer",fontSize:24,color:T.ink,padding:0,alignItems:"center",justifyContent:"center"}}>☰</button>
          <div style={{flex:1}}>
            <div className="ob-progress-bar">
              <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="ob-progress-label">Step {step + 1} of {STEPS.length} · {STEPS[step].time} remaining</div>
          </div>
        </div>
        <div style={{ flex: 1, marginTop: 8 }}>{children}</div>
        <div className="ob-footer">
          <button className="btn-back" onClick={onBack}>← Back</button>
          <button className="btn-next" onClick={onNext}>{nextLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════ */
function Landing({ onCTA, onLogin }) {
  return (
    <div style={{ background: T.ivory }}>
      <style>{G}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-mark">t</div>
          talkativ
        </div>
        <div className="nav-center">
          {["Features", "Integrations", "Pricing", "Blog"].map(l => (
            <span key={l} className="nav-link">{l}</span>
          ))}
        </div>
        <div className="nav-right">
          <button className="btn-ghost" onClick={onLogin}>Log in</button>
          <button className="btn-primary" onClick={onCTA}>Start free →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-wrap">
        {/* bg shapes */}
        <svg className="hero-bg-shape" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
          <ellipse cx="1100" cy="200" rx="480" ry="380" fill={T.p50} />
          <ellipse cx="200" cy="700" rx="280" ry="220" fill={T.mist} />
          <circle cx="1200" cy="700" r="120" fill={T.frost} />
        </svg>
        {/* dot grid */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: `radial-gradient(${T.p200} 1.2px, transparent 0)`, backgroundSize: "32px 32px", opacity: .3 }} />

        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-dot" />
            Live on 2,400+ restaurants worldwide
          </div>
          <h1 className="hero-h1">
            Never miss<br />
            a single<br />
            <em>phone call</em>
          </h1>
          <p className="hero-sub">
            Talkativ is your restaurant's always-on AI phone agent — it answers every call, takes orders, and books reservations 24/7, in your voice.
          </p>
          <div className="hero-cta">
            <button className="btn-hero" onClick={onCTA}>
              Get started free
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </button>
            <button className="btn-hero-outline" onClick={onCTA}>
              ▷ Hear a demo call
            </button>
          </div>
          <div className="hero-trust">
            <span>Loved by 2,400+ restaurant owners</span>
          </div>
        </div>

        {/* RIGHT — floating bento */}
        <div className="hero-right">
          <div className="bento-main">
            <div className="call-header">
              <div>
                <div className="call-name">Tony's Pizzeria</div>
                <div className="call-sub">Talkativ AI · Active call</div>
              </div>
              <div className="live-badge">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite" }} />
                LIVE
              </div>
            </div>
            <div className="waveform">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.07}s`, height: 4 + Math.random() * 8 + "px" }} />
              ))}
            </div>
            <div className="chat-bubble chat-ai">
              <span className="chat-tag">ARIA · TALKATIV</span>
              Thanks for calling Tony's! Would you like to place an order for delivery or collection today?
            </div>
            <div className="chat-bubble chat-user">
              <span className="chat-tag">CUSTOMER</span>
              Large pepperoni pizza and garlic bread please — delivery to Manchester M1.
            </div>
            <div className="stat-grid">
              {[["100%", "Calls answered"], ["22%", "Avg. order uplift"]].map(([n, l]) => (
                <div className="stat-c" key={l}>
                  <div className="stat-n">{n}</div>
                  <div className="stat-l">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* floating mini cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { icon: "⚡", label: "Live in 20 min", sub: "Self-serve setup" },
              { icon: "🔌", label: "POS connected", sub: "Clover · Square · renOS" },
              { icon: "🌙", label: "24/7 coverage", sub: "Zero missed calls" },
              { icon: "📊", label: "Live dashboard", sub: "Every call tracked" },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 16px rgba(134,87,255,.06)`, transition: "all .22s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = T.p300; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = T.line; }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{label}</div>
                  <div style={{ fontSize: 11, color: T.soft, marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <div className="proof-bar">
        {[["100%", "Calls answered"], ["22%", "Order uplift"], ["17%", "Labour saved"], ["<20min", "Go live"], ["2,400+", "Restaurants"]].map(([n, l], i, arr) => (
          <>
            <div className="proof-item" key={l}>
              <div className="proof-n">{n}</div>
              <div className="proof-l">{l}</div>
            </div>
            {i < arr.length - 1 && <div className="proof-div" key={`d${i}`} />}
          </>
        ))}
      </div>

      {/* FEATURES */}
      <section style={{ background: T.ivory }}>
        <div className="features-section">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 60 }}>
            <div>
              <span className="section-tag">Why talkativ</span>
              <h2 className="section-h2">Built for restaurants<br />that <em>never stop</em></h2>
            </div>
            <p className="section-sub">
              Not a generic chatbot. An AI phone agent that knows your menu, speaks your brand voice, and works 24/7 without a day off.
            </p>
          </div>
          <div className="features-bento">
            {[
              { span: 4, icon: "🎙️", title: "Sounds like you", body: "Custom voice, agent name, and brand tone. Your customers won't know it's AI." },
              { span: 4, icon: "📋", title: "Knows your menu", body: "Import via URL, PDF, or POS. Orders go directly to your kitchen system." },
              { span: 4, icon: "🌙", title: "Always on", body: "Every call answered — even at 2am, during peak rush, on bank holidays." },
              { span: 6, icon: "🔌", title: "Deep POS integrations", body: "Clover, Square, and renOS. One-click setup, real-time sync." },
              { span: 3, icon: "⚡", title: "Live in 20 min", body: "No sales calls. No IT team. Self-serve and ready in under 20 minutes." },
              { span: 3, icon: "📊", title: "Live analytics", body: "Every call, order and transcript in one beautiful dashboard." },
            ].map(({ span, icon, title, body }) => (
              <div key={title} className="feat-card" style={{ gridColumn: `span ${span}` }}>
                <div className="feat-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi-section">
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 52 }}>
            <div>
              <span className="section-tag" style={{ color: T.p300 }}>What they say</span>
              <h2 className="section-h2" style={{ color: "white" }}>Restaurants that<br /><em>never miss a call</em></h2>
            </div>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.7, fontWeight: 300 }}>
              "We stopped missing calls. That alone paid for the subscription in the first week."
            </p>
          </div>
          <div className="testi-grid">
            {[
              ["★★★★★", "Maria C.", "Owner, La Cucina", "We were missing 30+ calls a week during lunch. Talkativ handles all of them now and average order value is up because the AI upsells naturally."],
              ["★★★★★", "James T.", "Manager, The Grill Co.", "Setup took 18 minutes. Genuinely. The voice quality is incredible — regular customers think it's a real member of staff."],
              ["★★★★★", "Sarah K.", "Owner, Pho Garden", "The Square integration is seamless. Orders appear on the POS instantly. We've saved 3 hours of admin every single day."],
            ].map(([stars, name, role, quote]) => (
              <div className="testi-card" key={name}>
                <div className="testi-stars">{stars}</div>
                <p className="testi-q">"{quote}"</p>
                <div className="testi-author"><strong>{name}</strong> · {role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 50, padding: "6px 18px", fontSize: 12.5, fontWeight: 600, color: T.p600, marginBottom: 28, boxShadow: `0 2px 12px rgba(134,87,255,.08)` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
            No credit card required · 14-day free trial
          </div>
          <h2 className="section-h2" style={{ textAlign: "center", fontSize: "clamp(40px,6vw,68px)", marginBottom: 16 }}>
            Ready to go <em>live?</em>
          </h2>
          <p style={{ fontSize: 17, color: T.mid, marginBottom: 40, fontWeight: 300 }}>
            Your AI agent could be answering calls in under 20 minutes.
          </p>
          <button className="btn-hero" onClick={onCTA}>
            Start for free today →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ONBOARDING STEPS
═══════════════════════════════════════════ */
function Step0({ onNext, onBack }) {
  const [ph, setPh] = useState("");
  const [calling, setCalling] = useState(false);
  return (
    <ObShell step={0} onNext={onNext} onBack={onBack} nextLabel="Create my account →">
      <div className="ob-step-label">Step 1 · Experience first</div>
      <h1 className="ob-heading">Hear <em>Talkativ</em><br />before signing up</h1>
      <p className="ob-subheading">Enter your number and we'll call you right now. Place a test order — no commitment needed.</p>
      <div className="form-group">
        <label className="form-label">Your mobile number</label>
        <input className="form-input" placeholder="+44 7700 000 000" value={ph} onChange={e => setPh(e.target.value)} style={{ fontSize: 18, padding: "16px 20px" }} />
      </div>
      <button
        onClick={() => setCalling(true)}
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, background: calling ? T.greenBg : T.ink, border: calling ? `1.5px solid ${T.greenBd}` : "none", color: calling ? T.green : "white", borderRadius: 50, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: calling ? "none" : "0 4px 20px rgba(19,13,46,.18)", transition: "all .3s" }}>
        {calling ? "📞 Calling you now…" : "📞 Call me now"}
      </button>
      {calling && (
        <div className="bento-main" style={{ maxWidth: 400, margin: 0 }}>
          <div className="call-header">
            <div className="call-avatar">🤖</div>
            <div><div className="call-name">Talkativ Demo</div><div className="call-sub">Calling {ph || "+44 7700 000 000"}</div></div>
            <div className="live-badge"><div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite" }} />LIVE</div>
          </div>
          <div className="waveform">{Array.from({ length: 14 }, (_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * .08}s` }} />)}</div>
          <div className="chat-bubble chat-ai"><span className="chat-tag">ARIA · TALKATIV</span>Hi! You're through to Talkativ's demo. Go ahead and place a test order — I'll handle everything!</div>
        </div>
      )}
      {!calling && <p style={{ fontSize: 13, color: T.soft, fontStyle: "italic" }}>Prefer to skip? Hit Continue → below.</p>}
    </ObShell>
  );
}

function Step1({ onNext, onBack, onPhoneChange, onRegister }) {
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
      await api.auth.register(email.trim(), password, firstName.trim(), lastName.trim(), phone.trim());
      if (onPhoneChange) onPhoneChange(phone.trim());
      if (onRegister) onRegister({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
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

function Step2({ onNext, onBack, onBizNameChange }) {
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

  // Summarize hours (e.g., "Mon–Sun · 11am – 11pm" or "Mon–Fri: 11–11, Sat–Sun: 12–10")
  const shortHours = (h) => {
    if (!h) return "";
    // If it's already short, return as is
    if (h.length < 40) return h;
    // Otherwise truncate
    const parts = h.split(",").map(s => s.trim());
    if (parts.length <= 2) return parts.join(", ");
    return parts[0] + " … " + parts[parts.length - 1];
  };

  return (
    <ObShell step={2} onNext={async () => {
      if (!bizName.trim()) return;
      try {
        await api.settings.updateBusiness({ name: bizName, type: bizCategory, address: bizAddress, phone: bizPhone, openingHours: buildOpeningHours() });
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
              style={{
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: i < results.length - 1 ? `1px solid ${T.line}` : "none",
                transition: "background .15s",
              }}
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
          {/* Header */}
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

          {/* Fields — editable or read-only */}
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

      {/* ── Working Hours Schedule ── */}
      <div style={{ marginTop: 28, animation: "fadeUp .3s ease both" }}>
        <div style={{ fontSize: 13, color: T.soft, marginBottom: 4 }}>When are you open?</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Set your working schedule</div>

        {/* 24/7 toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", userSelect: "none" }}
          onClick={() => setIs24h(v => !v)}>
          <div style={{
            width: 20, height: 20, borderRadius: 5, border: `2px solid ${is24h ? T.p600 : T.line}`,
            background: is24h ? T.p600 : T.white, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0, transition: "all .15s"
          }}>
            {is24h && <span style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>We operate 24/7</span>
        </label>

        {/* Day columns */}
        {!is24h && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {[["mon","Mon"],["tue","Tue"],["wed","Wed"],["thu","Thu"],["fri","Fri"],["sat","Sat"],["sun","Sun"]].map(([key, label]) => {
              const day = schedule[key];
              return (
                <div key={key} style={{
                  background: T.white, border: `1.5px solid ${day.open ? T.p400 : T.line}`,
                  borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, transition: "border-color .15s", minWidth: 0
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day.open ? T.p700 : T.ink }}>{label}</div>
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleDay(key)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, border: `2px solid ${day.open ? T.p600 : T.line}`,
                      background: day.open ? T.p600 : T.white, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s"
                    }}
                  >
                    {day.open && <span style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                  </div>
                  {/* Time inputs — shown when day is checked */}
                  {day.open && (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div>
                        <div style={{ fontSize: 9, color: T.soft, marginBottom: 2, textAlign: "center" }}>Open</div>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={e => updateTime(key, "openTime", e.target.value)}
                          style={{
                            width: "100%", border: `1.5px solid ${T.line}`, borderRadius: 7,
                            padding: "4px 4px", fontSize: 11, fontFamily: "'Outfit',sans-serif",
                            color: T.ink, outline: "none", textAlign: "center", boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: T.soft, marginBottom: 2, textAlign: "center" }}>Close</div>
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={e => updateTime(key, "closeTime", e.target.value)}
                          style={{
                            width: "100%", border: `1.5px solid ${T.line}`, borderRadius: 7,
                            padding: "4px 4px", fontSize: 11, fontFamily: "'Outfit',sans-serif",
                            color: T.ink, outline: "none", textAlign: "center", boxSizing: "border-box"
                          }}
                        />
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

const POS_SYSTEMS = [
  { name: "Clover", icon: "🍀", type: "ordering",     fields: [{ key: "accessToken", label: "Access Token", ph: "..." }, { key: "merchantId", label: "Merchant ID", ph: "XXXXXXXXXXXXXXXX" }] },
  { name: "Square", icon: "🟦", type: "ordering",     fields: [{ key: "accessToken", label: "Access Token", ph: "EAAAl..." }, { key: "locationId", label: "Location ID", ph: "LXXXXXXXXXXXXXXXX" }] },
  { name: "renOS",  icon: "📅", type: "reservation",  fields: [{ key: "apiKey", label: "API Key", ph: "rn_live_..." }, { key: "propertyId", label: "Property ID", ph: "PROP-XXXXXXXX" }] },
];

function Step3({ onNext, onBack }) {
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
    { icon: "🔌", title: "Connect your POS", desc: "Clover, Square, renOS", badge: "Recommended" },
  ];

  const resetResult = () => { setResult(null); setError(null); };
  const handleSelChange = (i) => { setSel(i); resetResult(); setPosSelected(null); setPosFields({}); };
  const handlePosSelect = (name) => { setPosSelected(name); setPosFields(configuredSystems[name] || {}); resetResult(); };

  // Setup wizard helpers
  const setupSystem = setupModal === "ordering"
    ? POS_SYSTEMS.find(p => p.name === "Square")
    : setupModal === "reservation"
    ? POS_SYSTEMS.find(p => p.name === "renOS")
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
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
              {setupModal === "picker" ? "Setup your integration" : setupModal === "ordering" ? "🟦 Connect Square" : "📅 Connect renOS"}
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
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>Reservation — Connect with renOS</div>
                    <div style={{ fontSize: 12, color: T.soft, marginTop: 3 }}>Manage bookings and table reservations</div>
                  </div>
                  {configuredSystems["renOS"] && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "3px 9px", flexShrink: 0 }}>Connected</span>}
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
                {setupModal === "ordering" ? "Square Developer Dashboard" : "renOS account settings"}.
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
                {setupDone === "renOS" ? "Reservation management is now linked to your agent." : "Order sync with your KDS is now active."}
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

// Voice catalogue — keyed by gender
const VOICE_CATALOGUE = {
  female: [
    { n: "Aria",  id: "21m00Tcm4TlvDq8ikWAM", d: "Warm & professional" },
    { n: "Bella", id: "EXAVITQu4vr4xnSDxMaL", d: "Soft & pleasant" },
  ],
  male: [
    { n: "Antoni", id: "ErXwobaYiN019PkySvjV", d: "Well-rounded" },
    { n: "Adam",   id: "pNInz6obpgDQGcFmaJgB", d: "Deep & authoritative" },
  ],
};

function Step4({ onNext, onBack, bizName, bizPhone, onAgentNameChange }) {
  const [gender, setGender] = useState("female");
  const voices = VOICE_CATALOGUE[gender];
  const [vc, setVc] = useState(0);
  const [agentName, setAgentName] = useState("Aria");
  const [greetingEdited, setGreetingEdited] = useState(false);
  const displayBiz = bizName || "your restaurant";
  const autoGreeting = `Hi, thanks for calling us at ${displayBiz}! I'm ${agentName}, your AI assistant. Would you like to place an order, check our hours, or something else?`;
  const [greeting, setGreeting] = useState(autoGreeting);
  const [fallbackAction, setFallbackAction] = useState("transfer");

  // Schedule — uses module-level helpers
  const [agentIs24h,   setAgentIs24h]   = useState(false);
  const [agentSchedule, setAgentSchedule] = useState(makeDefaultSchedule());

  // Voice preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePreview = async () => {
    if (previewPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPreviewPlaying(false);
      return;
    }
    setPreviewLoading(true);
    try {
      const data = await api.agent.previewVoice({ voiceId: voices[vc].id, text: greeting });
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audioRef.current = audio;
      audio.onended = () => { setPreviewPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setPreviewPlaying(false); audioRef.current = null; };
      await audio.play();
      setPreviewPlaying(true);
    } catch { /* preview unavailable */ }
    setPreviewLoading(false);
  };

  const handleGenderChange = (g) => {
    setGender(g);
    setVc(0);
    // Reset agent name to first voice of new gender
    const firstName = VOICE_CATALOGUE[g][0].n;
    setAgentName(firstName);
    if (!greetingEdited) {
      setGreeting(`Hi, thanks for calling us at ${displayBiz}! I'm ${firstName}, your AI assistant. Would you like to place an order, check our hours, or something else?`);
    }
  };

  const handleAgentNameChange = (val) => {
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
        transferNumber: fallbackAction === "transfer" ? (bizPhone || null) : null,
        agentSchedule: buildHours(agentIs24h, agentSchedule),
      });
    } catch {}
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

      {/* Voice picker */}
      <label className="form-label" style={{ marginBottom: 12 }}>Choose a voice</label>
      <div className="voice-grid">
        {voices.map((v, i) => (
          <div key={v.n} className={`voice-card ${vc === i ? "selected" : ""}`} onClick={() => setVc(i)}>
            <div className="voice-name">{v.n}</div>
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

      {/* ── Hear your agent preview ── */}
      <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Hear how your agent sounds</div>
        <div style={{ fontSize: 12, color: T.soft, marginBottom: 16 }}>Based on your voice selection, name and greeting message.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Play/Stop button */}
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            style={{ width: 48, height: 48, borderRadius: "50%", border: "none", background: previewPlaying ? T.red : `linear-gradient(135deg,${T.p400},${T.p700})`, color: "white", fontSize: 18, cursor: previewLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 14px rgba(112,53,245,.3)`, transition: "all .2s", opacity: previewLoading ? 0.7 : 1 }}>
            {previewPlaying ? "⏹" : "▶"}
          </button>
          {/* Waveform animation */}
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
            {previewLoading ? "Generating…" : previewPlaying ? "Playing…" : `${voices[vc].n} · ${voices[vc].d}`}
          </div>
        </div>
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

      {/* ── Agent Working Schedule ── */}
      <div style={{ marginTop: 8, background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, color: T.soft, marginBottom: 2 }}>Agent working schedule</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 14 }}>When should your agent be active?</div>
        <ScheduleInlineEditor
          is24h={agentIs24h}
          setIs24h={setAgentIs24h}
          schedule={agentSchedule}
          setSchedule={setAgentSchedule}
        />
        {agentIs24h && (
          <div style={{ marginTop: 12, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: T.green, fontWeight: 600 }}>
            Your agent will answer calls around the clock, every day.
          </div>
        )}
      </div>
    </ObShell>
  );
}

function Step5({ onNext, onBack }) {
  const [opt, setOpt] = useState(0);
  return (
    <ObShell step={5} onNext={onNext} onBack={onBack} nextLabel="Connect number →">
      <div className="ob-step-label">Step 6 · Phone number</div>
      <h1 className="ob-heading">Connect your<br /><em>phone number</em></h1>
      <p className="ob-subheading">Choose how calls are routed to Talkativ. This takes about 3 minutes.</p>
      <div className="phone-opts">
        <div className={`phone-opt ${opt === 0 ? "selected" : ""}`} onClick={() => setOpt(0)}>
          <div className="phone-opt-icon">🔀</div>
          <h4>Forward existing number</h4>
          <p>Keep your current number. We'll walk you through your carrier's call forwarding settings step by step.</p>
        </div>
        <div className={`phone-opt ${opt === 1 ? "selected" : ""}`} onClick={() => setOpt(1)}>
          <div className="phone-opt-icon">✨</div>
          <h4>Get a new number</h4>
          <p>We'll instantly assign you a local number — perfect if you're starting fresh or running a new line.</p>
        </div>
      </div>
      {opt === 0 && (
        <div className="info-block">
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 14, fontSize: 14 }}>📱 Forwarding instructions</div>
          {["Dial *21*[your Talkativ number]# on your phone", "Press Call — you'll hear a short confirmation tone", "Return here and click Verify below"].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.p600, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 8px rgba(112,53,245,.3)` }}>{i + 1}</div>
              <div style={{ fontSize: 13.5, color: T.mid, paddingTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      )}
      {opt === 1 && (
        <div style={{ marginTop: 18 }}>
          <label className="form-label">Choose your area code</label>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {["Manchester +44 161", "London +44 20", "Birmingham +44 121", "Leeds +44 113"].map(a => (
              <div key={a} style={{ border: `1.5px solid ${T.faint}`, borderRadius: 50, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: T.p700, cursor: "pointer", background: T.white, transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.p400; e.currentTarget.style.background = T.p50; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.faint; e.currentTarget.style.background = T.white; }}>
                {a}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 13, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13.5, color: T.green, fontWeight: 600 }}>+44 161 792 4831 is available and ready to assign</span>
          </div>
        </div>
      )}
    </ObShell>
  );
}

function Step6({ onNext, onBack, agentName }) {
  const [called, setCalled] = useState(false);
  const displayAgent = agentName || "Your agent";
  return (
    <ObShell step={6} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 7 · Test call</div>
      <h1 className="ob-heading">Test your agent<br />before <em>going live</em></h1>
      <p className="ob-subheading">One click to hear exactly what your customers will experience when they call.</p>
      <div className="test-call-card">
        <div className="test-call-icon">{called ? "✅" : "📞"}</div>
        <h3>{called ? "Your agent sounds perfect!" : "Ready to make a test call?"}</h3>
        <p>{called ? `Everything is working beautifully. ${displayAgent} is ready to go live to your customers.` : "Call your Talkativ number and hear your fully configured AI agent answering as your business."}</p>
        {!called && (
          <button onClick={() => setCalled(true)} style={{ background: T.ink, color: "white", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(19,13,46,.2)", transition: "all .22s", position: "relative", zIndex: 1 }}>
            📞 Call my number now
          </button>
        )}
        {called && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <button onClick={() => setCalled(false)} style={{ background: T.white, color: T.p600, border: `1.5px solid ${T.p200}`, borderRadius: 50, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Call again</button>
            <button style={{ background: T.white, color: T.p600, border: `1.5px solid ${T.p200}`, borderRadius: 50, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Tweak agent</button>
          </div>
        )}
      </div>
      {called && (
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          {[["📞", "1 call", "Completed"], ["⏱️", "0:42", "Duration"], ["✅", "Order taken", "Outcome"]].map(([ic, v, l]) => (
            <div key={l} style={{ flex: 1, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: 18, textAlign: "center", boxShadow: `0 4px 16px rgba(134,87,255,.06)` }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: T.p600 }}>{v}</div>
              <div style={{ fontSize: 11, color: T.soft, marginTop: 3, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </ObShell>
  );
}

function Step7({ onNext, onBack }) {
  const [plan, setPlan] = useState(1);
  return (
    <ObShell step={7} onNext={onNext} onBack={onBack} nextLabel="Start free trial →">
      <div className="ob-step-label">Step 8 · Plan</div>
      <h1 className="ob-heading">Choose your<br /><em>plan</em></h1>
      <p className="ob-subheading">14-day free trial on all plans. No charge until your trial ends — cancel any time.</p>
      <div className="plan-grid">
        {[
          { nm: "Starter", pr: "£199", fs: ["100% calls answered", "Menu Q&A & information", "Basic call analytics", "Email support"] },
          { nm: "Growth", pr: "£399", fs: ["Everything in Starter", "Takeout & delivery orders", "Reservation booking", "POS integration", "Priority support"], pop: true },
        ].map((p, i) => (
          <div key={p.nm} className={`plan-card ${plan === i ? "selected" : ""}`} onClick={() => setPlan(i)}>
            {p.pop && <div className="plan-popular-badge">Most popular</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div className="plan-name">{p.nm}</div>
                <div className="plan-price">{p.pr}<span>/mo</span></div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === i ? T.p500 : T.faint}`, background: plan === i ? T.p500 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {plan === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
              </div>
            </div>
            <div className="plan-feature-list">{p.fs.map(f => <div key={f} className="plan-feature">{f}</div>)}</div>
          </div>
        ))}
      </div>
      <div className="info-block">
        <div style={{ fontWeight: 700, color: T.ink, marginBottom: 16, fontSize: 14 }}>💳 Payment details</div>
        <div className="form-group"><label className="form-label">Card number</label><input className="form-input" placeholder="4242 4242 4242 4242" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Expiry date</label><input className="form-input" placeholder="MM / YY" /></div>
          <div className="form-group"><label className="form-label">CVC</label><input className="form-input" placeholder="123" /></div>
        </div>
        <div style={{ fontSize: 12, color: T.soft, display: "flex", alignItems: "center", gap: 6 }}>Secured by Stripe · You won't be charged until your 14-day trial ends</div>
      </div>
    </ObShell>
  );
}

/* ═══════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════ */
function SuccessScreen({ onDashboard, agentName, bizName }) {
  const displayAgent = agentName || "Aria";
  const displayBiz = bizName || "your business";
  return (
    <div className="success-screen">
      <style>{G}</style>
      <div className="success-bg" />
      <div className="success-icon">🎉</div>
      <h1 className="success-h1">You're live!</h1>
      <p className="success-sub">{displayAgent} is now answering calls for {displayBiz}. Your first real customer call could come in any moment.</p>
      <div className="success-stats">
        {[["📞", "Live", "Agent status"], ["⏱️", "24/7", "Coverage"], ["🛒", "Ready", "For orders"]].map(([ic, v, l]) => (
          <div className="ss-card" key={l}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{ic}</div>
            <div className="ss-val">{v}</div>
            <div className="ss-label">{l}</div>
          </div>
        ))}
      </div>
      <button className="btn-hero" onClick={onDashboard} style={{ position: "relative", zIndex: 1 }}>
        Open my dashboard →
      </button>
      <p style={{ fontSize: 13, color: T.soft, marginTop: 22, position: "relative", zIndex: 1 }}>A welcome email with your first-week guide is on its way</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */


const NAV = [
  { section:"Main", items:[["📊","Dashboard"],["📞","Calls"],["📋","Orders"],["📅","Reservations"]] },
  { section:"Agent", items:[["🤖","My Agent"],["🎙️","Voice & Script"],["📋","Menu"]] },
  { section:"Account", items:[["🔌","Integrations"],["💳","Billing"],["⚙️","Settings"]] },
];

function Sidebar({ active, onNav, user, bizName }) {
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?';
  return (
    <aside className="dash-sidebar">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="dash-logo">
          <div className="dash-logo-mark">t</div>talkativ
        </div>
        <button className="mob-close-btn" onClick={()=>document.body.classList.remove('mob-nav-open')} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:T.mid,padding:4,borderRadius:8,alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {NAV.map(({ section, items }) => (
        <div key={section}>
          <div className="dash-section-label">{section}</div>
          {items.map(([ic, label]) => (
            <div
              key={label}
              className={`dash-nav-item ${active === label ? "active" : ""}`}
              onClick={() => onNav(label)}
            >
              <span className="dash-nav-icon">{ic}</span>{label}
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop:"auto", paddingTop:18, borderTop:`1.5px solid ${T.line}` }}>
        <div className="dash-nav-item">
          <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white" }}>{initials}</div>
          {bizName || user?.firstName || 'My Business'}
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, children, user, agentName }) {
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ' ·');
  return (
    <div className="dash-topbar">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
        <div>
          <div className="dash-date">{dateStr}</div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="dash-topbar-right">
        <div className="dash-live-badge">
          <div style={{ width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite" }} />
          {agentName || 'Agent'} live
        </div>
        {children}
        <div className="dash-avatar">{initials}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE 1 — DASHBOARD (HOME)
═══════════════════════════════════════════ */
function PageDashboard({ onNav, user, agentName, bizName, agentData }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ' ·');
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?';
  const displayAgent = agentName || 'Aria';
  const displayBiz = bizName || 'your business';
  const voiceDesc = agentData?.voiceDescription || 'Warm & professional';
  const fallbackLabels = { transfer: "Transfer", voicemail: "Voicemail", callback: "Call back" };
  const callRulesLabel = fallbackLabels[agentData?.fallbackAction] || "Transfer";

  const bars = [42,67,58,82,74,91,100,79,88,96,62,50];
  const days = ["M","T","W","T","F","S","S","M","T","W","T","F"];
  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
          <div>
            <div className="dash-date">{dateStr}</div>
            <div className="dash-greeting">{greeting}, <strong>{user?.firstName || 'there'}</strong> 👋</div>
          </div>
        </div>
        <div className="dash-topbar-right">
          <div className="dash-live-badge"><div style={{ width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite" }} />{displayAgent} live</div>
          <div className="dash-avatar">{initials}</div>
        </div>
      </div>

      <div className="kpi-row">
        {[{l:"Calls today",v:"0",d:"No calls yet today"},{l:"Revenue today",v:"£0",d:"No orders yet"},{l:"Avg. call time",v:"0:00",d:"—"},{l:"Answer rate",v:"0%",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Recent calls <span className="card-link" onClick={()=>onNav&&onNav("Calls")} style={{cursor:"pointer"}}>View all →</span></div>
            <div style={{ textAlign:"center", padding:"32px 16px", color:T.soft }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📵</div>
              <div style={{ fontSize:14, fontWeight:600, color:T.mid, marginBottom:6 }}>No recent calls yet</div>
              <div style={{ fontSize:12.5 }}>Calls will appear here once your number is connected.</div>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Your agent</div>
            <div className="agent-card">
              <div className="agent-avatar">🤖</div>
              <div><div className="agent-name">{displayAgent}</div><div className="agent-status"><div className="agent-status-dot"/>Active · {displayBiz}</div></div>
              <button className="agent-edit-btn" onClick={()=>onNav&&onNav("My Agent")}>Edit</button>
            </div>
            <div className="agent-meta">
              {[["Voice",`${displayAgent} · ${voiceDesc}`],["Language","English"],["Call rules",callRulesLabel],["POS","Clover / Square / renOS"]].map(([l,v])=>(
                <div key={l} className="agent-meta-item"><div className="agent-meta-label">{l}</div><div className="agent-meta-value">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head">Quick actions</div>
            <div className="quick-actions-grid">
              {[["📞","Test call",null],["📋","Update menu","Menu"],["⏰","Edit hours","Settings"]].map(([ic,l,nav])=>(
                <div key={l} className="qa-item" onClick={()=>nav&&onNav&&onNav(nav)} style={{cursor:nav?"pointer":"default"}}><div className="qa-icon">{ic}</div><div className="qa-label">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 2 — CALLS
═══════════════════════════════════════════ */
function PageCalls({ user, agentName, bizName }) {
  const [filter, setFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Today");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const calls = [];
  const tabs = ["All","Orders","Enquiries","Missed"];
  const timeFiltered = timeFilter==="Today"?calls.filter(c=>c.time.includes("Today")||c.time==="Live now"):timeFilter==="Yesterday"?calls.filter(c=>c.time.includes("Yesterday")):calls;
  const filtered = filter==="All"?timeFiltered:filter==="Orders"?timeFiltered.filter(c=>c.b==="order"):filter==="Missed"?timeFiltered.filter(c=>c.b==="missed"):timeFiltered.filter(c=>c.b==="info");
  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>All <strong>Calls</strong></>} subtitle="Every call routed through Talkativ with full transcripts" user={user} agentName={agentName}>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export CSV</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Total today",v:"0",d:"No calls yet"},{l:"Answered",v:"0",d:"—"},{l:"Avg. duration",v:"0:00",d:"—"},{l:"Orders taken",v:"0",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>{setFilter(t);setPage(1)}} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${filter===t?T.p500:T.line}`,background:filter===t?T.p50:"transparent",color:filter===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .18s"}}>
                {t}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <select value={timeFilter} onChange={e=>{setTimeFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>Today</option><option>Yesterday</option><option>This week</option><option>This month</option>
            </select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>📞</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No calls yet</div>
            <div style={{fontSize:13,color:T.soft}}>Calls handled by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          /* Mobile card layout */
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((c,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div className={`call-dot ${c.s==="live"?"live":c.s==="done"?"done":"miss"}`}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{c.n}</div>
                      <div style={{fontSize:12,color:T.soft,marginTop:2}}>{c.phone}</div>
                    </div>
                  </div>
                  <span className={`call-badge ${c.b==="order"?"order":c.b==="info"?"info":"missed"}`}>{c.outcome}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",gap:14}}>
                    <span style={{fontSize:12,color:T.soft}}>{c.time}</span>
                    <span style={{fontSize:12,color:T.soft}}>{c.dur}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:c.amount?T.ink:T.faint}}>{c.amount||"\u2014"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop table layout */
          <>
            <div className="calls-table-header" style={{display:"grid",gridTemplateColumns:"8px 1fr 160px 120px 80px 130px 120px",gap:14,padding:"8px 0 12px",borderBottom:`1.5px solid ${T.line}`,marginBottom:4}}>
              {["","Caller","Phone","Time","Duration","Outcome","Amount"].map(h=>(
                <div key={h} style={{fontSize:10.5,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px"}}>{h}</div>
              ))}
            </div>
            {paginated.map((c,i)=>(
              <div key={i} className="calls-table-row" style={{display:"grid",gridTemplateColumns:"8px 1fr 160px 120px 80px 130px 120px",gap:14,padding:"11px 0",borderBottom:`1px solid ${T.paper}`,alignItems:"center",cursor:"pointer",transition:"background .15s",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div className={`call-dot ${c.s==="live"?"live":c.s==="done"?"done":"miss"}`}/>
                <div><div className="call-name">{c.n}</div></div>
                <div style={{fontSize:13,color:T.soft}}>{c.phone}</div>
                <div style={{fontSize:13,color:T.soft}}>{c.time}</div>
                <div style={{fontSize:13,color:T.soft}}>{c.dur}</div>
                <span className={`call-badge ${c.b==="order"?"order":c.b==="info"?"info":"missed"}`}>{c.outcome}</span>
                <div style={{fontSize:13,fontWeight:600,color:c.amount?T.ink:T.faint}}>{c.amount||"\u2014"}</div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} calls</div>
            <div style={{display:"flex",gap:8}}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===1?"transparent":T.white,color:page===1?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===1?"default":"pointer",transition:"all .18s"}}>Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===totalPages?"transparent":T.white,color:page===totalPages?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===totalPages?"default":"pointer",transition:"all .18s"}}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 3 — ORDERS
═══════════════════════════════════════════ */
function PageOrders({ user, agentName, bizName }) {
  const [tab, setTab] = useState("Today");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const orders = [];
  const timeFiltered = tab==="Today"?orders.filter(o=>o.time.includes("pm")||o.time.includes("am")||o.time==="Now"):tab==="Yesterday"?orders.filter(o=>o.time==="Yesterday"):orders;
  const typeFilteredOrders = typeFilter==="All types"?timeFiltered:timeFiltered.filter(o=>o.type===typeFilter);
  const statusFilteredOrders = statusFilter==="All statuses"?typeFilteredOrders:statusFilter==="Completed"?typeFilteredOrders.filter(o=>o.status==="completed"):typeFilteredOrders.filter(o=>o.status==="live");
  const perPage = 5;
  const totalPages = Math.ceil(statusFilteredOrders.length / perPage);
  const paginated = statusFilteredOrders.slice((page-1)*perPage, page*perPage);
  const statusColor = { completed:"order", live:"purple" };
  return (
    <>
      <TopBar title={<>All <strong>Orders</strong></>} subtitle={`Orders taken by ${agentName || 'your agent'} across all calls`} user={user} agentName={agentName}>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Orders today",v:"0",d:"No orders yet"},{l:"Revenue today",v:"£0",d:"—"},{l:"Avg. order value",v:"£0",d:"—"},{l:"Delivery rate",v:"—",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Today","Yesterday","This week","This month"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setPage(1)}} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${tab===t?T.p500:T.line}`,background:tab===t?T.p50:"transparent",color:tab===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .18s"}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All types</option><option>Delivery</option><option>Collection</option>
            </select>
            <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}} style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All statuses</option><option>Completed</option><option>Live</option>
            </select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>🛍️</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No orders yet</div>
            <div style={{fontSize:13,color:T.soft}}>Orders taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((o,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.p600,fontFamily:"monospace"}}>{o.id}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{o.name}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:o.amount==="\u2014"?T.faint:T.ink}}>{o.amount}</div>
                </div>
                <div style={{fontSize:12,color:T.soft,marginBottom:10}}>{o.items}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{display:"flex",gap:8}}>
                    <span className="badge badge-purple">{o.type}</span>
                    <span className={`badge ${o.status==="live"?"badge-green":"badge-green"}`}>{o.status==="live"?"\u25cf Live":"\u2713 Done"}</span>
                  </div>
                  <span style={{fontSize:12,color:T.soft}}>{o.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns:"100px 1fr 200px 110px 100px 110px",gap:14,padding:"8px 0 12px",borderBottom:`1.5px solid ${T.line}`}}>
              {["Order ID","Customer","Items","Type","Status","Total"].map(h=>(
                <div key={h} style={{fontSize:10.5,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px"}}>{h}</div>
              ))}
            </div>
            {paginated.map((o,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"100px 1fr 200px 110px 100px 110px",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.paper}`,alignItems:"center",cursor:"pointer",transition:"background .15s",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{fontSize:12,fontWeight:700,color:T.p600,fontFamily:"monospace"}}>{o.id}</div>
                <div><div className="call-name">{o.name}</div><div className="call-detail">{o.time}</div></div>
                <div style={{fontSize:12.5,color:T.soft}}>{o.items}</div>
                <div><span className="badge badge-purple">{o.type}</span></div>
                <div><span className={`badge ${o.status==="live"?"badge-green":"badge-green"}`}>{o.status==="live"?"\u25cf Live":"\u2713 Done"}</span></div>
                <div style={{fontSize:14,fontWeight:700,color:o.amount==="\u2014"?T.faint:T.ink}}>{o.amount}</div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, statusFilteredOrders.length)} of {statusFilteredOrders.length} orders</div>
            <div style={{display:"flex",gap:8}}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===1?"transparent":T.white,color:page===1?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===1?"default":"pointer",transition:"all .18s"}}>Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===totalPages?"transparent":T.white,color:page===totalPages?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===totalPages?"default":"pointer",transition:"all .18s"}}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 4 — RESERVATIONS
═══════════════════════════════════════════ */
function PageReservations({ user, agentName, bizName }) {
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const reservations = [];
  const perPage = 5;
  const totalPages = Math.ceil(reservations.length / perPage);
  const paginated = reservations.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>Reservations</>} subtitle={`Bookings taken by ${agentName || 'your agent'} via phone`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>+ Add booking</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Today's covers",v:"0",d:"No bookings yet"},{l:"This week",v:"0",d:"—"},{l:"Avg. party size",v:"—",d:"—"},{l:"No-show rate",v:"—",d:"Connect a number to start"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div className="card-head" style={{marginBottom:0}}>Upcoming bookings</div>
        </div>

        {paginated.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>📅</div>
            <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No reservations yet</div>
            <div style={{fontSize:13,color:T.soft}}>Bookings taken by {agentName || 'your agent'} will appear here</div>
          </div>
        ) : isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {paginated.map((r,i)=>(
              <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:40,height:40,borderRadius:12,background:r.status==="confirmed"?T.p50:T.amberBg,border:`1.5px solid ${r.status==="confirmed"?T.p100:T.amberBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👥</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{r.name}</div>
                      <div style={{fontSize:12,color:T.soft,marginTop:2}}>{r.guests} guests</div>
                    </div>
                  </div>
                  <span className={`badge ${r.status==="confirmed"?"badge-green":"badge-amber"}`}>{r.status==="confirmed"?"\u2713 Confirmed":"\u25cf Pending"}</span>
                </div>
                <div style={{fontSize:12,color:T.soft,marginBottom:8}}>{r.phone} \u00b7 {r.note||"No special requests"}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.date}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-secondary" style={{fontSize:12,padding:"6px 12px"}}>Edit</button>
                    <button className="btn-danger" style={{fontSize:12,padding:"6px 12px"}}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {paginated.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:`1px solid ${T.paper}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.paper} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:48,height:48,borderRadius:14,background:r.status==="confirmed"?T.p50:T.amberBg,border:`1.5px solid ${r.status==="confirmed"?T.p100:T.amberBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👥</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{r.name}</div>
                  <div style={{fontSize:12,color:T.soft,marginTop:2}}>{r.phone} \u00b7 {r.note||"No special requests"}</div>
                </div>
                <div style={{textAlign:"center",minWidth:80}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.guests} guests</div>
                  <div style={{fontSize:11,color:T.soft,marginTop:2}}>party size</div>
                </div>
                <div style={{textAlign:"center",minWidth:140}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{r.date}</div>
                </div>
                <div><span className={`badge ${r.status==="confirmed"?"badge-green":"badge-amber"}`}>{r.status==="confirmed"?"\u2713 Confirmed":"\u25cf Pending"}</span></div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn-secondary" style={{fontSize:12,padding:"6px 12px"}}>Edit</button>
                  <button className="btn-danger" style={{fontSize:12,padding:"6px 12px"}}>Cancel</button>
                </div>
              </div>
            ))}
          </>
        )}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginTop:10,borderTop:`1px solid ${T.paper}`}}>
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, reservations.length)} of {reservations.length} reservations</div>
            <div style={{display:"flex",gap:8}}>
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===1?"transparent":T.white,color:page===1?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===1?"default":"pointer",transition:"all .18s"}}>Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} style={{padding:"6px 14px",borderRadius:50,border:`1.5px solid ${T.line}`,background:page===totalPages?"transparent":T.white,color:page===totalPages?T.faint:T.mid,fontSize:13,fontWeight:600,cursor:page===totalPages?"default":"pointer",transition:"all .18s"}}>Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 5 — MY AGENT
═══════════════════════════════════════════ */
// Format a saved schedule object into a readable string
const formatSchedule = (schedule) => {
  if (!schedule) return null;
  if (schedule.is24h === "true") return "24/7";
  const days = ["mon","tue","wed","thu","fri","sat","sun"];
  const dayNames = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
  const open = days.filter(d => schedule[d] && schedule[d] !== "closed");
  if (open.length === 0) return null;
  const times = open.map(d => schedule[d]);
  const allSame = times.every(t => t === times[0]);
  if (allSame) {
    const first = dayNames[open[0]];
    const last = open.length > 1 ? `–${dayNames[open[open.length - 1]]}` : "";
    return `${first}${last} · ${times[0].replace("-", "–")}`;
  }
  return open.slice(0, 3).map(d => `${dayNames[d]}: ${schedule[d].replace("-","–")}`).join(", ") + (open.length > 3 ? ` +${open.length - 3} more` : "");
};

function PageMyAgent({ user, agentName, bizName, agentData, bizData, menuSynced, onNav }) {
  const displayAgent = agentName || "Aria";
  const displayBiz = bizName || "your restaurant";
  const greeting = agentData?.openingGreeting || `Hi, thanks for calling us at ${displayBiz}! I'm ${displayAgent}, your AI assistant. Would you like to place an order, check our hours, or something else?`;
  const voiceDisplay = agentData ? `${agentData.voiceName} · ${agentData.voiceDescription}` : `${displayAgent} · Warm`;
  const menuDisplay = menuSynced ? "Synced" : "Not synced";

  const bizHoursDisplay  = formatSchedule(bizData?.openingHours);
  const agentHoursDisplay = formatSchedule(agentData?.agentSchedule);

  const [tab, setTab] = useState("Overview");
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [takeReservations, setTakeReservations] = useState(true);
  const [answerAfterHours, setAnswerAfterHours] = useState(true);

  useEffect(() => {
    if (agentData) {
      setAcceptOrders(agentData.acceptOrders ?? true);
      setTakeReservations(agentData.takeReservations ?? true);
      setAnswerAfterHours(agentData.answerAfterHours ?? true);
    }
  }, [agentData]);

  const updateSetting = async (field, val) => {
    try { await api.agent.update({ [field]: val }); } catch {}
  };

  return (
    <>
      <TopBar title={<>My <strong>Agent</strong></>} subtitle={`Configure and monitor ${displayAgent}, your AI phone agent`} user={user} agentName={agentName} />

      <div className="resp-grid-3">
        {[{ic:"📞",l:"Calls answered today",v:"0",d:"No calls yet"},{ic:"⏱️",l:"Avg. handle time",v:"0:00",d:"—"},{ic:"✅",l:"Successful outcomes",v:"0%",d:"—"}].map(k=>(
          <div className="kpi-card" key={k.l} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{k.ic}</div>
            <div>
              <div className="kpi-label" style={{marginBottom:4}}>{k.l}</div>
              <div className="kpi-value" style={{fontSize:26}}>{k.v}</div>
              <div className="kpi-delta" style={{marginTop:2}}>{k.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",gap:6,marginBottom:22}}>
              {["Overview","Performance","Transcripts"].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${tab===t?T.p500:T.line}`,background:tab===t?T.p50:"transparent",color:tab===t?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{t}</button>
              ))}
            </div>

            {tab==="Overview" && (
              <>
                <div className="agent-card">
                  <div className="agent-avatar">🤖</div>
                  <div>
                    <div className="agent-name" style={{fontSize:16}}>{displayAgent}</div>
                    <div className="agent-status"><div className="agent-status-dot"/>Ready · waiting for first call</div>
                  </div>
                  <button className="agent-edit-btn" onClick={() => onNav && onNav("Voice & Script")}>Edit agent</button>
                </div>

                {/* 5-item stats grid */}
                <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    ["🎙️","Voice",      voiceDisplay],
                    ["🌍","Language",   "English"],
                    ["🔀","Call rules", agentData?.transferEnabled !== false ? "Transfer" : "End call"],
                    ["🔌","POS",        "Not connected"],
                    ["📋","Menu",       menuDisplay],
                  ].map(([ic,l,v])=>(
                    <div key={l} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>{ic} {l}</div>
                      <div style={{fontSize:13.5,fontWeight:600,color:menuDisplay==="Not synced"&&l==="Menu"?T.amber:T.ink}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Hours — 2-column section */}
                <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    ["⏰","Business hours", bizHoursDisplay],
                    ["⏰","Agent hours",    agentHoursDisplay],
                  ].map(([ic,l,v])=>(
                    <div key={l} style={{background:T.paper,border:`1.5px solid ${v ? T.line : "#FEF3C7"}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>{ic} {l}</div>
                      <div style={{fontSize:13.5,fontWeight:600,color:v ? T.ink : T.amber}}>{v || "Not set"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab==="Performance" && (
              <div>
                <div style={{textAlign:"center",padding:"32px 20px"}}>
                  <div style={{fontSize:30,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:6}}>No performance data yet</div>
                  <div style={{fontSize:13,color:T.soft}}>Stats will appear here once {displayAgent} starts taking calls</div>
                </div>
                {[["Answer rate","0%",0],["Orders completed","0%",0],["Customer satisfaction","—",0],["Avg. call resolution","0%",0]].map(([l,v,pct])=>(
                  <div key={l} style={{marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13.5,fontWeight:600,color:T.ink}}>{l}</span>
                      <span style={{fontSize:13.5,fontWeight:700,color:T.faint}}>{v}</span>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
                  </div>
                ))}
              </div>
            )}

            {tab==="Transcripts" && (
              <div style={{textAlign:"center",padding:"48px 20px"}}>
                <div style={{fontSize:36,marginBottom:12}}>🎙️</div>
                <div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:6}}>No transcripts yet</div>
                <div style={{fontSize:13,color:T.soft}}>Call transcripts will appear here once {displayAgent} handles a call</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Live preview</div>
            <div style={{background:T.paper,borderRadius:14,padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
                <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{displayAgent}</div><div style={{fontSize:11,color:T.soft}}>AI agent preview</div></div>
                <div className="live-badge" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 9px",fontSize:10,fontWeight:700,color:T.green}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>LIVE</div>
              </div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:12,padding:"10px 13px",fontSize:12.5,color:T.ink2,lineHeight:1.55}}>
                <span style={{fontSize:10,fontWeight:700,display:"block",marginBottom:4,color:T.p500}}>{displayAgent.toUpperCase()}</span>
                "{greeting}"
              </div>
              <div className="waveform" style={{justifyContent:"center",marginTop:8}}>
                {Array.from({length:14},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.07}s`}}/>)}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">Quick settings</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:14}}>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Accept orders</h4>
                  <label className="toggle"><input type="checkbox" checked={acceptOrders} onChange={e=>{setAcceptOrders(e.target.checked);updateSetting('acceptOrders',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{acceptOrders?`Allow ${displayAgent} to take phone orders`:`${displayAgent} will not take orders right now`}</p>
              </div>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Take reservations</h4>
                  <label className="toggle"><input type="checkbox" checked={takeReservations} onChange={e=>{setTakeReservations(e.target.checked);updateSetting('takeReservations',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{takeReservations?"Allow booking via phone":`${displayAgent} will decline booking requests`}</p>
              </div>
              <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Answer after hours</h4>
                  <label className="toggle"><input type="checkbox" checked={answerAfterHours} onChange={e=>{setAnswerAfterHours(e.target.checked);updateSetting('answerAfterHours',e.target.checked);}}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
                <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>Handle calls outside business hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Shared schedule helpers used across multiple pages ── */
const VS_DAY_KEYS   = ["mon","tue","wed","thu","fri","sat","sun"];
const VS_DAY_LABELS = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

const makeDefaultSchedule = () => ({
  mon: { open: false, openTime: "09:00", closeTime: "17:00" },
  tue: { open: false, openTime: "09:00", closeTime: "17:00" },
  wed: { open: false, openTime: "09:00", closeTime: "17:00" },
  thu: { open: false, openTime: "09:00", closeTime: "17:00" },
  fri: { open: false, openTime: "09:00", closeTime: "17:00" },
  sat: { open: false, openTime: "09:00", closeTime: "17:00" },
  sun: { open: false, openTime: "09:00", closeTime: "17:00" },
});

const parseSchedule = (obj) => {
  if (!obj) return makeDefaultSchedule();
  const r = {};
  for (const day of VS_DAY_KEYS) {
    const v = obj[day];
    if (!v || v === "closed") r[day] = { open: false, openTime: "09:00", closeTime: "17:00" };
    else { const [o, c] = v.split("-"); r[day] = { open: true, openTime: o || "09:00", closeTime: c || "17:00" }; }
  }
  return r;
};

const buildHours = (is24h, sched) => {
  if (is24h) return { is24h: "true" };
  const r = { is24h: "false" };
  Object.entries(sched).forEach(([d, v]) => { r[d] = v.open ? `${v.openTime}-${v.closeTime}` : "closed"; });
  return r;
};

function ScheduleInlineEditor({ is24h, setIs24h, schedule, setSchedule }) {
  return (
    <div style={{marginTop:12}}>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12}}>
        <input type="checkbox" checked={is24h} onChange={e=>setIs24h(e.target.checked)} style={{accentColor:T.p600,width:15,height:15}}/>
        <span style={{fontSize:13,fontWeight:600,color:T.ink}}>We operate 24/7</span>
      </label>
      {!is24h && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {VS_DAY_KEYS.map(day=>(
            <div key={day} style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={{display:"flex",alignItems:"center",gap:7,width:54,cursor:"pointer",flexShrink:0}}>
                <input type="checkbox" checked={schedule[day]?.open||false} onChange={()=>setSchedule(p=>({...p,[day]:{...p[day],open:!p[day].open}}))} style={{accentColor:T.p600}}/>
                <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{VS_DAY_LABELS[day]}</span>
              </label>
              {schedule[day]?.open ? (
                <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
                  <input type="time" value={schedule[day].openTime} onChange={e=>setSchedule(p=>({...p,[day]:{...p[day],openTime:e.target.value}}))} style={{flex:1,padding:"6px 8px",border:`1.5px solid ${T.line}`,borderRadius:8,fontSize:12.5,fontFamily:"'Outfit',sans-serif",color:T.ink,background:T.white,outline:"none"}}/>
                  <span style={{color:T.soft,fontSize:13}}>–</span>
                  <input type="time" value={schedule[day].closeTime} onChange={e=>setSchedule(p=>({...p,[day]:{...p[day],closeTime:e.target.value}}))} style={{flex:1,padding:"6px 8px",border:`1.5px solid ${T.line}`,borderRadius:8,fontSize:12.5,fontFamily:"'Outfit',sans-serif",color:T.ink,background:T.white,outline:"none"}}/>
                </div>
              ) : (
                <span style={{fontSize:12,color:T.soft,marginLeft:4}}>Closed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE 6 — VOICE & SCRIPT
═══════════════════════════════════════════ */
function PageVoiceScript({ user, agentName, bizName, agentData, bizData, onAgentNameChange }) {
  const autoGreet = (name, biz) => `Hi, thanks for calling us at ${biz}! I'm ${name}, your AI assistant. Would you like to place an order, check our hours, or something else?`;

  // ── Gender & voice ──────────────────────────────────────────────
  const [gender, setGender] = useState("female");
  const voices = VOICE_CATALOGUE[gender];
  const [voice, setVoice] = useState(0);

  // ── Identity ────────────────────────────────────────────────────
  const [localName, setLocalName] = useState(agentName || "Aria");
  const [greetingEdited, setGreetingEdited] = useState(false);
  const [greeting, setGreeting] = useState(autoGreet(agentName||"Aria", bizName||"your restaurant"));
  const [fallbackAction, setFallbackAction] = useState("transfer");
  const [transferNumber, setTransferNumber] = useState('');
  const [takeMessages, setTakeMessages] = useState(true);

  // ── Save flags ──────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [identityDirty, setIdentityDirty] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);

  // ── Hours editing ───────────────────────────────────────────────
  const [showBizHoursEdit,   setShowBizHoursEdit]   = useState(false);
  const [showAgentHoursEdit, setShowAgentHoursEdit] = useState(false);
  const [biz24h,   setBiz24h]   = useState(false);
  const [bizSched, setBizSched] = useState(makeDefaultSchedule());
  const [agent24h,   setAgent24h]   = useState(false);
  const [agentSched, setAgentSched] = useState(makeDefaultSchedule());
  const [savingBizHours,   setSavingBizHours]   = useState(false);
  const [savingAgentHours, setSavingAgentHours] = useState(false);

  // ── Test call ───────────────────────────────────────────────────
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active | ended
  const conversationRef = useRef(null);

  // ── Load from DB data ───────────────────────────────────────────
  useEffect(() => {
    if (agentData) {
      if (agentData.name) setLocalName(agentData.name);
      if (agentData.openingGreeting && !greetingEdited) setGreeting(agentData.openingGreeting);
      if (agentData.fallbackAction) setFallbackAction(agentData.fallbackAction);
      if (agentData.transferNumber) setTransferNumber(agentData.transferNumber);
      else if (bizData?.phone) setTransferNumber(bizData.phone);
      if (agentData.takeMessages !== undefined) setTakeMessages(agentData.takeMessages);
      const g = agentData.gender || "female";
      setGender(g);
      const cat = VOICE_CATALOGUE[g];
      const vIdx = cat.findIndex(v => v.id === agentData.voiceId);
      setVoice(vIdx >= 0 ? vIdx : 0);
      if (agentData.agentSchedule) {
        if (agentData.agentSchedule.is24h === "true") setAgent24h(true);
        else { setAgent24h(false); setAgentSched(parseSchedule(agentData.agentSchedule)); }
      }
    }
    if (bizData?.openingHours) {
      if (bizData.openingHours.is24h === "true") setBiz24h(true);
      else { setBiz24h(false); setBizSched(parseSchedule(bizData.openingHours)); }
    }
  }, [agentData, bizData]);

  const handleNameChange = (val) => {
    setLocalName(val);
    if (!greetingEdited) setGreeting(autoGreet(val, bizName||'your restaurant'));
    setIdentityDirty(true); setIdentitySaved(false);
  };
  const handleGreetingChange = (val) => {
    setGreetingEdited(true); setGreeting(val);
    setIdentityDirty(true); setIdentitySaved(false);
  };
  const handleGenderChange = (g) => { setGender(g); setVoice(0); };

  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    try {
      await api.agent.update({ name: localName, openingGreeting: greeting });
      if (onAgentNameChange) onAgentNameChange(localName);
      setIdentityDirty(false); setIdentitySaved(true);
      setTimeout(() => setIdentitySaved(false), 2500);
    } catch {}
    setSavingIdentity(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.agent.update({
        name: localName, openingGreeting: greeting,
        gender, voiceId: voices[voice].id, voiceName: voices[voice].n, voiceDescription: voices[voice].d,
        fallbackAction, transferNumber: transferNumber||null, takeMessages,
      });
      if (onAgentNameChange) onAgentNameChange(localName);
    } catch {}
    setSaving(false);
  };

  const handleSaveBizHours = async () => {
    setSavingBizHours(true);
    try {
      await api.settings.updateBusiness({ openingHours: buildHours(biz24h, bizSched) });
      setShowBizHoursEdit(false);
    } catch {}
    setSavingBizHours(false);
  };

  const handleSaveAgentHours = async () => {
    setSavingAgentHours(true);
    try {
      await api.agent.update({ agentSchedule: buildHours(agent24h, agentSched) });
      setShowAgentHoursEdit(false);
    } catch {}
    setSavingAgentHours(false);
  };

  const startDemo = async () => {
    if (callStatus === 'connecting' || callStatus === 'active') return;
    setCallStatus('connecting');
    try {
      const { signedUrl } = await api.agent.getSignedUrl();
      const conv = await Conversation.startSession({
        signedUrl,
        onConnect: () => setCallStatus('active'),
        onDisconnect: () => { setCallStatus('ended'); conversationRef.current = null; },
        onError: (msg) => { console.error('ElevenLabs:', msg); setCallStatus('idle'); conversationRef.current = null; },
      });
      conversationRef.current = conv;
    } catch (e) {
      console.error('Test call failed:', e);
      setCallStatus('idle');
    }
  };

  const endDemo = async () => {
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch {}
      conversationRef.current = null;
    }
    setCallStatus('ended');
  };

  const bizHoursDisplay   = formatSchedule(bizData?.openingHours);
  const agentHoursDisplay = formatSchedule(agentData?.agentSchedule);
  const demoActive = callStatus === 'active' || callStatus === 'connecting';

  return (
    <>
      <TopBar title={<>Voice <strong>&</strong> Script</>} subtitle={`Customise how ${localName} sounds and what ${localName} says`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={handleSave}>{saving?"Saving…":"Save changes"}</button>
      </TopBar>

      <div className="resp-grid-dashboard-hub">
        <div>
          {/* Voice card */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div className="card-head" style={{margin:0}}>Choose a voice</div>
              <div style={{display:"flex",gap:4,background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:50,padding:3}}>
                {["female","male"].map(g=>(
                  <button key={g} onClick={()=>handleGenderChange(g)} style={{padding:"5px 14px",borderRadius:50,border:"none",background:gender===g?T.p600:"transparent",color:gender===g?"white":T.mid,fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
                    {g==="female"?"♀ Female":"♂ Male"}
                  </button>
                ))}
              </div>
            </div>
            <div className="resp-grid-2">
              {voices.map((v,i)=>(
                <div key={v.n} className={`voice-card ${voice===i?"selected":""}`} onClick={()=>setVoice(i)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:3}}>{v.n}</div><div style={{fontSize:12,color:T.soft}}>{v.d}</div></div>
                    <span className="badge badge-purple">{gender==="female"?"Female":"Male"}</span>
                  </div>
                  <div className="voice-play">▶</div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity & script */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div className="card-head" style={{margin:0}}>Agent identity & script</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {identitySaved && !identityDirty && <span style={{fontSize:12,color:T.green,fontWeight:600}}>✓ Updated</span>}
                {identityDirty && (
                  <button onClick={handleSaveIdentity} disabled={savingIdentity} style={{padding:"7px 16px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:12.5,fontWeight:700,cursor:savingIdentity?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingIdentity?0.7:1,transition:"all .2s"}}>
                    {savingIdentity?"Saving…":"Update agent identity"}
                  </button>
                )}
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:6,letterSpacing:".3px",textTransform:"uppercase"}}>Agent name</label>
              <input value={localName} onChange={e=>handleNameChange(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${identityDirty?T.p400:T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:identityDirty?`0 0 0 3px ${T.p50}`:"0 1px 3px rgba(0,0,0,.04)",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <label style={{fontSize:12,fontWeight:700,color:T.mid,letterSpacing:".3px",textTransform:"uppercase"}}>Opening greeting</label>
                <span style={{fontSize:11,color:T.soft}}>💡 Keep under 20 seconds</span>
              </div>
              <textarea rows={4} value={greeting} onChange={e=>handleGreetingChange(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${identityDirty?T.p400:T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",resize:"none",lineHeight:1.6,transition:"border-color .2s, box-shadow .2s",boxShadow:identityDirty?`0 0 0 3px ${T.p50}`:"0 1px 3px rgba(0,0,0,.04)",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Hours & Availability */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Hours &amp; Availability</div>

            {/* Business hours */}
            <div style={{border:`1.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink}}>⏰ Business hours</div>
                  <div style={{fontSize:12,color:bizHoursDisplay?T.soft:T.amber,marginTop:2}}>{bizHoursDisplay||"Not set"}</div>
                </div>
                <button onClick={()=>setShowBizHoursEdit(p=>!p)} style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${T.line}`,background:T.paper,color:T.mid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {showBizHoursEdit?"Cancel":"Edit"}
                </button>
              </div>
              {showBizHoursEdit && (
                <>
                  <ScheduleInlineEditor is24h={biz24h} setIs24h={setBiz24h} schedule={bizSched} setSchedule={setBizSched}/>
                  <button onClick={handleSaveBizHours} disabled={savingBizHours} style={{marginTop:14,width:"100%",padding:"10px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:13,fontWeight:700,cursor:savingBizHours?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingBizHours?0.7:1}}>
                    {savingBizHours?"Saving…":"Save business hours"}
                  </button>
                </>
              )}
            </div>

            {/* Agent hours */}
            <div style={{border:`1.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink}}>🤖 Agent hours</div>
                  <div style={{fontSize:12,color:agentHoursDisplay?T.soft:T.amber,marginTop:2}}>{agentHoursDisplay||"Not set"}</div>
                </div>
                <button onClick={()=>setShowAgentHoursEdit(p=>!p)} style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${T.line}`,background:T.paper,color:T.mid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {showAgentHoursEdit?"Cancel":"Edit"}
                </button>
              </div>
              {showAgentHoursEdit && (
                <>
                  <ScheduleInlineEditor is24h={agent24h} setIs24h={setAgent24h} schedule={agentSched} setSchedule={setAgentSched}/>
                  <button onClick={handleSaveAgentHours} disabled={savingAgentHours} style={{marginTop:14,width:"100%",padding:"10px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:13,fontWeight:700,cursor:savingAgentHours?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingAgentHours?0.7:1}}>
                    {savingAgentHours?"Saving…":"Save agent hours"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Call handling */}
          <div className="card">
            <div className="card-head">Call handling rules</div>
            <p style={{fontSize:12,color:T.soft,margin:"-8px 0 16px 0"}}>When {localName} can't help…</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"stretch"}}>
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Fallback action</label>
                <select value={fallbackAction} onChange={e=>setFallbackAction(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}>
                  <option value="transfer">Transfer to number</option>
                  <option value="voicemail">Take a voicemail</option>
                  <option value="callback">Call back later</option>
                </select>
              </div>
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Transfer to number</label>
                <input value={transferNumber} onChange={e=>setTransferNumber(e.target.value)} placeholder="e.g. +44 161 234 5678" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
              </div>
            </div>
            <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
              <div>
                <h4 style={{margin:0,fontSize:13.5,fontWeight:600,color:T.ink}}>Offer to take a message</h4>
                <p style={{margin:"2px 0 0",fontSize:12,color:T.soft}}>Before transferring, {localName} will offer to take a message</p>
              </div>
              <label className="toggle"><input type="checkbox" checked={takeMessages} onChange={e=>setTakeMessages(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
            </div>
          </div>
        </div>

        {/* Right panel — test call */}
        <div>
          <div className="card" style={{position:"sticky",top:20,padding:0,overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${T.line}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:700,color:T.ink}}>Test call</span>
                {callStatus==='connecting' && (
                  <div style={{display:"flex",alignItems:"center",gap:5,background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#92400E"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"#F59E0B",animation:"pulse 1.2s infinite"}}/>CONNECTING…
                  </div>
                )}
                {callStatus==='active' && (
                  <div style={{display:"flex",alignItems:"center",gap:5,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700,color:T.green}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:T.green,animation:"pulse 1.2s infinite"}}/>LIVE
                  </div>
                )}
                {callStatus==='ended' && <span style={{fontSize:11,fontWeight:700,color:T.green}}>✓ Call ended</span>}
              </div>
            </div>

            {/* Agent identity strip */}
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:demoActive?`0 0 0 3px ${T.p100},0 0 0 6px ${T.p50}`:"none",transition:"box-shadow .3s"}}>🤖</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{localName}</div>
                <div style={{fontSize:12,color:T.soft}}>{voices[voice].d}</div>
              </div>
            </div>

            {/* Greeting bubble */}
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.line}`}}>
              <div style={{fontSize:10,fontWeight:700,color:T.p500,letterSpacing:".6px",marginBottom:6,textTransform:"uppercase"}}>{localName}</div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:T.ink2,lineHeight:1.6,fontStyle:"italic"}}>
                "{greeting}"
              </div>
            </div>

            {/* Waveform (active call) */}
            {demoActive && (
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div className="waveform">
                  {Array.from({length:18},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.06}s`}}/>)}
                </div>
              </div>
            )}

            {/* Knowledge base footer */}
            {!demoActive && (
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.line}`,fontSize:12,color:T.soft,lineHeight:1.5}}>
                💬 {localName} will use your <strong style={{color:T.mid}}>menu</strong>, <strong style={{color:T.mid}}>opening hours</strong>, <strong style={{color:T.mid}}>FAQ</strong> and <strong style={{color:T.mid}}>ordering rules</strong> as its knowledge base.
              </div>
            )}

            {/* Call button */}
            <div style={{padding:"16px 20px"}}>
              {!demoActive ? (
                <button onClick={startDemo} disabled={callStatus==='connecting'} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${T.p600},${T.p700})`,color:"white",fontSize:14,fontWeight:700,cursor:callStatus==='connecting'?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 16px rgba(112,53,245,.3)`,transition:"all .2s",opacity:callStatus==='connecting'?0.7:1}}>
                  <span style={{fontSize:18}}>📞</span> Start test call
                </button>
              ) : (
                <button onClick={endDemo} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:T.red,color:"white",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(239,68,68,.3)",transition:"all .2s"}}>
                  <span style={{fontSize:18}}>📵</span> End call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 7 — MENU
═══════════════════════════════════════════ */
function PageMenu({ user, agentName, bizName }) {
  const displayAgent = agentName || 'your agent';
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [importTab, setImportTab] = useState('url');
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const menuFileRef = useRef(null);
  const [importPosSelected, setImportPosSelected] = useState(null);
  const [importPosFields, setImportPosFields] = useState({});

  // Add item modal
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemCatId, setNewItemCatId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [itemError, setItemError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemDesc, setEditItemDesc] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const [editItemError, setEditItemError] = useState('');

  // Add category modal
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [catError, setCatError] = useState('');

  // FAQ modal
  const [showFaq, setShowFaq] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [addingFaq, setAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editingFaqQ, setEditingFaqQ] = useState('');
  const [editingFaqA, setEditingFaqA] = useState('');
  const [savingFaq, setSavingFaq] = useState(false);
  const [faqError, setFaqError] = useState('');

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await api.menu.getCategories();
      setCategories(cats || []);
      if (cats?.length > 0) setActiveCatId(id => id || cats[0].id);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (!activeCatId) { setItems([]); return; }
    setLoadingItems(true);
    api.menu.getCategoryItems(activeCatId)
      .then(d => { setItems(d || []); setLoadingItems(false); })
      .catch(() => setLoadingItems(false));
  }, [activeCatId]);

  const activeCat = categories.find(c => c.id === activeCatId);

  const catEmoji = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('pizza')) return '🍕';
    if (n.includes('pasta') || n.includes('noodle')) return '🍝';
    if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('coffee')) return '🥤';
    if (n.includes('dessert') || n.includes('sweet') || n.includes('cake')) return '🍰';
    if (n.includes('side') || n.includes('salad')) return '🥗';
    if (n.includes('burger') || n.includes('sandwich')) return '🍔';
    if (n.includes('chicken')) return '🍗';
    if (n.includes('fish') || n.includes('seafood')) return '🐟';
    if (n.includes('starter') || n.includes('appetizer')) return '🥣';
    return '🍽️';
  };

  const fmtPrice = (p) => p != null ? `£${Number(p).toFixed(2)}` : '';

  const runUrlImport = async () => {
    setImportLoading(true); setImportError(''); setImportResult(null);
    try {
      const r = await api.menu.importFromUrl(importUrl);
      setImportResult(r);
      await loadCategories();
    } catch (e) { setImportError(e.message || 'Import failed'); }
    setImportLoading(false);
  };

  const runFileImport = async (file) => {
    setImportLoading(true); setImportError(''); setImportResult(null);
    try {
      const r = await api.menu.importFromFile(file);
      setImportResult(r);
      await loadCategories();
    } catch (e) { setImportError(e.message || 'Import failed'); }
    setImportLoading(false);
  };

  const runPosImport = async () => {
    if (!importPosSelected) { setImportError('Please select a POS system.'); return; }
    const pos = POS_SYSTEMS.find(p => p.name === importPosSelected);
    const missing = pos?.fields.find(f => !importPosFields[f.key]?.trim());
    if (missing) { setImportError(`${missing.label} is required.`); return; }
    setImportLoading(true); setImportError(''); setImportResult(null);
    try {
      const r = await api.menu.importFromPos(importPosSelected, importPosFields);
      setImportResult({ pos: r });
    } catch (e) { setImportError(e.message || 'POS import failed'); }
    setImportLoading(false);
  };

  const closeImport = () => { setShowImport(false); setImportResult(null); setImportError(''); setImportUrl(''); setImportPosSelected(null); setImportPosFields({}); };

  const handleAddItem = async () => {
    const catId = newItemCatId || activeCatId;
    if (!catId || !newItemName || !newItemPrice) return;
    setAddingItem(true); setItemError('');
    try {
      await api.menu.createItem({ categoryId: catId, name: newItemName, description: newItemDesc, price: parseFloat(newItemPrice) });
      setShowAddItem(false); setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setItemError('');
      if (catId === activeCatId) {
        const d = await api.menu.getCategoryItems(activeCatId);
        setItems(d || []);
      }
      await loadCategories();
    } catch (e) { setItemError(e.message || 'Failed to save item. Please try again.'); }
    setAddingItem(false);
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.menu.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setCategories(prev => prev.map(c => c.id === activeCatId ? { ...c, _count: { ...c._count, items: (c._count?.items || 1) - 1 } } : c));
    } catch {}
  };

  const openEditItem = (item) => { setEditingItem(item); setEditItemName(item.name); setEditItemDesc(item.description || ''); setEditItemPrice(String(item.price)); setEditItemError(''); };
  const closeEditItem = () => { setEditingItem(null); setEditItemName(''); setEditItemDesc(''); setEditItemPrice(''); setEditItemError(''); };
  const handleSaveItem = async () => {
    if (!editItemName || !editItemPrice) return;
    setSavingItem(true); setEditItemError('');
    try {
      const updated = await api.menu.updateItem(editingItem.id, { name: editItemName.trim(), description: editItemDesc.trim() || null, price: parseFloat(editItemPrice) });
      setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
      closeEditItem();
    } catch (e) { setEditItemError(e.message || 'Failed to save changes. Please try again.'); }
    setSavingItem(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setAddingCat(true); setCatError('');
    try {
      const cat = await api.menu.createCategory({ name: newCatName });
      setNewCatName(''); setShowAddCat(false); setCatError('');
      await loadCategories();
      setActiveCatId(cat.id);
    } catch (e) { setCatError(e.message || 'Failed to create category. Please try again.'); }
    setAddingCat(false);
  };

  const openFaq = async () => {
    setShowFaq(true);
    setFaqLoading(true);
    try { setFaqs(await api.faq.list()); } catch {}
    setFaqLoading(false);
  };
  const handleAddFaq = async () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    setAddingFaq(true); setFaqError('');
    try {
      const created = await api.faq.create({ question: faqQuestion.trim(), answer: faqAnswer.trim() });
      setFaqs(prev => [...prev, created]);
      setFaqQuestion(''); setFaqAnswer(''); setFaqError('');
    } catch (e) { setFaqError(e.message || 'Failed to save FAQ. Please try again.'); }
    setAddingFaq(false);
  };
  const handleDeleteFaq = async (id) => {
    try {
      await api.faq.delete(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch {}
  };
  const startEditFaq = (faq) => { setEditingFaqId(faq.id); setEditingFaqQ(faq.question); setEditingFaqA(faq.answer); };
  const cancelEditFaq = () => { setEditingFaqId(null); setEditingFaqQ(''); setEditingFaqA(''); };
  const handleSaveFaq = async (id) => {
    setSavingFaq(true);
    try {
      const updated = await api.faq.update(id, { question: editingFaqQ.trim(), answer: editingFaqA.trim() });
      setFaqs(prev => prev.map(f => f.id === id ? updated : f));
      cancelEditFaq();
    } catch {}
    setSavingFaq(false);
  };

  const inputStyle = { width:"100%", padding:"12px 16px", border:`1.5px solid ${T.line}`, borderRadius:12, background:T.paper, color:T.ink, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" };
  const modalOverlay = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 };
  const modalBox = { position:"relative", width:"100%", background:T.white, border:`1.5px solid ${T.line}`, borderRadius:22, boxShadow:`0 24px 80px rgba(134,87,255,.18)`, animation:"fadeUp .3s ease both" };

  return (
    <>
      <TopBar title={<>Menu <strong>Manager</strong></>} subtitle={`Items ${displayAgent} knows and can take orders for`} user={user} agentName={agentName}>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 16px"}} onClick={()=>{ setImportTab('url'); setShowImport(true); }}>Import from URL</button>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 16px"}} onClick={()=>{ setImportTab('file'); setShowImport(true); }}>Upload files</button>
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 16px"}} onClick={openFaq}>💬 FAQ</button>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 18px"}} onClick={()=>{ setNewItemCatId(activeCatId); setShowAddItem(true); }}>+ Add item</button>
      </TopBar>

      {loading ? (
        <div style={{textAlign:"center",padding:"80px 20px"}}>
          <div style={{fontSize:36,marginBottom:12}}>🍽️</div>
          <div style={{fontSize:14,color:T.soft}}>Loading menu…</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card" style={{textAlign:"center",padding:"64px 32px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🍽️</div>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:8}}>No menu added yet</div>
          <div style={{fontSize:14,color:T.soft,marginBottom:28,lineHeight:1.6,maxWidth:400,margin:"0 auto 28px"}}>
            Import from a website, upload a PDF, DOCX, or image file, or add items manually.<br/>
            {displayAgent} will use your menu to answer questions and take orders.
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" style={{fontSize:13,padding:"11px 24px"}} onClick={()=>{ setImportTab('url'); setShowImport(true); }}>🌐 Import from URL</button>
            <button className="btn-secondary" style={{fontSize:13,padding:"11px 24px"}} onClick={()=>{ setImportTab('file'); setShowImport(true); }}>📁 Upload files</button>
            <button className="btn-secondary" style={{fontSize:13,padding:"11px 24px"}} onClick={()=>setShowAddCat(true)}>+ Add manually</button>
          </div>
        </div>
      ) : (
        <>
          {isMobile && (
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              {categories.map(c=>(
                <button key={c.id} onClick={()=>setActiveCatId(c.id)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${activeCatId===c.id?T.p500:T.line}`,background:activeCatId===c.id?T.p50:"transparent",color:activeCatId===c.id?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>
                  {c.name} <span style={{fontSize:11,color:activeCatId===c.id?T.p400:T.faint}}>({c._count?.items||0})</span>
                </button>
              ))}
            </div>
          )}

          <div className="resp-grid-sidebar-left">
            {!isMobile && (
              <div className="card" style={{padding:16,height:"fit-content"}}>
                <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Categories</div>
                {categories.map(c=>(
                  <div key={c.id} onClick={()=>setActiveCatId(c.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:activeCatId===c.id?T.p700:T.mid,background:activeCatId===c.id?T.p50:"transparent",border:`1.5px solid ${activeCatId===c.id?T.p100:"transparent"}`,marginBottom:2,transition:"all .18s"}}>
                    <span>{c.name}</span>
                    <span style={{fontSize:11,color:activeCatId===c.id?T.p400:T.faint}}>{c._count?.items||0}</span>
                  </div>
                ))}
                <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.line}`}}>
                  <div onClick={()=>setShowAddCat(true)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:T.mid,border:`1.5px dashed ${T.line}`,textAlign:"center"}}>+ Add category</div>
                </div>
              </div>
            )}

            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
                <div className="card-head" style={{marginBottom:0}}>{activeCat?.name || ''}</div>
                <div style={{fontSize:12,color:T.soft}}>{items.length} items</div>
              </div>

              {loadingItems ? (
                <div style={{textAlign:"center",padding:"32px",color:T.soft,fontSize:13}}>Loading items…</div>
              ) : items.length === 0 ? (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <div style={{fontSize:32,marginBottom:10}}>{catEmoji(activeCat?.name)}</div>
                  <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:6}}>No items in {activeCat?.name}</div>
                  <div style={{fontSize:13,color:T.soft,marginBottom:16}}>Add items manually or import from a menu source</div>
                  <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={()=>{ setNewItemCatId(activeCatId); setShowAddItem(true); }}>+ Add item</button>
                </div>
              ) : isMobile ? (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {items.map(item=>(
                    <div key={item.id} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:10,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{catEmoji(activeCat?.name)}</div>
                          <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</div>
                        </div>
                        <div style={{fontSize:15,fontWeight:700,color:T.p600}}>{fmtPrice(item.price)}</div>
                      </div>
                      {item.description && <div style={{fontSize:12,color:T.soft,marginBottom:10,paddingLeft:46}}>{item.description}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                        <span className={`badge ${item.status==='INACTIVE'?'badge-amber':item.status==='OUT_OF_STOCK'?'badge-amber':'badge-green'}`}>{item.status==='OUT_OF_STOCK'?'Out of stock':item.status==='INACTIVE'?'Inactive':'Active'}</span>
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>openEditItem(item)}>Edit</button>
                          <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>handleDeleteItem(item.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {items.map(item=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.paper}`}}>
                      <div style={{width:42,height:42,borderRadius:12,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catEmoji(activeCat?.name)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</div>
                        {item.description && <div style={{fontSize:12,color:T.soft,marginTop:2}}>{item.description}</div>}
                      </div>
                      <div style={{fontSize:15,fontWeight:700,color:T.p600,minWidth:60,textAlign:"right"}}>{fmtPrice(item.price)}</div>
                      <span className={`badge ${item.status==='INACTIVE'?'badge-amber':item.status==='OUT_OF_STOCK'?'badge-amber':'badge-green'}`}>{item.status==='OUT_OF_STOCK'?'Out of stock':item.status==='INACTIVE'?'Inactive':'Active'}</span>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>openEditItem(item)}>Edit</button>
                        <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>handleDeleteItem(item.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Import Modal ── */}
      {showImport && (
        <div style={modalOverlay} onClick={()=>{ if(!importLoading) closeImport(); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:480}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Import menu</h3>
              <button onClick={closeImport} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px"}}>
              <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
                {[['url','🌐 From URL'],['file','📁 Upload file'],['pos','🔌 POS']].map(([k,l])=>(
                  <button key={k} onClick={()=>{ setImportTab(k); setImportResult(null); setImportError(''); setImportPosSelected(null); setImportPosFields({}); }} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${importTab===k?T.p500:T.line}`,background:importTab===k?T.p50:"transparent",color:importTab===k?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{l}</button>
                ))}
              </div>

              {importTab==='url' && !importResult && (
                <>
                  <input value={importUrl} onChange={e=>setImportUrl(e.target.value)} placeholder="e.g. yourrestaurant.com/menu" style={{...inputStyle, marginBottom:14}} onKeyDown={e=>e.key==='Enter'&&!importLoading&&importUrl&&runUrlImport()}/>
                  <button className="btn-primary" style={{width:"100%",justifyContent:"center",fontSize:14,padding:"12px"}} disabled={importLoading||!importUrl.trim()} onClick={runUrlImport}>{importLoading?"Scraping menu…":"Import menu"}</button>
                </>
              )}

              {importTab==='file' && !importResult && (
                <>
                  <input type="file" ref={menuFileRef} accept=".pdf,.docx,.png,.jpg,.jpeg" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; if(f) runFileImport(f); }}/>
                  <div onClick={()=>!importLoading&&menuFileRef.current?.click()} style={{border:`2px dashed ${T.line}`,borderRadius:14,padding:"36px 20px",textAlign:"center",cursor:importLoading?"default":"pointer",marginBottom:14,background:T.paper,transition:"border-color .2s"}} onMouseEnter={e=>{ if(!importLoading) e.currentTarget.style.borderColor=T.p400; }} onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
                    <div style={{fontSize:36,marginBottom:10}}>{importLoading?"⏳":"📁"}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:4}}>{importLoading?"Extracting menu data…":"Click to upload your menu file"}</div>
                    <div style={{fontSize:12,color:T.soft}}>PDF · DOCX · PNG · JPG — text & prices extracted automatically</div>
                  </div>
                </>
              )}

              {importTab==='pos' && !importResult && (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:14}}>
                    {POS_SYSTEMS.map(p=>{
                      const active = importPosSelected===p.name;
                      return (
                        <div key={p.name} onClick={()=>{ setImportPosSelected(p.name); setImportPosFields({}); setImportError(''); }}
                          style={{border:`1.5px solid ${active?T.p500:T.line}`,borderRadius:10,padding:"9px 6px",textAlign:"center",cursor:"pointer",background:active?T.p50:T.white,fontSize:12.5,fontWeight:active?700:500,color:active?T.p700:T.mid,transition:"all .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}
                          onMouseEnter={e=>{if(!active){e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.color=T.p600;}}}
                          onMouseLeave={e=>{if(!active){e.currentTarget.style.borderColor=T.line;e.currentTarget.style.color=T.mid;}}}>
                          <span style={{fontSize:16}}>{p.icon}</span><span>{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  {importPosSelected && (() => {
                    const pos = POS_SYSTEMS.find(p=>p.name===importPosSelected);
                    return (
                      <div style={{background:T.paper,borderRadius:12,padding:"14px 16px",border:`1.5px solid ${T.line}`,marginBottom:14}}>
                        <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:10}}>{pos.icon} {pos.name} credentials</div>
                        {pos.fields.map(f=>(
                          <div key={f.key} style={{marginBottom:10}}>
                            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".3px"}}>{f.label}</label>
                            <input value={importPosFields[f.key]||""} onChange={e=>{setImportPosFields(v=>({...v,[f.key]:e.target.value}));setImportError('');}} placeholder={f.ph} style={inputStyle}/>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <button className="btn-primary" style={{width:"100%",justifyContent:"center",fontSize:14,padding:"12px"}} disabled={importLoading||!importPosSelected} onClick={runPosImport}>{importLoading?"Connecting…":"Connect & sync menu"}</button>
                </>
              )}

              {importError && <div style={{background:T.redBg,border:`1.5px solid #FECACA`,borderRadius:10,padding:"10px 14px",fontSize:13,color:T.red,marginTop:4}}>{importError}</div>}

              {importResult && (
                <div style={{background:T.greenBg,border:`1.5px solid ${T.greenBd}`,borderRadius:12,padding:"16px 18px"}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.green,marginBottom:10}}>✓ {importResult.pos ? `${importResult.pos.posSystem} connected` : 'Import complete'}</div>
                  <div style={{fontSize:13,color:T.mid,lineHeight:1.7}}>
                    {importResult.pos ? (
                      <>
                        <div>{importResult.pos.message}</div>
                        {importResult.pos.categories?.map(c=><div key={c.name}>· {c.name}: {c.itemCount} items</div>)}
                      </>
                    ) : (<>
                      {importResult.categorized?.menu && <>
                        <div>🍽️ Menu items saved: <strong>{importResult.categorized.menu.savedItems}</strong></div>
                        {importResult.categorized.menu.duplicatesSkipped > 0 && <div style={{color:T.soft}}>⟳ Duplicates skipped: {importResult.categorized.menu.duplicatesSkipped}</div>}
                      </>}
                      {importResult.categorized?.hours?.found && <div>⏰ Opening hours extracted</div>}
                      {importResult.categorized?.faq?.found && <div>💬 FAQs saved: <strong>{importResult.categorized.faq.count}</strong></div>}
                    </>)}
                  </div>
                  <button className="btn-primary" style={{marginTop:14,fontSize:13,padding:"9px 22px"}} onClick={closeImport}>Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showAddItem && (
        <div style={modalOverlay} onClick={()=>{ setShowAddItem(false); setItemError(''); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:440}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Add item</h3>
              <button onClick={()=>{ setShowAddItem(false); setItemError(''); }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              {categories.length > 0 && (
                <select value={newItemCatId||''} onChange={e=>setNewItemCatId(e.target.value)} style={inputStyle}>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <input value={newItemName} onChange={e=>{ setNewItemName(e.target.value); setItemError(''); }} placeholder="Item name *" style={inputStyle}/>
              <input value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} placeholder="Description (optional)" style={inputStyle}/>
              <input value={newItemPrice} onChange={e=>{ setNewItemPrice(e.target.value); setItemError(''); }} placeholder="Price e.g. 12.50 *" type="number" min="0" step="0.01" style={inputStyle}/>
              {itemError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{itemError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={addingItem||!newItemName||!newItemPrice} onClick={handleAddItem}>{addingItem?"Adding…":"Add item"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Item Modal ── */}
      {editingItem && (
        <div style={modalOverlay} onClick={closeEditItem}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:440}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Edit item</h3>
              <button onClick={closeEditItem} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              <input value={editItemName} onChange={e=>{ setEditItemName(e.target.value); setEditItemError(''); }} placeholder="Item name *" style={inputStyle}/>
              <input value={editItemDesc} onChange={e=>setEditItemDesc(e.target.value)} placeholder="Description (optional)" style={inputStyle}/>
              <input value={editItemPrice} onChange={e=>{ setEditItemPrice(e.target.value); setEditItemError(''); }} placeholder="Price e.g. 12.50 *" type="number" min="0" step="0.01" style={inputStyle}/>
              {editItemError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{editItemError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={savingItem||!editItemName||!editItemPrice} onClick={handleSaveItem}>{savingItem?"Saving…":"Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showAddCat && (
        <div style={modalOverlay} onClick={()=>{ setShowAddCat(false); setCatError(''); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:380}}>
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>Add category</h3>
              <button onClick={()=>{ setShowAddCat(false); setCatError(''); }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid}}>✕</button>
            </div>
            <div style={{padding:"20px 28px 24px",display:"flex",flexDirection:"column",gap:12}}>
              <input value={newCatName} onChange={e=>{ setNewCatName(e.target.value); setCatError(''); }} placeholder="e.g. Starters, Mains, Desserts" style={inputStyle} onKeyDown={e=>e.key==='Enter'&&!addingCat&&newCatName&&handleAddCategory()}/>
              {catError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{catError}</div>}
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} disabled={addingCat||!newCatName} onClick={handleAddCategory}>{addingCat?"Creating…":"Create category"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ Modal ── */}
      {showFaq && (
        <div style={modalOverlay} onClick={()=>{ setShowFaq(false); cancelEditFaq(); setFaqError(''); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{...modalBox, maxWidth:600, maxHeight:"88vh", display:"flex", flexDirection:"column"}}>
            {/* Header */}
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>💬 FAQ Manager</h3>
                <p style={{margin:"4px 0 0",fontSize:12,color:T.soft}}>Questions your agent will answer automatically on every call</p>
              </div>
              <button onClick={()=>{ setShowFaq(false); cancelEditFaq(); setFaqError(''); }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid,flexShrink:0}}>✕</button>
            </div>

            {/* Scrollable content */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>

              {/* Existing FAQs */}
              {faqLoading ? (
                <div style={{textAlign:"center",padding:"32px",color:T.soft,fontSize:13}}>Loading FAQs…</div>
              ) : faqs.length === 0 ? (
                <div style={{textAlign:"center",padding:"28px 0",color:T.soft,fontSize:13}}>No FAQs yet — add your first one below.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                  {faqs.map((faq,idx)=>(
                    <div key={faq.id} style={{background:T.paper,border:`1.5px solid ${editingFaqId===faq.id?T.p300:T.line}`,borderRadius:14,padding:"14px 16px",transition:"border-color .2s"}}>
                      {editingFaqId === faq.id ? (
                        /* Inline edit form */
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          <input value={editingFaqQ} onChange={e=>setEditingFaqQ(e.target.value)} placeholder="Question" style={{...inputStyle,padding:"9px 12px",fontSize:13,background:T.white}}/>
                          <textarea rows={3} value={editingFaqA} onChange={e=>setEditingFaqA(e.target.value)} placeholder="Answer" style={{...inputStyle,padding:"9px 12px",fontSize:13,resize:"vertical",lineHeight:1.5,background:T.white}}/>
                          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                            <button onClick={cancelEditFaq} style={{padding:"6px 14px",borderRadius:9,border:`1.5px solid ${T.line}`,background:"transparent",color:T.mid,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
                            <button onClick={()=>handleSaveFaq(faq.id)} disabled={savingFaq||!editingFaqQ.trim()||!editingFaqA.trim()} style={{padding:"6px 14px",borderRadius:9,border:"none",background:T.p600,color:"white",fontSize:12.5,fontWeight:700,cursor:savingFaq?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:savingFaq?0.7:1}}>
                              {savingFaq?"Saving…":"Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display row */
                        <div>
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                            <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
                              <span style={{fontSize:11,fontWeight:800,color:T.p500,background:T.p50,border:`1.5px solid ${T.p100}`,borderRadius:6,padding:"2px 7px",marginTop:1,flexShrink:0}}>Q{idx+1}</span>
                              <div>
                                <div style={{fontSize:13.5,fontWeight:700,color:T.ink,marginBottom:5}}>{faq.question}</div>
                                <div style={{fontSize:13,color:T.mid,lineHeight:1.6}}>{faq.answer}</div>
                              </div>
                            </div>
                            <div style={{display:"flex",gap:6,flexShrink:0}}>
                              <button onClick={()=>startEditFaq(faq)} style={{padding:"5px 12px",borderRadius:8,border:`1.5px solid ${T.line}`,background:T.white,color:T.mid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Edit</button>
                              <button onClick={()=>handleDeleteFaq(faq.id)} style={{padding:"5px 12px",borderRadius:8,border:"none",background:"#FEE2E2",color:T.red,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Remove</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add new FAQ form */}
              <div style={{background:T.paper,border:`1.5px dashed ${T.p200}`,borderRadius:14,padding:"16px"}}>
                <div style={{fontSize:12,fontWeight:700,color:T.p600,marginBottom:10,textTransform:"uppercase",letterSpacing:".4px"}}>+ Add new FAQ</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <input
                    value={faqQuestion}
                    onChange={e=>{ setFaqQuestion(e.target.value); setFaqError(''); }}
                    placeholder="e.g. Do you offer gluten-free options?"
                    style={{...inputStyle,padding:"10px 14px",fontSize:13,background:T.white}}
                  />
                  <textarea
                    rows={3}
                    value={faqAnswer}
                    onChange={e=>{ setFaqAnswer(e.target.value); setFaqError(''); }}
                    placeholder="e.g. Yes! Several of our dishes are gluten-free. Ask your server for our allergen menu."
                    style={{...inputStyle,padding:"10px 14px",fontSize:13,resize:"vertical",lineHeight:1.5,background:T.white}}
                  />
                  {faqError && <div style={{fontSize:12,color:T.red,background:T.redBg,border:`1px solid ${T.red}`,borderRadius:8,padding:"8px 12px"}}>{faqError}</div>}
                  <button
                    onClick={handleAddFaq}
                    disabled={addingFaq||!faqQuestion.trim()||!faqAnswer.trim()}
                    style={{alignSelf:"flex-end",padding:"9px 22px",borderRadius:10,border:"none",background:T.p600,color:"white",fontSize:13,fontWeight:700,cursor:addingFaq||!faqQuestion.trim()||!faqAnswer.trim()?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:addingFaq||!faqQuestion.trim()||!faqAnswer.trim()?0.6:1,transition:"opacity .2s"}}
                  >
                    {addingFaq?"Adding…":"Add FAQ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 8 — INTEGRATIONS
═══════════════════════════════════════════ */
const AVAILABLE_INTEGRATIONS = [
  {
    name: "Square",
    icon: "🟦",
    category: "ordering",
    desc: "Connect Square POS to accept orders and sync your menu in real-time",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAAAl..." },
      { key: "locationId",  label: "Location ID",  placeholder: "LXXXXXXXXXXXXXXXX" },
    ],
  },
  {
    name: "Clover",
    icon: "🍀",
    category: "ordering",
    desc: "Full order and inventory sync with Clover POS",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "..." },
      { key: "merchantId",  label: "Merchant ID",  placeholder: "XXXXXXXXXXXXXXXX" },
    ],
  },
  {
    name: "renOS",
    icon: "📅",
    category: "reservation",
    desc: "Manage table reservations and sync bookings through renOS",
    fields: [
      { key: "apiKey",      label: "API Key",      placeholder: "rn_live_..." },
      { key: "propertyId",  label: "Property ID",  placeholder: "PROP-XXXXXXXX" },
    ],
  },
];
const TOTAL_INTEGRATIONS = AVAILABLE_INTEGRATIONS.length; // 3

function PageIntegrations({ user, agentName, bizName }) {
  const displayBiz = bizName || "your business";

  const [connected, setConnected] = useState([]);   // integrations from DB (status=CONNECTED)
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null); // id being disconnected

  // Connect modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [pickedIntegration, setPickedIntegration] = useState(null); // one of AVAILABLE_INTEGRATIONS
  const [configValues, setConfigValues] = useState({});
  const [configError, setConfigError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const fetchConnected = async () => {
    try { setConnected(await api.integrations.list()); }
    catch {}
    setLoading(false);
  };

  useEffect(() => { fetchConnected(); }, []);

  const openModal = () => {
    setPickedIntegration(null);
    setConfigValues({});
    setConfigError("");
    setShowConnectModal(true);
  };

  const pickIntegration = (intg) => {
    setPickedIntegration(intg);
    const vals = {};
    intg.fields.forEach(f => { vals[f.key] = ""; });
    setConfigValues(vals);
    setConfigError("");
  };

  const handleConnect = async () => {
    if (!pickedIntegration) return;
    const missing = pickedIntegration.fields.find(f => !configValues[f.key]?.trim());
    if (missing) { setConfigError(`${missing.label} is required`); return; }
    setConnecting(true);
    try {
      await api.integrations.connect(pickedIntegration.name, pickedIntegration.category, configValues);
      await fetchConnected();
      setShowConnectModal(false);
      setPickedIntegration(null);
    } catch (e) {
      setConfigError(e?.message || "Connection failed. Check your credentials.");
    }
    setConnecting(false);
  };

  const handleDisconnect = async (id) => {
    setDisconnecting(id);
    try { await api.integrations.disconnect(id); await fetchConnected(); }
    catch {}
    setDisconnecting(null);
  };

  const connectedCount = connected.length;
  const remaining = TOTAL_INTEGRATIONS - connectedCount;

  // Which integrations are not yet connected (by name)
  const connectedNames = new Set(connected.map(c => c.name));
  const notConnected = AVAILABLE_INTEGRATIONS.filter(i => !connectedNames.has(i.name));

  const intgIcon = (name) => AVAILABLE_INTEGRATIONS.find(i => i.name === name)?.icon || "🔌";
  const intgDesc = (name) => AVAILABLE_INTEGRATIONS.find(i => i.name === name)?.desc || "";

  const modalOverlay = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 };

  return (
    <>
      <TopBar title={<>Integrations</>} subtitle={`Connect ${displayBiz} to the services you use`} user={user} agentName={agentName}>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 18px"}} onClick={openModal}>+ Connect integration</button>
      </TopBar>

      {/* KPI summary */}
      <div className="kpi-row" style={{gridTemplateColumns:"repeat(3, 1fr)", marginBottom:28}}>
        {[
          { l:"Available",          v:String(TOTAL_INTEGRATIONS), d:"Ready to connect"          },
          { l:"Connected",          v:String(connectedCount),     d:connectedCount > 0 ? "Active right now" : "Connect one to get started" },
          { l:"Total integrations", v:String(remaining),          d:"Available to connect"      },
        ].map(k=>(
          <div className="kpi-card" key={k.l}>
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-delta">{k.d}</div>
          </div>
        ))}
      </div>

      {/* Connected integrations */}
      {loading ? (
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:36,marginBottom:12}}>⏳</div>
          <div style={{fontSize:15,fontWeight:600,color:T.ink}}>Loading integrations…</div>
        </div>
      ) : connectedCount === 0 ? (
        <div className="card" style={{textAlign:"center",padding:"64px 32px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔌</div>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:8}}>No integrations connected yet</div>
          <div style={{fontSize:14,color:T.soft,marginBottom:28,lineHeight:1.6,maxWidth:420,margin:"0 auto 28px"}}>
            Connect Square or Clover to take orders, or renOS to manage reservations.<br/>
            Your agent will use these to serve customers on every call.
          </div>
          <button className="btn-primary" style={{fontSize:13,padding:"11px 28px"}} onClick={openModal}>+ Connect your first integration</button>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:20}}>
          {connected.map(int => {
            const isBusy = disconnecting === int.id;
            return (
              <div key={int.id} style={{background:T.white,border:`1.5px solid ${T.greenBd}`,borderRadius:18,padding:26,display:"flex",flexDirection:"column",transition:"box-shadow .2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 28px rgba(34,197,94,.1)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
                  <div style={{width:56,height:56,borderRadius:16,background:T.greenBg,border:`1.5px solid ${T.greenBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{intgIcon(int.name)}</div>
                  <span style={{padding:"4px 11px",borderRadius:50,fontSize:10.5,fontWeight:700,letterSpacing:".3px",textTransform:"uppercase",background:T.p50,color:T.p700,border:`1px solid ${T.p100}`}}>{int.category}</span>
                </div>
                <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:6}}>{int.name}</div>
                <div style={{fontSize:13,color:T.soft,lineHeight:1.55,flex:1}}>{intgDesc(int.name)}</div>
                {int.lastSynced && (
                  <div style={{fontSize:11.5,color:T.soft,marginTop:10}}>
                    Connected: {new Date(int.lastSynced).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </div>
                )}
                <div style={{marginTop:20,paddingTop:18,borderTop:`1px solid ${T.paper}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:50,fontSize:12,fontWeight:700,background:T.greenBg,color:T.green,border:`1px solid ${T.greenBd}`}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block"}}/>Connected
                  </span>
                  <button disabled={isBusy} onClick={()=>handleDisconnect(int.id)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${T.red}33`,background:"#FEF2F2",color:T.red,fontSize:12,fontWeight:700,cursor:isBusy?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",opacity:isBusy?0.6:1,transition:"all .18s"}}>
                    {isBusy?"Disconnecting…":"Disconnect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Connect Integration Modal ── */}
      {showConnectModal && (
        <div style={modalOverlay} onClick={()=>{ if(!connecting){ setShowConnectModal(false); setPickedIntegration(null); } }}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:500,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:"fadeUp .3s ease both",overflow:"hidden"}}>

            {/* Modal header */}
            <div style={{padding:"24px 28px 18px",borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:T.ink,margin:0}}>
                  {pickedIntegration ? `Configure ${pickedIntegration.name}` : "Connect an integration"}
                </h3>
                <p style={{margin:"4px 0 0",fontSize:12,color:T.soft}}>
                  {pickedIntegration ? pickedIntegration.desc : "Choose a service to connect to your account"}
                </p>
              </div>
              <button onClick={()=>{ if(!connecting){ setShowConnectModal(false); setPickedIntegration(null); } }} style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${T.line}`,background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:T.mid,flexShrink:0}}>✕</button>
            </div>

            <div style={{padding:"22px 28px 28px"}}>
              {!pickedIntegration ? (
                /* Integration picker */
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {AVAILABLE_INTEGRATIONS.map(intg => {
                    const alreadyConnected = connectedNames.has(intg.name);
                    return (
                      <div
                        key={intg.name}
                        onClick={()=>!alreadyConnected && pickIntegration(intg)}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",borderRadius:14,border:`1.5px solid ${alreadyConnected ? T.greenBd : T.line}`,background:alreadyConnected ? T.greenBg : T.paper,cursor:alreadyConnected?"default":"pointer",transition:"all .18s"}}
                        onMouseEnter={e=>{ if(!alreadyConnected) { e.currentTarget.style.borderColor=T.p300; e.currentTarget.style.background=T.p50; } }}
                        onMouseLeave={e=>{ if(!alreadyConnected) { e.currentTarget.style.borderColor=T.line; e.currentTarget.style.background=T.paper; } }}
                      >
                        <div style={{width:46,height:46,borderRadius:12,background:alreadyConnected?T.greenBg:T.white,border:`1.5px solid ${alreadyConnected?T.greenBd:T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{intg.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{intg.name}</div>
                          <div style={{fontSize:12,color:T.soft,marginTop:1}}>{intg.desc}</div>
                        </div>
                        {alreadyConnected ? (
                          <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 10px",flexShrink:0}}>Connected</span>
                        ) : (
                          <span style={{fontSize:11,fontWeight:700,color:T.p600,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:50,padding:"3px 10px",flexShrink:0}}>Configure →</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Config form */
                <div>
                  <button onClick={()=>{ setPickedIntegration(null); setConfigError(""); }} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:T.mid,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",marginBottom:18,padding:0}}>
                    ← Back to integrations
                  </button>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {pickedIntegration.fields.map(f=>(
                      <div key={f.key}>
                        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.mid,marginBottom:5,textTransform:"uppercase",letterSpacing:".4px"}}>{f.label}</label>
                        <input
                          type="text"
                          value={configValues[f.key]||""}
                          onChange={e=>{ setConfigValues(v=>({...v,[f.key]:e.target.value})); setConfigError(""); }}
                          placeholder={f.placeholder}
                          style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${T.line}`,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",background:T.paper,color:T.ink,transition:"border-color .2s"}}
                          onFocus={e=>e.target.style.borderColor=T.p400}
                          onBlur={e=>e.target.style.borderColor=T.line}
                        />
                      </div>
                    ))}
                    {configError && (
                      <div style={{background:"#FEF2F2",border:"1.5px solid #FECACA",borderRadius:9,padding:"9px 13px",fontSize:13,color:T.red}}>{configError}</div>
                    )}
                    <div style={{display:"flex",gap:10,marginTop:4}}>
                      <button onClick={()=>{ setShowConnectModal(false); setPickedIntegration(null); }} style={{flex:1,padding:"11px",borderRadius:50,border:`1.5px solid ${T.line}`,background:"transparent",color:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
                      <button onClick={handleConnect} disabled={connecting} className="btn-primary" style={{flex:2,fontSize:13,padding:"11px",opacity:connecting?0.7:1,cursor:connecting?"not-allowed":"pointer"}}>
                        {connecting ? "Connecting…" : `Connect ${pickedIntegration.name}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 9 — BILLING
═══════════════════════════════════════════ */
function PageBilling({ user, agentName }) {
  const invoices = [
    {date:"1 Mar 2026",desc:"Growth plan · March 2026",amount:"£399.00",status:"paid"},
    {date:"1 Feb 2026",desc:"Growth plan · February 2026",amount:"£399.00",status:"paid"},
    {date:"1 Jan 2026",desc:"Growth plan · January 2026",amount:"£399.00",status:"paid"},
    {date:"1 Dec 2025",desc:"Growth plan · December 2025",amount:"£399.00",status:"paid"},
    {date:"1 Nov 2025",desc:"Starter plan · November 2025",amount:"£199.00",status:"paid"},
  ];
  return (
    <>
      <TopBar title={<>Billing</>} subtitle="Manage your subscription and payment details" user={user} agentName={agentName}/>

      <div className="resp-grid-2">
        <div className="card" style={{background:`linear-gradient(135deg,${T.ink},${T.ink2})`,border:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Current plan</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"white",marginBottom:4}}>Growth</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24}}>£399/month · Renews 1 April 2026</div>
          <div style={{display:"flex",gap:8}}>
            <button style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Change plan</button>
            <button style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:50,padding:"9px 20px",fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Cancel</button>
          </div>
        </div>
        <div className="card">
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Usage this month</div>
          {[["Calls handled","1,247","Unlimited"],["Orders taken","486","Unlimited"],["Reservations booked","87","Unlimited"]].map(([l,v,limit])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.paper}`}}>
              <span style={{fontSize:13.5,color:T.mid}}>{l}</span>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:13.5,fontWeight:700,color:T.ink}}>{v}</span>
                <span style={{fontSize:11.5,color:T.soft,marginLeft:6}}>{limit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:16}}>Invoice history</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
            {invoices.map((inv,i)=>(
              <div key={i} style={{background:T.white,border:`1px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 8px 24px rgba(112,53,245,.08)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:20,background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center"}}>🧾</div>
                  <span className="badge badge-green" style={{padding:"4px 8px"}}>Paid</span>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:4}}>{inv.desc}</div>
                <div style={{fontSize:12,color:T.soft,marginBottom:16}}>{inv.date}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                  <div style={{fontSize:16,fontWeight:700,color:T.ink}}>{inv.amount}</div>
                  <button style={{fontSize:12,padding:"6px 14px",background:"#fff",border:`1.5px solid ${T.line}`,color:T.ink,borderRadius:6,fontWeight:600,cursor:"pointer"}}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{height:"fit-content",position:"sticky",top:20}}>
          <div className="card-head">Payment method</div>
          <div style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"16px 18px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:22}}>💳</span>
              <span className="badge badge-green">Default</span>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:1.5,marginBottom:6}}>•••• •••• •••• 4242</div>
            <div style={{fontSize:12,color:T.soft}}>Expires 12/27 · Visa</div>
          </div>
          <button style={{width:"100%",background:`linear-gradient(135deg, ${T.ink}, ${T.ink2})`,border:"none",color:"white",fontWeight:600,fontSize:14,padding:"12px 0",borderRadius:10,cursor:"pointer",marginBottom:12,boxShadow:`0 4px 12px rgba(0,0,0,0.15)`}}>Update payment method</button>
          <p style={{fontSize:12,color:T.soft,textAlign:"center",margin:0}}>🔒 Secured by Stripe</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 10 — SETTINGS
═══════════════════════════════════════════ */
function PageSettings({ user, agentName, bizData, onBizNameChange }) {
  const [section, setSection] = useState("Business");

  // ── Business ──────────────────────────────────────────────────────────────
  const [bizName, setBizName] = useState('');
  const [bizType, setBizType] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [savingBiz, setSavingBiz] = useState(false);
  // Business schedule
  const [biz24h,   setBiz24h]   = useState(false);
  const [bizSched, setBizSched] = useState(makeDefaultSchedule());

  // ── Ordering ──────────────────────────────────────────────────────────────
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  const [radiusUnit, setRadiusUnit] = useState('miles');
  const [minOrder, setMinOrder] = useState(0);
  const [payNow, setPayNow] = useState(true);
  const [payOnDelivery, setPayOnDelivery] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [collectionEnabled, setCollectionEnabled] = useState(true);
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
  const [staffRole, setStaffRole] = useState('STAFF');
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
      setBizPhone(bizData.phone || '');
      setBizEmail(bizData.email || user?.email || '');
      if (bizData.openingHours) {
        if (bizData.openingHours.is24h === "true") setBiz24h(true);
        else { setBiz24h(false); setBizSched(parseSchedule(bizData.openingHours)); }
      }
    } else if (user?.email) {
      setBizEmail(user.email);
    }
  }, [bizData, user]);

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
        if (d.openingHours) {
          if (d.openingHours.is24h === "true") setBiz24h(true);
          else { setBiz24h(false); setBizSched(parseSchedule(d.openingHours)); }
        }
      }).catch(() => {});
    } else if (section === 'Ordering') {
      api.settings.getOrderingPolicy().then(d => {
        setDeliveryRadius(d.deliveryRadius ?? 5);
        setRadiusUnit(d.deliveryRadiusUnit || 'miles');
        setMinOrder(d.minOrderAmount ?? 0);
        setPayNow(d.payNowEnabled ?? true);
        setPayOnDelivery(d.payOnDelivery ?? true);
        setDeliveryEnabled(d.deliveryEnabled ?? true);
        setCollectionEnabled(d.collectionEnabled ?? true);
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
        setForwardNumber(d.forwardNumber || '');
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
        openingHours: buildHours(biz24h, bizSched),
      });
      if (onBizNameChange) onBizNameChange(bizName);
    } catch (e) {} finally { setSavingBiz(false); }
  };

  const saveOrdering = async () => {
    setSavingOrder(true);
    try { await api.settings.updateOrderingPolicy({ deliveryRadius: parseFloat(deliveryRadius), deliveryRadiusUnit: radiusUnit, minOrderAmount: parseFloat(minOrder), payNowEnabled: payNow, payOnDelivery, deliveryEnabled, collectionEnabled }); }
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
    try { await api.settings.updatePhone({ forwardNumber: forwardNumber || null, ringsBeforeAi: parseInt(ringsBeforeAi), callRecording, voicemailFallback }); }
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
    if (!staffFn || !staffLn) return;
    try {
      const result = await api.settings.createStaff({ firstName: staffFn, lastName: staffLn, role: staffRole });
      setNewStaffCreds({ username: result.username, password: result.plainPassword });
      setStaffList(prev => [...prev, result]);
      setStaffFn(''); setStaffLn(''); setStaffRole('STAFF');
      setShowAddStaff(false);
    } catch (e) {}
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
      <TopBar title={<>Settings</>} subtitle="Manage your account and business preferences" user={user} agentName={agentName}/>

      {/* New staff credentials modal */}
      {newStaffCreds && (
        <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setNewStaffCreds(null)}>
          <div style={{position:"absolute",inset:0,background:"rgba(19,13,46,.45)",backdropFilter:"blur(6px)"}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:440,background:T.white,border:`1.5px solid ${T.line}`,borderRadius:22,padding:32,boxShadow:`0 24px 80px rgba(134,87,255,.18)`,animation:"fadeUp .3s ease both"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 12px",color:"white"}}>✓</div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.ink,margin:0}}>Staff account created</h3>
              <p style={{fontSize:13,color:T.soft,margin:"6px 0 0"}}>Save these credentials — the password won't be shown again</p>
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
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-input" value={staffRole} onChange={e=>setStaffRole(e.target.value)}><option value="STAFF">Staff</option></select>
            </div>
            <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.mid,marginBottom:16}}>
              A unique username and password will be auto-generated and shown once after creation.
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAddStaff(false)} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={handleAddStaff} className="btn-primary" style={{flex:1}} disabled={!staffFn||!staffLn}>Add staff member</button>
            </div>
          </div>
        </div>
      )}

      <div className="resp-grid-sidebar-left">
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
                  <div style={fw}><label style={lb}>Business phone number</label><input style={fi} value={bizPhone} onChange={e=>setBizPhone(e.target.value)} placeholder="e.g. +44 161 234 5678"/></div>
                  <div style={fw}><label style={lb}>Email</label><input style={fi} value={bizEmail} onChange={e=>setBizEmail(e.target.value)} type="email"/></div>
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
                  <label style={lb}>Backup number (optional)</label>
                  <input value={forwardNumber} onChange={e=>setForwardNumber(e.target.value)} placeholder="e.g. +44 161 234 5678" style={{...fi,flex:1}}/>
                </div>
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
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div className="card-head" style={{margin:0}}>Ordering policy</div>
                <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}} onClick={saveOrdering} disabled={savingOrder}>{savingOrder?"Saving...":"Save changes"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                <div style={fw}>
                  <label style={lb}>Delivery radius</label>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input value={deliveryRadius} onChange={e=>setDeliveryRadius(e.target.value)} style={{...fi,width:80,textAlign:"center"}} type="number" min="0"/>
                    <select value={radiusUnit} onChange={e=>setRadiusUnit(e.target.value)} style={{padding:"13px 14px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}><option value="miles">Miles</option><option value="km">Km</option></select>
                  </div>
                </div>
                <div style={fw}>
                  <label style={lb}>Minimum order amount</label>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:16,fontWeight:700,color:T.mid}}>£</span>
                    <input value={minOrder} onChange={e=>setMinOrder(e.target.value)} style={fi} type="number" min="0" step="0.01"/>
                  </div>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Payment options</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
                {[["💳","Pay now","Customer pays via payment link before order is prepared",payNow,setPayNow],["🚚","Pay on delivery / collection","Customer pays when order arrives or at pickup",payOnDelivery,setPayOnDelivery]].map(([ic,h,d,val,setter])=>(
                  <div key={h} style={fw}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{ic}</span><h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{h}</h4></div>
                      <label className="toggle"><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                    </div>
                    <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{d}</p>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["🏠","Collection enabled","Allow customers to pick up orders in-store",collectionEnabled,setCollectionEnabled],["🚗","Delivery enabled","Deliver orders to customers within radius",deliveryEnabled,setDeliveryEnabled]].map(([ic,h,d,val,setter])=>(
                  <div key={h} style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{ic}</span><h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{h}</h4></div>
                      <label className="toggle"><input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                    </div>
                    <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{d}</p>
                  </div>
                ))}
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
                        <span style={{fontSize:14,fontWeight:700,color:T.mid}}>£</span>
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

/* ═══════════════════════════════════════════
   PAYMENT LINK SCREEN
   (Customer-facing page — sent via SMS/email by the AI agent)
═══════════════════════════════════════════ */
function PaymentLinkScreen({ onBack }) {
  const [paid, setPaid] = useState(false);
  if (paid) return <PaymentConfirmScreen onBack={onBack} />;
  return (
    <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{G}</style>
      <div style={{width:"100%",maxWidth:480,animation:"fadeUp .6s ease both"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontStyle:"italic",fontSize:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}>t</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.ink}}>talkativ</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-.5px"}}>Complete your payment</h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>Secure payment for your order at Tony's Pizzeria</p>
        </div>

        {/* Order Summary Card */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,marginBottom:20,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>Order summary</div>
          <div style={{borderBottom:`1px solid ${T.paper}`,paddingBottom:14,marginBottom:14}}>
            {[{n:"Large Pepperoni Pizza",q:1,p:"£14.99"},{n:"Garlic Bread",q:2,p:"£7.98"},{n:"Coke 330ml",q:2,p:"£3.98"}].map(i=>(
              <div key={i.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
                <div>
                  <span style={{fontSize:14,fontWeight:600,color:T.ink}}>{i.n}</span>
                  <span style={{fontSize:12,color:T.soft,marginLeft:8}}>×{i.q}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:T.ink}}>{i.p}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}>
            <span style={{fontSize:13,color:T.soft}}>Delivery fee</span>
            <span style={{fontSize:13,fontWeight:600,color:T.ink}}>£2.50</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:`1.5px solid ${T.line}`,marginTop:10}}>
            <span style={{fontSize:16,fontWeight:700,color:T.ink}}>Total</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:T.p600}}>£29.45</span>
          </div>
        </div>

        {/* Payment Form */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:16}}>Payment details</div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Card number</label>
            <input placeholder="4242 4242 4242 4242" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",letterSpacing:1}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Expiry date</label>
              <input placeholder="MM / YY" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>CVC</label>
              <input placeholder="123" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.mid,marginBottom:6}}>Name on card</label>
            <input placeholder="John Smith" style={{width:"100%",padding:"14px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.paper,color:T.ink,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
          </div>
          <button onClick={()=>setPaid(true)} style={{width:"100%",padding:"16px",background:T.ink,color:"white",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s"}}>Pay £29.45 →</button>
          <div style={{textAlign:"center",marginTop:14}}>
            <span style={{fontSize:12,color:T.soft}}>🔒 Secured by Stripe · 256-bit SSL encryption</span>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:28}}>
          <span style={{fontSize:12,color:T.faint}}>Payment link generated by Talkativ AI for Tony's Pizzeria</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAYMENT CONFIRMATION SCREEN
═══════════════════════════════════════════ */
function PaymentConfirmScreen({ onBack }) {
  return (
    <div style={{minHeight:"100vh",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      <style>{G}</style>
      {/* Background decoration */}
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 1px 1px, ${T.p200} 1px, transparent 0)`,backgroundSize:"28px 28px",opacity:.2,pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480,animation:"fadeUp .6s ease both"}}>
        {/* Success Icon */}
        <div style={{width:100,height:100,borderRadius:"50%",background:`linear-gradient(135deg,${T.green},#16a34a)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,margin:"0 auto 28px",boxShadow:`0 12px 40px rgba(34,197,94,.3)`,animation:"countUp .6s cubic-bezier(.34,1.56,.64,1) both"}}>✓</div>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:900,color:T.ink,marginBottom:10,letterSpacing:"-1px"}}>Payment confirmed!</h1>
        <p style={{fontSize:16,color:T.mid,fontWeight:300,lineHeight:1.65,marginBottom:36}}>Your payment has been processed successfully. A confirmation has been sent to your phone and email.</p>

        {/* Confirmation Details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:36}}>
          {[["🧾","ORD-2847","Order ID"],["💳","£29.45","Amount paid"],["🕐","25-30 min","Est. delivery"]].map(([ic,v,l])=>(
            <div key={l} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:"20px 16px",boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
              <div style={{fontSize:24,marginBottom:10}}>{ic}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:T.p600,marginBottom:4}}>{v}</div>
              <div style={{fontSize:11,color:T.soft,textTransform:"uppercase",letterSpacing:".6px",fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:18,padding:24,textAlign:"left",marginBottom:32,boxShadow:`0 4px 16px rgba(134,87,255,.05)`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>What you ordered</div>
          {["Large Pepperoni Pizza ×1","Garlic Bread ×2","Coke 330ml ×2"].map(i=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.paper}`}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.green,flexShrink:0}}/>
              <span style={{fontSize:14,color:T.ink,fontWeight:500}}>{i}</span>
            </div>
          ))}
          <div style={{marginTop:14,padding:"12px 14px",background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:10,fontSize:13,color:"#166534",fontWeight:600}}>
            📍 Delivering to: 42 Oxford Road, Manchester M1 5QA
          </div>
        </div>

        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={onBack} className="btn-hero" style={{fontSize:14,padding:"14px 28px"}}>Back to home →</button>
        </div>
        <p style={{fontSize:12,color:T.faint,marginTop:20}}>Confirmation sent to +44 7811 234 567 · tony@email.com</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════ */
function LoginScreen({ onBack, onDashboard }) {
  const [mode, setMode] = useState("owner");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  // Owner form state
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  // Staff form state
  const [staffBusiness, setStaffBusiness] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const handleOwnerLogin = async () => {
    if (!ownerEmail || !ownerPassword) { setAlert({ type: "error", message: "Please fill in all fields." }); return; }
    setLoading(true); setAlert(null);
    try {
      const data = await api.auth.login(ownerEmail, ownerPassword);
      setAlert({ type: "success", message: "Welcome back! Redirecting..." });
      setTimeout(() => onDashboard(data.user), 500);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Invalid email or password.", action: { label: "Create an account →", onClick: onBack } });
    }
    setLoading(false);
  };

  const handleStaffLogin = async () => {
    if (!staffBusiness || !staffUsername || !staffPassword) { setAlert({ type: "error", message: "Please fill in all fields." }); return; }
    setLoading(true); setAlert(null);
    try {
      const data = await api.auth.staffLogin(staffBusiness, staffUsername, staffPassword);
      setAlert({ type: "success", message: "Welcome back! Redirecting..." });
      setTimeout(() => onDashboard(data.user), 500);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "No staff found with those credentials." });
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = api.auth.googleLoginUrl();
  };

  return (
    <div style={{minHeight:"100vh",background:T.paper,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{G}</style>
      <div style={{width:"100%",maxWidth:460,animation:"fadeUp .6s ease both"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p500},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontStyle:"italic",fontSize:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}>t</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:T.ink}}>talkativ</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:T.ink,marginBottom:8,letterSpacing:"-.5px"}}>Welcome back</h1>
          <p style={{fontSize:14,color:T.mid,fontWeight:300}}>Sign in to your account to continue</p>
        </div>

        {/* Mode Toggle */}
        <div style={{display:"flex",background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:4,marginBottom:24}}>
          {["owner","staff"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setAlert(null);}} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .2s",background:mode===m?T.ink:"transparent",color:mode===m?"white":T.mid}}>{m==="owner"?"Owner":"Staff"}</button>
          ))}
        </div>

        {/* Alert */}
        {alert && (
          <div style={{background:alert.type==="error"?T.redBg:T.greenBg,border:`1.5px solid ${alert.type==="error"?"#fecaca":T.greenBd}`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{alert.type==="error"?"⚠️":"✅"}</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:alert.type==="error"?T.red:T.green}}>{alert.message}</div>
              {alert.action && <div style={{fontSize:12,color:T.p600,cursor:"pointer",marginTop:4,fontWeight:600}} onClick={alert.action.onClick}>{alert.action.label}</div>}
            </div>
          </div>
        )}

        {/* Owner Login */}
        {mode==="owner" && (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            <div className="sso-row" style={{marginBottom:16}}>
              <button className="sso-btn" style={{width:"100%"}} onClick={handleGoogleLogin}>🔵 Continue with Google</button>
            </div>
            <div className="divider-row"><div className="divider-line"/><span className="divider-text">or sign in with email</span><div className="divider-line"/></div>
            <div style={{marginTop:16}}>
              <div className="form-group"><label className="form-label">Email address</label><input className="form-input" placeholder="you@restaurant.com" type="email" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOwnerLogin()}/></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="Enter your password" type="password" value={ownerPassword} onChange={e=>setOwnerPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOwnerLogin()}/></div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:18}}>
                <span style={{fontSize:12.5,color:T.p600,cursor:"pointer",fontWeight:500}}>Forgot password?</span>
              </div>
              <button disabled={loading} onClick={handleOwnerLogin} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s"}}>{loading?"Signing in...":"Sign in →"}</button>
            </div>
          </div>
        )}

        {/* Staff Login */}
        {mode==="staff" && (
          <div style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:20,padding:28,boxShadow:`0 8px 32px rgba(134,87,255,.06)`}}>
            <div className="form-group"><label className="form-label">Business name</label><input className="form-input" placeholder="e.g. Tony's Pizzeria" value={staffBusiness} onChange={e=>setStaffBusiness(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Username</label><input className="form-input" placeholder="Your staff username" value={staffUsername} onChange={e=>setStaffUsername(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="Enter your password" type="password" value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleStaffLogin()}/></div>
            <button disabled={loading} onClick={handleStaffLogin} style={{width:"100%",padding:"14px",background:loading?T.soft:T.ink,color:"white",border:"none",borderRadius:12,fontSize:14.5,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:`0 4px 20px rgba(19,13,46,.2)`,transition:"all .22s",marginTop:8}}>{loading?"Signing in...":"Sign in as staff →"}</button>
          </div>
        )}

        <div style={{textAlign:"center",marginTop:24}}>
          <span style={{fontSize:13,color:T.soft}}>Don't have an account? </span>
          <span style={{fontSize:13,color:T.p600,cursor:"pointer",fontWeight:600}} onClick={onBack}>Create one free →</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP
═══════════════════════════════════════════ */
const PAGE_MAP = {
  "Dashboard":    PageDashboard,
  "Calls":        PageCalls,
  "Orders":       PageOrders,
  "Reservations": PageReservations,
  "My Agent":     PageMyAgent,
  "Voice & Script": PageVoiceScript,
  "Menu":         PageMenu,
  "Integrations": PageIntegrations,
  "Billing":      PageBilling,
  "Settings":     PageSettings,
};


function DashboardApp({ onBack, user }) {
  const [active, setActive] = useState("Dashboard");
  const [agentName, setAgentName] = useState("");
  const [bizName, setBizName] = useState("");
  const [agentData, setAgentData] = useState(null);
  const [bizData, setBizData] = useState(null);
  const [menuSynced, setMenuSynced] = useState(false);

  useEffect(() => {
    api.agent.get().then(d => { if (d?.name) setAgentName(d.name); setAgentData(d); }).catch(() => {});
    api.business.get().then(d => { if (d?.name) setBizName(d.name); setBizData(d); }).catch(() => {});
    api.menu.getCategories().then(cats => { setMenuSynced(Array.isArray(cats) && cats.length > 0); }).catch(() => {});
  }, []);

  const nav = (p) => { setActive(p); document.body.classList.remove('mob-nav-open'); window.scrollTo(0,0); };
  const PageComponent = PAGE_MAP[active] || PageDashboard;
  const sharedProps = { onNav: nav, user, agentName, bizName, agentData, bizData, menuSynced, onAgentNameChange: setAgentName, onBizNameChange: setBizName };

  return (
    <div className="dash-wrap">
      <Sidebar active={active} onNav={nav} user={user} agentName={agentName} bizName={bizName} />
      <main className="dash-main" key={active}>
        <div className="dash-overlay" onClick={() => document.body.classList.remove('mob-nav-open')} />
        <PageComponent {...sharedProps} />
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [obBizName, setObBizName] = useState("");
  const [obAgentName, setObAgentName] = useState("Aria");
  const [obPhone, setObPhone] = useState("");

  const go = s => { document.body.classList.remove('mob-nav-open'); setScreen(s); window.scrollTo(0, 0); };

  // Check for auth token in URL params (Google OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ── Google register callback: pre-fill the form, don't log in yet ──────
    if (params.get('google_signup') === 'true') {
      sessionStorage.setItem('talkativ_google_profile', JSON.stringify({
        email: decodeURIComponent(params.get('google_email') || ''),
        firstName: decodeURIComponent(params.get('google_firstName') || ''),
        lastName: decodeURIComponent(params.get('google_lastName') || ''),
      }));
      window.history.replaceState({}, '', window.location.pathname);
      setStep(1);
      setScreen('ob1');
      setAuthChecked(true);
      return;
    }

    // ── Google login callback: issue token and go to dashboard ──────────────
    const authToken = params.get('auth_token');
    if (authToken) {
      setAccessToken(authToken);
      const userData = {
        id: params.get('user_id'),
        email: decodeURIComponent(params.get('user_email') || ''),
        role: params.get('user_role'),
        firstName: decodeURIComponent(params.get('user_firstName') || ''),
        lastName: decodeURIComponent(params.get('user_lastName') || ''),
      };
      setUser(userData);
      window.history.replaceState({}, '', window.location.pathname);
      setScreen('dashboard');
      setAuthChecked(true);
      return;
    }

    // Try to refresh token on mount (for returning users)
    const tryRefresh = async () => {
      const refreshed = await api.auth.refreshToken();
      if (refreshed) {
        // Restore user data from localStorage if available
        try {
          const stored = localStorage.getItem('talkativ_user');
          if (stored) setUser(JSON.parse(stored));
        } catch {}
        setAuthChecked(true);
      } else {
        try { localStorage.removeItem('talkativ_user'); } catch {}
        setAuthChecked(true);
      }
    };
    tryRefresh();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    try { localStorage.setItem('talkativ_user', JSON.stringify(userData)); } catch {}
    go('dashboard');
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    try { localStorage.removeItem('talkativ_user'); } catch {}
    go('landing');
  };

  const nextOb = () => { if (step < 7) { setStep(step + 1); go(`ob${step + 1}`); } else go("success"); };
  const backOb = () => { if (step > 0) { setStep(step - 1); go(`ob${step - 1}`); } else go("landing"); };

  const renderScreen = () => {
    if (screen === "landing")   return <Landing onCTA={() => { setStep(0); go("ob0"); }} onLogin={() => go("login")} />;
    if (screen === "login")     return <LoginScreen onBack={() => { setStep(0); go("ob0"); }} onDashboard={handleLogin} />;
    if (screen === "ob0")       return <Step0 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob1")       return <Step1 onNext={nextOb} onBack={backOb} onPhoneChange={setObPhone} onRegister={u => setUser(u)} />;
    if (screen === "ob2")       return <Step2 onNext={nextOb} onBack={backOb} onBizNameChange={setObBizName} />;
    if (screen === "ob3")       return <Step3 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob4")       return <Step4 onNext={nextOb} onBack={backOb} bizName={obBizName} bizPhone={obPhone} onAgentNameChange={setObAgentName} />;
    if (screen === "ob5")       return <Step5 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob6")       return <Step6 onNext={nextOb} onBack={backOb} agentName={obAgentName} />;
    if (screen === "ob7")       return <Step7 onNext={async () => { try { await api.business.completeOnboarding(); } catch (e) { console.error('completeOnboarding failed:', e); } go("success"); }} onBack={backOb} />;
    if (screen === "success")   return <SuccessScreen onDashboard={() => go("dashboard")} agentName={obAgentName} bizName={obBizName} />;
    if (screen === "dashboard") return <DashboardApp onBack={handleLogout} user={user} />;
    if (screen === "payment")   return <PaymentLinkScreen onBack={() => go("landing")} />;
    if (screen === "payment-confirm") return <PaymentConfirmScreen onBack={() => go("landing")} />;
  };

  return (
    <>
      <style>{G}</style>
      {renderScreen()}
    </>
  );
}
