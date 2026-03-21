import { useState, useEffect, useRef } from "react";

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
function Landing({ onCTA }) {
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
              { icon: "🔌", label: "POS connected", sub: "Toast · Clover · Square" },
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
              { span: 6, icon: "🔌", title: "Deep POS integrations", body: "Toast, Clover, Square, OpenTable, Aloha and 8 more. One-click setup, real-time sync." },
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
              ["★★★★★", "Sarah K.", "Owner, Pho Garden", "The Toast integration is seamless. Orders appear on the POS instantly. We've saved 3 hours of admin every single day."],
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

function Step1({ onNext, onBack }) {
  return (
    <ObShell step={1} onNext={onNext} onBack={onBack} nextLabel="Create account →">
      <div className="ob-step-label">Step 2 · Account</div>
      <h1 className="ob-heading">Create your<br /><em>account</em></h1>
      <p className="ob-subheading">No credit card required. 14-day free trial on all plans — cancel any time.</p>
      <div className="sso-row">
        <button className="sso-btn">🔵 Continue with Google</button>
      </div>
      <div className="divider-row"><div className="divider-line" /><span className="divider-text">or continue with email</span><div className="divider-line" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">First name</label><input className="form-input" placeholder="Maria" /></div>
        <div className="form-group"><label className="form-label">Last name</label><input className="form-input" placeholder="Chen" /></div>
      </div>
      <div className="form-group"><label className="form-label">Email address</label><input className="form-input" placeholder="maria@restaurant.com" type="email" /></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="At least 8 characters" type="password" /></div>
      <p style={{ fontSize: 12.5, color: T.soft, marginTop: 6 }}>By continuing you agree to our <span style={{ color: T.p600, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: T.p600, cursor: "pointer" }}>Privacy Policy</span>.</p>
    </ObShell>
  );
}

function Step2({ onNext, onBack }) {
  return (
    <ObShell step={2} onNext={onNext} onBack={onBack} nextLabel="Looks good →">
      <div className="ob-step-label">Step 3 · Business profile</div>
      <h1 className="ob-heading">Tell us about<br /><em>your business</em></h1>
      <p className="ob-subheading">Search your business name and we'll pull your address, hours, and category from Google automatically.</p>
      <div className="form-group">
        <label className="form-label">Business name</label>
        <div style={{ position: "relative" }}>
          <input className="form-input" defaultValue="Tony's Pizzeria" style={{ paddingRight: 120 }} />
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: T.p600, color: "white", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🔍 Search</div>
        </div>
      </div>
      <div className="info-block">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 46, height: 46, background: `linear-gradient(135deg,${T.p400},${T.p700})`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍕</div>
          <div><div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink }}>Tony's Pizzeria</div><div style={{ fontSize: 12, color: T.soft }}>Restaurant · Manchester, UK</div></div>
          <div style={{ marginLeft: "auto", background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, color: T.green }}>✓ Found</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {[["📍", "Address", "14 High Street, Manchester M1 1AE"], ["🕐", "Hours", "Mon–Sun · 11am – 11pm"], ["📞", "Phone", "0161 234 5678"], ["🌐", "Category", "Pizza Restaurant"]].map(([ic, l, v]) => (
            <div key={l} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: T.soft, marginBottom: 3 }}>{ic} {l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </ObShell>
  );
}

function Step3({ onNext, onBack }) {
  const [sel, setSel] = useState(0);
  const opts = [
    { icon: "🌐", title: "Import from URL", desc: "Paste your website or online menu link", badge: "Fastest" },
    { icon: "📄", title: "Upload a PDF", desc: "Drag and drop your printed menu" },
    { icon: "🔌", title: "Connect your POS", desc: "Toast, Clover, Square and 8 more", badge: "Recommended" },
  ];
  return (
    <ObShell step={3} onNext={onNext} onBack={onBack} nextLabel="Import menu →">
      <div className="ob-step-label">Step 4 · Menu</div>
      <h1 className="ob-heading">Import your<br /><em>menu</em></h1>
      <p className="ob-subheading">We parse it automatically — no manual entry. Your AI uses this to answer customer questions and take orders.</p>
      <div className="import-list">
        {opts.map((o, i) => (
          <div key={o.title} className={`import-item ${sel === i ? "selected" : ""}`} onClick={() => setSel(i)}>
            <div className="import-item-icon">{o.icon}</div>
            <div className="import-item-info"><h4>{o.title}</h4><p>{o.desc}</p></div>
            {o.badge && <div className="import-badge">{o.badge}</div>}
            <div className="radio-dot" style={{ borderColor: sel === i ? T.p500 : T.faint, background: sel === i ? T.p500 : "transparent" }}>
              {sel === i && <div className="radio-inner" />}
            </div>
          </div>
        ))}
      </div>
      {sel === 0 && <div style={{ marginTop: 18 }}><label className="form-label">Menu URL</label><input className="form-input" placeholder="https://tonys-pizzeria.com/menu" style={{ marginTop: 6 }} /></div>}
      {sel === 1 && (
        <div style={{ marginTop: 18, border: `2px dashed ${T.borderM || T.faint}`, borderRadius: 16, padding: 36, textAlign: "center", cursor: "pointer", background: T.paper }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
          <div style={{ fontWeight: 600, color: T.ink, fontSize: 14 }}>Drop your PDF here</div>
          <div style={{ fontSize: 13, color: T.soft, marginTop: 5 }}>or click to browse files</div>
        </div>
      )}
      {sel === 2 && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {["Toast", "Clover", "Square", "OpenTable", "Aloha", "Olo"].map(p => (
            <div key={p} style={{ border: `1.5px solid ${T.line}`, borderRadius: 12, padding: "12px 14px", textAlign: "center", cursor: "pointer", background: T.white, fontSize: 13.5, fontWeight: 500, color: T.mid, transition: "all .18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.p300; e.currentTarget.style.color = T.p600; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.mid; }}>
              {p}
            </div>
          ))}
        </div>
      )}
    </ObShell>
  );
}

function Step4({ onNext, onBack }) {
  const [vc, setVc] = useState(0);
  const [greeting, setGreeting] = useState("Thanks for calling Tony's Pizzeria! I'm Aria, your AI assistant. Would you like to place an order, check our hours, or something else?");
  return (
    <ObShell step={4} onNext={onNext} onBack={onBack} nextLabel="Save & continue →">
      <div className="ob-step-label">Step 5 · Voice & script</div>
      <h1 className="ob-heading">Customise your<br /><em>AI agent</em></h1>
      <p className="ob-subheading">Pick a voice and personalise your greeting. All fields are pre-filled — just change what you want.</p>
      <label className="form-label" style={{ marginBottom: 12 }}>Choose a voice</label>
      <div className="voice-grid">
        {[{ n: "Aria", d: "Warm & professional" }, { n: "Leo", d: "Friendly & upbeat" }, { n: "Nova", d: "Calm & precise" }, { n: "Finn", d: "Casual & relaxed" }].map((v, i) => (
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
      <div className="form-group"><label className="form-label">Agent name</label><input className="form-input" defaultValue="Aria" /></div>
      <div className="form-group">
        <label className="form-label">Greeting message</label>
        <textarea className="form-input" rows={3} value={greeting} onChange={e => setGreeting(e.target.value)} />
        <div style={{ fontSize: 11.5, color: T.soft, marginTop: 6 }}>Keep under 20 seconds of speech for the best experience</div>
      </div>
      <div className="form-group">
        <label className="form-label">When agent can't help, it should…</label>
        <select className="form-input"><option>Transfer to your phone number</option><option>Take a voicemail</option><option>Ask caller to call back later</option></select>
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

function Step6({ onNext, onBack }) {
  const [called, setCalled] = useState(false);
  return (
    <ObShell step={6} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 7 · Test call</div>
      <h1 className="ob-heading">Test your agent<br />before <em>going live</em></h1>
      <p className="ob-subheading">One click to hear exactly what your customers will experience when they call.</p>
      <div className="test-call-card">
        <div className="test-call-icon">{called ? "✅" : "📞"}</div>
        <h3>{called ? "Your agent sounds perfect!" : "Ready to make a test call?"}</h3>
        <p>{called ? "Everything is working beautifully. Aria is ready to go live to your customers." : "Call your Talkativ number and hear your fully configured AI agent answering as your business."}</p>
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
function SuccessScreen({ onDashboard }) {
  return (
    <div className="success-screen">
      <style>{G}</style>
      <div className="success-bg" />
      <div className="success-icon">🎉</div>
      <h1 className="success-h1">You're live!</h1>
      <p className="success-sub">Aria is now answering calls for Tony's Pizzeria. Your first real customer call could come in any moment.</p>
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

function Sidebar({ active, onNav }) {
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
          <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white" }}>TC</div>
          Tony's Pizzeria
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, children }) {
  return (
    <div className="dash-topbar">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
        <div>
        <div className="dash-date">Wednesday · 18 March 2026</div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>

      </div>
      <div className="dash-topbar-right">
        <div className="dash-live-badge">
          <div style={{ width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite" }} />
          Agent live
        </div>
        {children}
        <div className="dash-avatar">TC</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE 1 — DASHBOARD (HOME)
═══════════════════════════════════════════ */
function PageDashboard() {
  const calls = [
    { s:"live", n:"Incoming call",  d:"Live now · +44 7811 234 567", o:"Taking order",    b:"order" },
    { s:"done", n:"Sarah Williams", d:"Today 2:14pm · 1:42",          o:"Order — £34.50", b:"order" },
    { s:"done", n:"James Patel",    d:"Today 1:58pm · 0:38",          o:"Menu enquiry",   b:"info"  },
    { s:"done", n:"Unknown caller", d:"Today 1:22pm · 0:12",          o:"Hours check",    b:"info"  },
    { s:"miss", n:"Missed call",    d:"Today 12:45pm",                 o:"Missed",         b:"missed"},
    { s:"done", n:"Lucy Chen",      d:"Today 11:30am · 2:05",          o:"Order — £52.00", b:"order" },
  ];
  const bars = [42,67,58,82,74,91,100,79,88,96,62,50];
  const days = ["M","T","W","T","F","S","S","M","T","W","T","F"];
  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>
        <div>
          <div className="dash-date">Wednesday · 18 March 2026</div>
          <div className="dash-greeting">Good afternoon, <strong>Tony</strong> 👋</div>
        </div>

        </div>
        <div className="dash-topbar-right">
          <div className="dash-live-badge"><div style={{ width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite" }} />Agent live</div>
          <div className="dash-avatar">TC</div>
        </div>
      </div>

      <div className="live-banner">
        <div className="lb-icon">📞</div>
        <div className="lb-content"><h4>Live call in progress</h4><p>Aria is taking an order · +44 7811 234 567 · 0:34</p></div>
        <div className="lb-wave">{Array.from({length:9},(_,i)=><div key={i} className="lb-wave-bar" style={{height:6+Math.random()*16,animationDelay:`${i*.09}s`}}/>)}</div>
        <button className="lb-btn">Listen in →</button>
      </div>

      <div className="kpi-row">
        {[{l:"Calls today",v:"14",d:"↑ 3 vs yesterday"},{l:"Revenue today",v:"£486",d:"↑ 12% vs last Wed"},{l:"Avg. call time",v:"1:18",d:"↓ 8s this week"},{l:"Answer rate",v:"100%",d:"0 missed today"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Recent calls <span className="card-link">View all →</span></div>
            {calls.map((c,i)=>(
              <div className="call-log-item" key={i}>
                <div className={`call-dot ${c.s==="live"?"live":c.s==="done"?"done":"miss"}`}/>
                <div style={{flex:1}}><div className="call-name">{c.n}</div><div className="call-detail">{c.d}</div></div>
                <span className={`call-badge ${c.b==="order"?"order":c.b==="info"?"info":"missed"}`}>{c.o}</span>
              </div>
            ))}
          </div>

        </div>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Your agent</div>
            <div className="agent-card">
              <div className="agent-avatar">🤖</div>
              <div><div className="agent-name">Aria</div><div className="agent-status"><div className="agent-status-dot"/>Active · Tony's Pizzeria</div></div>
              <button className="agent-edit-btn">Edit</button>
            </div>
            <div className="agent-meta">
              {[["Voice","Aria · Warm"],["Language","English"],["Call rules","Transfer"],["POS","Toast ✓"]].map(([l,v])=>(
                <div key={l} className="agent-meta-item"><div className="agent-meta-label">{l}</div><div className="agent-meta-value">{v}</div></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head">Quick actions</div>
            <div className="quick-actions-grid">
              {[["📞","Test call"],["📋","Update menu"],["⏰","Edit hours"]].map(([ic,l])=>(
                <div key={l} className="qa-item"><div className="qa-icon">{ic}</div><div className="qa-label">{l}</div></div>
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
function PageCalls() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const calls = [
    { s:"live", n:"Incoming call",  phone:"+44 7811 234 567", time:"Live now",    dur:"0:34",  outcome:"Taking order",    amount:"",      b:"order" },
    { s:"done", n:"Sarah Williams", phone:"+44 7922 111 222", time:"Today 2:14pm",dur:"1:42",  outcome:"Order placed",    amount:"£34.50",b:"order" },
    { s:"done", n:"James Patel",    phone:"+44 7933 444 555", time:"Today 1:58pm",dur:"0:38",  outcome:"Menu enquiry",    amount:"",      b:"info"  },
    { s:"done", n:"Unknown caller", phone:"+44 7944 666 777", time:"Today 1:22pm",dur:"0:12",  outcome:"Hours check",     amount:"",      b:"info"  },
    { s:"miss", n:"Missed call",    phone:"+44 7800 123 456", time:"Today 12:45pm",dur:"\u2014",    outcome:"Missed",          amount:"",      b:"missed"},
    { s:"done", n:"Lucy Chen",      phone:"+44 7711 999 888", time:"Today 11:30am",dur:"2:05", outcome:"Order placed",    amount:"\u00a352.00",b:"order" },
    { s:"done", n:"David Park",     phone:"+44 7622 777 333", time:"Yesterday 7pm",dur:"1:18", outcome:"Reservation",     amount:"",      b:"info"  },
    { s:"done", n:"Emma Thompson",  phone:"+44 7533 222 111", time:"Yesterday 6pm",dur:"0:55", outcome:"Order placed",    amount:"\u00a328.75",b:"order" },
    { s:"miss", n:"Unknown",        phone:"+44 7444 555 666", time:"Yesterday 5pm",dur:"\u2014",    outcome:"Missed",          amount:"",      b:"missed"},
    { s:"done", n:"Ravi Sharma",    phone:"+44 7355 888 444", time:"Yesterday 3pm",dur:"2:22", outcome:"Order placed",    amount:"\u00a367.00",b:"order" },
  ];
  const tabs = ["All","Orders","Enquiries","Missed"];
  const filtered = filter==="All"?calls:filter==="Orders"?calls.filter(c=>c.b==="order"):filter==="Missed"?calls.filter(c=>c.b==="missed"):calls.filter(c=>c.b==="info");
  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>All <strong>Calls</strong></>} subtitle="Every call routed through Talkativ with full transcripts">
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export CSV</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Total today",v:"14",d:"\u2191 3 vs yesterday"},{l:"Answered",v:"13",d:"92.8% answer rate"},{l:"Avg. duration",v:"1:18",d:"\u2193 8s vs last week"},{l:"Orders taken",v:"8",d:"\u2191 \u00a3486 revenue"}].map(k=>(
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
            <select style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>Today</option><option>Yesterday</option><option>This week</option><option>This month</option>
            </select>
          </div>
        </div>

        {isMobile ? (
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
function PageOrders() {
  const [tab, setTab] = useState("Today");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const orders = [
    { id:"ORD-0091", name:"Sarah Williams", items:"Large pepperoni, garlic bread", type:"Delivery", status:"completed", amount:"£34.50", time:"2:14pm" },
    { id:"ORD-0090", name:"Lucy Chen",       items:"2x Margherita, tiramisu \u00d72",  type:"Collection",status:"completed", amount:"£52.00", time:"11:30am" },
    { id:"ORD-0089", name:"Incoming call",   items:"Ordering in progress\u2026",       type:"Delivery",  status:"live",      amount:"\u2014",      time:"Now" },
    { id:"ORD-0088", name:"Emma Thompson",  items:"Calzone, 2x Coke, dessert",    type:"Delivery",  status:"completed", amount:"£28.75", time:"Yesterday" },
    { id:"ORD-0087", name:"Ravi Sharma",    items:"Family feast + 4 garlic breads",type:"Collection",status:"completed",amount:"£67.00", time:"Yesterday" },
    { id:"ORD-0086", name:"David Park",     items:"3x Quattro formaggi",          type:"Delivery",  status:"completed", amount:"£41.50", time:"Yesterday" },
  ];
  const perPage = 5;
  const totalPages = Math.ceil(orders.length / perPage);
  const paginated = orders.slice((page-1)*perPage, page*perPage);
  const statusColor = { completed:"order", live:"purple" };
  return (
    <>
      <TopBar title={<>All <strong>Orders</strong></>} subtitle="Orders taken by Aria across all calls">
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Export</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Orders today",v:"9",d:"\u2191 2 vs yesterday"},{l:"Revenue today",v:"£486",d:"\u2191 12% vs last Wed"},{l:"Avg. order value",v:"£54",d:"\u2191 £6 this week"},{l:"Delivery rate",v:"62%",d:"vs 38% collection"}].map(k=>(
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
            <select style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All types</option><option>Delivery</option><option>Collection</option>
            </select>
            <select style={{padding:"8px 16px",fontSize:13,border:`1.5px solid ${T.line}`,borderRadius:50,background:T.white,color:T.ink,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",outline:"none",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <option>All statuses</option><option>Completed</option><option>Live</option>
            </select>
          </div>
        </div>

        {isMobile ? (
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
            <div style={{fontSize:13,color:T.soft}}>Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, orders.length)} of {orders.length} orders</div>
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
function PageReservations() {
  const [view, setView] = useState("List");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const reservations = [
    { name:"Emily Watson",     guests:4, date:"Today 7:30pm",   status:"confirmed", note:"Window table requested", phone:"+44 7811 234 567" },
    { name:"The Johnson Group",guests:8, date:"Today 8:00pm",   status:"confirmed", note:"Birthday dinner",         phone:"+44 7922 111 222" },
    { name:"Amir Hassan",      guests:2, date:"Today 9:00pm",   status:"pending",   note:"",                        phone:"+44 7933 444 555" },
    { name:"Sophie Clarke",    guests:6, date:"Tomorrow 1:00pm",status:"confirmed", note:"Vegetarian menu",        phone:"+44 7944 666 777" },
    { name:"Mark & Laura",     guests:2, date:"Tomorrow 7:30pm",status:"confirmed", note:"Anniversary",            phone:"+44 7800 123 456" },
    { name:"Office Lunch",     guests:12,date:"Fri 12:30pm",    status:"pending",   note:"Needs large table",      phone:"+44 7711 999 888" },
  ];
  const perPage = 5;
  const totalPages = Math.ceil(reservations.length / perPage);
  const paginated = reservations.slice((page-1)*perPage, page*perPage);
  return (
    <>
      <TopBar title={<>Reservations</>} subtitle="Bookings taken by Aria via phone">
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>+ Add booking</button>
      </TopBar>

      <div className="kpi-row">
        {[{l:"Today's covers",v:"22",d:"2 tables remaining"},{l:"This week",v:"87",d:"\u2191 14 vs last week"},{l:"Avg. party size",v:"4.2",d:"Stable"},{l:"No-show rate",v:"4%",d:"\u2193 2% this month"}].map(k=>(
          <div className="kpi-card" key={k.l}><div className="kpi-label">{k.l}</div><div className="kpi-value">{k.v}</div><div className="kpi-delta">{k.d}</div></div>
        ))}
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div className="card-head" style={{marginBottom:0}}>Upcoming bookings</div>
          <div style={{display:"flex",gap:6}}>
            {["List","Calendar"].map(v=>(
              <button key={v} onClick={()=>{setView(v);setPage(1)}} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${view===v?T.p500:T.line}`,background:view===v?T.p50:"transparent",color:view===v?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{v}</button>
            ))}
          </div>
        </div>

        {isMobile ? (
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
function PageMyAgent() {
  const [tab, setTab] = useState("Overview");
  return (
    <>
      <TopBar title={<>My <strong>Agent</strong></>} subtitle="Configure and monitor Aria, your AI phone agent" />

      <div className="resp-grid-3">
        {[{ic:"📞",l:"Calls answered today",v:"13"},{ic:"⏱️",l:"Avg. handle time",v:"1:18"},{ic:"✅",l:"Successful outcomes",v:"92%"}].map(k=>(
          <div className="kpi-card" key={k.l} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{k.ic}</div>
            <div><div className="kpi-label" style={{marginBottom:4}}>{k.l}</div><div className="kpi-value" style={{fontSize:26}}>{k.v}</div></div>
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
                  <div><div className="agent-name" style={{fontSize:16}}>Aria</div><div className="agent-status"><div className="agent-status-dot"/>Active · answering calls right now</div></div>
                  <button className="agent-edit-btn">Edit agent</button>
                </div>
                <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[["🎙️","Voice","Aria · Warm"],["🌍","Language","English"],["🔀","Call rules","Transfer"],["🔌","POS","Toast"],["⏰","Hours","11am–11pm"],["📋","Menu","Synced today"]].map(([ic,l,v])=>(
                    <div key={l} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:T.soft,marginBottom:4,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>{ic} {l}</div>
                      <div style={{fontSize:13.5,fontWeight:600,color:T.ink}}>{v}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab==="Performance" && (
              <div>
                {[["Answer rate","98%",98],["Orders completed","84%",84],["Customer satisfaction","4.8/5",96],["Avg. call resolution","92%",92]].map(([l,v,pct])=>(
                  <div key={l} style={{marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13.5,fontWeight:600,color:T.ink}}>{l}</span>
                      <span style={{fontSize:13.5,fontWeight:700,color:T.p600}}>{v}</span>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`}}/></div>
                  </div>
                ))}
              </div>
            )}

            {tab==="Transcripts" && (
              <div>
                {[{time:"2:14pm",dur:"1:42",outcome:"Order placed"},{time:"1:58pm",dur:"0:38",outcome:"Menu enquiry"},{time:"11:30am",dur:"2:05",outcome:"Order placed"}].map((t,i)=>(
                  <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${T.paper}`,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:T.ink}}>Call at {t.time}</span>
                      <span className="badge badge-purple">{t.outcome}</span>
                    </div>
                    <div style={{fontSize:12,color:T.soft,background:T.paper,borderRadius:10,padding:"10px 12px",fontWeight: "700"}}>
                      "Thanks for calling Tony's! Would you like to place an order for delivery or collection today?…"
                    </div>
                    <div style={{fontSize:11.5,color:T.soft,marginTop:6}}>Duration: {t.dur} · <span style={{color:T.p500,cursor:"pointer"}}>View full transcript →</span></div>
                  </div>
                ))}
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
                <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>Aria</div><div style={{fontSize:11,color:T.soft}}>AI agent preview</div></div>
                <div className="live-badge" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"3px 9px",fontSize:10,fontWeight:700,color:T.green}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>LIVE</div>
              </div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:12,padding:"10px 13px",fontSize:12.5,color:T.ink2,lineHeight:1.55}}>
                <span style={{fontSize:10,fontWeight:700,display:"block",marginBottom:4,color:T.p500}}>ARIA</span>
                "Thanks for calling Tony's Pizzeria! I'm Aria, your AI assistant. Would you like to place an order, check our hours, or something else?"
              </div>
              <div className="waveform" style={{justifyContent:"center",marginTop:8}}>
                {Array.from({length:14},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.07}s`}}/>)}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">Quick settings</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:14}}>
              {[["Accept orders","Allow Aria to take phone orders",true],["Take reservations","Allow booking via phone",true],["Answer after hours","Handle calls outside business hours",true]].map(([title,desc,on])=>(
                <div key={title} style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{title}</h4>
                    <label className="toggle"><input type="checkbox" defaultChecked={on}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                  </div>
                  <p style={{margin:0,fontSize:12,color:T.soft,lineHeight:1.4}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 6 — VOICE & SCRIPT
═══════════════════════════════════════════ */
function PageVoiceScript() {
  const [voice, setVoice] = useState(0);
  const [greeting, setGreeting] = useState("Thanks for calling Tony's Pizzeria! I'm Aria, your AI assistant. Would you like to place an order, check our hours, or something else?");
  const [closing, setClosing] = useState("Thanks so much for calling Tony's! Your order will be with you shortly. Have a wonderful evening!");
  const voices = [{n:"Aria",d:"Warm & professional",lang:"EN-GB"},{n:"Leo",d:"Friendly & upbeat",lang:"EN-GB"},{n:"Nova",d:"Calm & precise",lang:"EN-US"},{n:"Finn",d:"Casual & relaxed",lang:"EN-AU"}];
  return (
    <>
      <TopBar title={<>Voice <strong>&</strong> Script</>} subtitle="Customise how Aria sounds and what she says">
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>Save changes</button>
      </TopBar>

      <div className="resp-grid-dashboard-hub">
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Choose a voice</div>
            <div className="resp-grid-2">
              {voices.map((v,i)=>(
                <div key={v.n} className={`voice-card ${voice===i?"selected":""}`} onClick={()=>setVoice(i)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:15,fontWeight:600,color:T.ink,marginBottom:3}}>{v.n}</div><div style={{fontSize:12,color:T.soft}}>{v.d}</div></div>
                    <span className="badge badge-purple">{v.lang}</span>
                  </div>
                  <div className="voice-play">▶</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{marginBottom:16}}>
            <div className="card-head">Agent identity & script</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* Name your agent */}
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:4,letterSpacing:".3px",textTransform:"uppercase"}}>Name your agent</label>
                <p style={{fontSize:12,color:T.soft,lineHeight:1.4,margin:"0 0 10px 0"}}>This is the name customers will hear when Aria introduces herself.</p>
                <input defaultValue="Aria" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
              </div>
              {/* Opening greeting */}
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:4,letterSpacing:".3px",textTransform:"uppercase"}}>Opening greeting</label>
                <p style={{fontSize:11.5,color:T.soft,lineHeight:1.4,margin:"0 0 10px 0"}}>💡 Keep under 20 seconds of speech for the best experience</p>
                <textarea rows={3} value={greeting} onChange={e=>setGreeting(e.target.value)} style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",resize:"none",lineHeight:1.6,transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">Call handling rules</div>
            <p style={{fontSize:12,color:T.soft,margin:"-8px 0 16px 0"}}>When Aria can't help…</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"stretch"}}>
              {/* Transfer to number - select */}
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Transfer to number</label>
                <select style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}><option>Transfer to number</option><option>Take a voicemail</option><option>Call back later</option></select>
              </div>
              {/* Transfer to number - input */}
              <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Transfer to number</label>
                <input defaultValue="+44 161 234 5678" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
              </div>
            </div>
            {/* Offer to take a message */}
            <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
              <div>
                <h4 style={{margin:0,fontSize:13.5,fontWeight:600,color:T.ink}}>Offer to take a message</h4>
                <p style={{margin:"2px 0 0",fontSize:12,color:T.soft}}>Before transferring, offer to take a message</p>
              </div>
              <label className="toggle"><input type="checkbox" defaultChecked/><div className="toggle-track"/><div className="toggle-thumb"/></label>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{marginBottom:16,position:"sticky",top:20}}>
            <div className="card-head">Live preview</div>
            <div style={{background:T.paper,borderRadius:14,padding:16,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
                <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{voices[voice].n}</div><div style={{fontSize:11,color:T.soft}}>{voices[voice].d}</div></div>
              </div>
              <div style={{background:T.p50,border:`1px solid ${T.p100}`,borderRadius:12,padding:"10px 13px",fontSize:12.5,color:T.ink2,lineHeight:1.55,fontWeight: "700"}}>"{greeting}"</div>
              <div className="waveform" style={{justifyContent:"center",marginTop:10}}>
                {Array.from({length:14},(_,i)=><div key={i} className="wave-bar" style={{animationDelay:`${i*.07}s`}}/>)}
              </div>
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",marginTop:4}}>▶ Play preview</button>
            </div>
            <div style={{background:T.amberBg,border:`1.5px solid ${T.amberBd}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:4}}>📝 Script tip</div>
              <div style={{fontSize:12,color:T.mid,lineHeight:1.55}}>Keep your greeting warm and concise. Customers respond best to greetings under 15 seconds.</div>
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
function PageMenu() {
  const [activeCategory, setActiveCategory] = useState("Pizzas");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<=768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  const categories = ["Pizzas","Pasta","Sides","Desserts","Drinks"];
  const items = {
    Pizzas: [
      {name:"Margherita",price:"£12.50",desc:"Tomato, mozzarella, fresh basil",status:"active"},
      {name:"Pepperoni",price:"£14.50",desc:"Tomato, mozzarella, pepperoni",status:"active"},
      {name:"Quattro Formaggi",price:"£15.00",desc:"Four cheese blend, truffle oil",status:"active"},
      {name:"Calzone",price:"£14.00",desc:"Folded pizza, ricotta, ham",status:"active"},
      {name:"Vegan Garden",price:"£13.50",desc:"Roasted vegetables, vegan cheese",status:"active"},
    ],
    Pasta: [
      {name:"Spaghetti Carbonara",price:"£13.00",desc:"Pancetta, egg, parmesan",status:"active"},
      {name:"Penne Arrabiata",price:"£11.50",desc:"Spicy tomato, garlic",status:"active"},
    ],
    Sides: [
      {name:"Garlic Bread",price:"£4.50",desc:"Toasted with garlic butter",status:"active"},
      {name:"Mixed Salad",price:"£5.00",desc:"Seasonal greens",status:"active"},
    ],
    Desserts: [{name:"Tiramisu",price:"£6.50",desc:"Classic Italian",status:"active"}],
    Drinks: [{name:"Soft drinks",price:"£2.50",desc:"Coke, Fanta, Sprite",status:"active"}],
  };
  return (
    <>
      <TopBar title={<>Menu <strong>Manager</strong></>} subtitle="Items Aria knows and can take orders for">
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Import from URL</button>
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>+ Add item</button>
      </TopBar>

      {isMobile && (
        <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setActiveCategory(c)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${activeCategory===c?T.p500:T.line}`,background:activeCategory===c?T.p50:"transparent",color:activeCategory===c?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{c} <span style={{fontSize:11,color:activeCategory===c?T.p400:T.faint}}>({(items[c]||[]).length})</span></button>
          ))}
        </div>
      )}

      <div className="resp-grid-sidebar-left">
        {!isMobile && (
          <div className="card" style={{padding:16,height:"fit-content"}}>
            <div style={{fontSize:11,fontWeight:700,color:T.soft,textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Categories</div>
            {categories.map(c=>(
              <div key={c} onClick={()=>setActiveCategory(c)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:activeCategory===c?T.p700:T.mid,background:activeCategory===c?T.p50:"transparent",border:`1.5px solid ${activeCategory===c?T.p100:"transparent"}`,marginBottom:2,transition:"all .18s"}}>
                {c} <span style={{fontSize:11,color:activeCategory===c?T.p400:T.faint,float:"right"}}>{(items[c]||[]).length}</span>
              </div>
            ))}
            <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.line}`}}>
              <div style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:T.mid,border:`1.5px dashed ${T.line}`,textAlign:"center"}}>+ Add category</div>
            </div>
          </div>
        )}

        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
            <div className="card-head" style={{marginBottom:0}}>{activeCategory}</div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{fontSize:12,color:T.soft}}>{(items[activeCategory]||[]).length} items</div>
              <button className="btn-secondary" style={{fontSize:12,padding:"6px 14px"}}>Sync POS</button>
            </div>
          </div>
          {isMobile ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(items[activeCategory]||[]).map((item,i)=>(
                <div key={i} style={{background:T.paper,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🍕</div>
                      <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</div>
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:T.p600}}>{item.price}</div>
                  </div>
                  <div style={{fontSize:12,color:T.soft,marginBottom:10,paddingLeft:46}}>{item.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${T.line}`}}>
                    <span className="badge badge-green">Active</span>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}}>Edit</button>
                      <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {(items[activeCategory]||[]).map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${T.paper}`}}>
                  <div style={{width:42,height:42,borderRadius:12,background:T.p50,border:`1.5px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🍕</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:T.ink}}>{item.name}</div><div style={{fontSize:12,color:T.soft,marginTop:2}}>{item.desc}</div></div>
                  <div style={{fontSize:15,fontWeight:700,color:T.p600,minWidth:60,textAlign:"right"}}>{item.price}</div>
                  <span className="badge badge-green">Active</span>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-secondary" style={{fontSize:12,padding:"5px 12px"}}>Edit</button>
                    <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}}>Remove</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 8 — INTEGRATIONS
═══════════════════════════════════════════ */
function PageIntegrations() {
  const integrations = [
    {logo:"🍞",name:"Toast POS",desc:"Sync orders directly to your Toast system in real-time",status:"connected",category:"POS"},
    {logo:"🔷",name:"Clover",desc:"Full order and inventory sync with Clover",status:"available",category:"POS"},
    {logo:"🟦",name:"Square",desc:"Connect your Square account for seamless order flow",status:"available",category:"POS"},
    {logo:"📅",name:"OpenTable",desc:"Two-way reservation sync with OpenTable",status:"connected",category:"Reservations"},
    {logo:"🗓️",name:"Resy",desc:"Real-time reservation management via Resy",status:"available",category:"Reservations"},
    {logo:"📊",name:"Google Analytics",desc:"Track call conversion and customer behaviour",status:"available",category:"Analytics"},
    {logo:"💬",name:"Slack",desc:"Get notified in Slack for orders, calls, and alerts",status:"connected",category:"Notifications"},
    {logo:"📱",name:"Twilio",desc:"Advanced phone number management and call routing",status:"connected",category:"Phone"},
  ];
  const categories = ["All",...[...new Set(integrations.map(i=>i.category))]];
  const [cat, setCat] = useState("All");
  const filtered = cat==="All"?integrations:integrations.filter(i=>i.category===cat);
  return (
    <>
      <TopBar title={<>Integrations</>} subtitle="Connect Talkativ to the tools you already use">
        <button className="btn-secondary" style={{fontSize:13,padding:"8px 18px"}}>Request integration</button>
      </TopBar>

      <div style={{display:"flex",gap:6,marginBottom:22}}>
        {categories.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:"7px 16px",borderRadius:50,border:`1.5px solid ${cat===c?T.p500:T.line}`,background:cat===c?T.p50:"transparent",color:cat===c?T.p700:T.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{c}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:20}}>
        {filtered.map((int,i)=>(
          <div key={i} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:16,padding:24,display:"flex",flexDirection:"column",transition:"all .2s",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 8px 24px rgba(112,53,245,.08)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div style={{width:52,height:52,borderRadius:14,background:T.paper,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{int.logo}</div>
              <span className="badge badge-purple" style={{fontSize:10,fontWeight:700}}>{int.category}</span>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:6}}>{int.name}</div>
            <div style={{fontSize:13,color:T.soft,lineHeight:1.5,flex:1}}>{int.desc}</div>
            <div style={{marginTop:24,paddingTop:16,borderTop:`1px solid ${T.paper}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              {int.status==="connected"
                ? <><span className="badge badge-green" style={{padding:"5px 10px"}}>✓ Connected</span><button className="btn-danger" style={{fontSize:12,padding:"6px 14px"}}>Disconnect</button></>
                : <><div/><button className="btn-primary" style={{fontSize:12,padding:"6px 16px"}}>Connect</button></>
              }
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   PAGE 9 — BILLING
═══════════════════════════════════════════ */
function PageBilling() {
  const invoices = [
    {date:"1 Mar 2026",desc:"Growth plan · March 2026",amount:"£399.00",status:"paid"},
    {date:"1 Feb 2026",desc:"Growth plan · February 2026",amount:"£399.00",status:"paid"},
    {date:"1 Jan 2026",desc:"Growth plan · January 2026",amount:"£399.00",status:"paid"},
    {date:"1 Dec 2025",desc:"Growth plan · December 2025",amount:"£399.00",status:"paid"},
    {date:"1 Nov 2025",desc:"Starter plan · November 2025",amount:"£199.00",status:"paid"},
  ];
  return (
    <>
      <TopBar title={<>Billing</>} subtitle="Manage your subscription and payment details" />

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
function PageSettings() {
  const [section, setSection] = useState("Business");
  const [showPw, setShowPw] = useState({current:false,new_:false,confirm:false});
  const sections = ["Business","Notifications","Phone","Team","Security"];
  return (
    <>
      <TopBar title={<>Settings</>} subtitle="Manage your account and business preferences">
        <button className="btn-primary" style={{fontSize:13,padding:"9px 20px"}}>Save changes</button>
      </TopBar>

      <div className="resp-grid-sidebar-left">
        <div className="card" style={{padding:16,height:"fit-content"}}>
          {sections.map(s=>(
            <div key={s} onClick={()=>setSection(s)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",fontSize:13.5,fontWeight:500,color:section===s?T.p700:T.mid,background:section===s?T.p50:"transparent",border:`1.5px solid ${section===s?T.p100:"transparent"}`,marginBottom:2,transition:"all .18s"}}>{s}</div>
          ))}
        </div>

        <div>
          {section==="Business" && (
            <div className="card">
              <div className="card-head">Business details</div>
              
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Business name</label>
                  <input defaultValue="Tony's Pizzeria" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Business type</label>
                  <select style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}><option>Pizza Restaurant</option><option>Café</option><option>Bar & Restaurant</option></select>
                </div>
                <div style={{gridColumn:"1 / -1",background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Address</label>
                  <input defaultValue="14 High Street, Manchester M1 1AE" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Phone number</label>
                  <input defaultValue="+44 161 234 5678" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Email</label>
                  <input defaultValue="info@tonys-pizzeria.com" type="email" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}/>
                </div>
              </div>
              <div style={{marginTop:16,paddingTop:20,borderTop:`1px solid ${T.line}`}}>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:16}}>Opening hours</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:12}}>
                  {["Monday–Thursday","Friday–Saturday","Sunday"].map((day,i)=>(
                    <div key={day} style={{background:T.paper,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.ink,minWidth:130}}>{day}</div>
                      <input className="fi" defaultValue={i===1?"11:00am":"12:00pm"} style={{width:80,padding:"8px 10px",backgroundColor:T.white,color:T.ink,textAlign:"center",fontSize:12}}/>
                      <span style={{color:T.soft,fontSize:13}}>to</span>
                      <input className="fi" defaultValue={i===0?"10:00pm":i===1?"11:30pm":"9:00pm"} style={{width:80,padding:"8px 10px",backgroundColor:T.white,color:T.ink,textAlign:"center",fontSize:12}}/>
                      <label className="toggle" style={{marginLeft:"auto"}}><input type="checkbox" defaultChecked/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section==="Notifications" && (
            <div>
              <div style={{fontSize:17,fontWeight:700,color:T.ink,marginBottom:16}}>Notification preferences</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
                {[["📞","New order via call","Get notified when Aria takes a phone order",true],["📅","New reservation","Alert when a table is booked",true],["📱","Missed call","Get notified when a call is missed",true],["📊","Weekly report","Summary of calls and orders every Monday",false],["⚠️","Agent offline","Alert if Aria stops responding",true],["💳","Payment processed","Confirmation for each charge",false]].map(([ic,h,d,on])=>(
                  <div key={h} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 6px 20px rgba(112,53,245,.06)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{width:42,height:42,borderRadius:12,background:T.p50,border:`1px solid ${T.p100}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ic}</div>
                      <label className="toggle"><input type="checkbox" defaultChecked={on}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
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
              <div className="card-head">Phone number settings</div>
              <div className="info-block" style={{marginBottom:20,marginTop:0}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:28}}>📞</div>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:T.p600}}>+44 161 792 4831</div>
                    <div style={{fontSize:12,color:T.soft,marginTop:3}}>Your Talkativ number · Manchester area code</div>
                  </div>
                  <span className="badge badge-green" style={{marginLeft:"auto"}}>Active</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20,alignItems:"stretch"}}>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Forward to (backup number)</label>
                  <input defaultValue="+44 161 234 5678" style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Rings before Aria answers</label>
                  <select style={{width:"100%",padding:"13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}><option>Immediately</option><option>After 2 rings</option><option>After 3 rings</option></select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Call recording","Record all calls for quality assurance",true],["Voicemail fallback","If transfer fails, offer voicemail",true]].map(([title,desc,on])=>(
                  <div key={title} style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>{title}</h4>
                      <label className="toggle"><input type="checkbox" defaultChecked={on}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
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
                <button className="btn-primary" style={{fontSize:13,padding:"8px 18px"}}>+ Invite member</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:16}}>
                {[{name:"Tony Chen",email:"tony@tonys-pizzeria.com",role:"Owner",av:"TC"},{name:"Maria Lopez",email:"maria@tonys-pizzeria.com",role:"Manager",av:"ML"},{name:"Jake Smith",email:"jake@tonys-pizzeria.com",role:"Staff",av:"JS"}].map((m,i)=>(
                  <div key={i} style={{background:T.white,border:`1.5px solid ${T.line}`,borderRadius:14,padding:20,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.p300;e.currentTarget.style.boxShadow=`0 6px 20px rgba(112,53,245,.06)`}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.line;e.currentTarget.style.boxShadow="none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${T.p400},${T.p700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{m.av}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{m.name}</div>
                        <div style={{fontSize:12,color:T.soft,marginTop:2}}>{m.email}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.paper}`,paddingTop:14}}>
                      <span className="badge badge-purple">{m.role}</span>
                      {m.role!=="Owner"&&<button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}}>Remove</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section==="Security" && (
            <div className="card">
              <div className="card-head">Security settings</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,alignItems:"stretch"}}>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Current password</label>
                  <div style={{position:"relative",flex:1,display:"flex"}}>
                    <input type={showPw.current?"text":"password"} placeholder="Enter current password" style={{width:"100%",padding:"13px 48px 13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
                    <button onClick={()=>setShowPw(p=>({...p,current:!p.current}))} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center"}}>{showPw.current?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}</button>
                  </div>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>New password</label>
                  <div style={{position:"relative",flex:1,display:"flex"}}>
                    <input type={showPw.new_?"text":"password"} placeholder="At least 8 characters" style={{width:"100%",padding:"13px 48px 13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
                    <button onClick={()=>setShowPw(p=>({...p,new_:!p.new_}))} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center"}}>{showPw.new_?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}</button>
                  </div>
                </div>
                <div style={{background:T.paper,borderRadius:14,padding:"18px 20px",border:`1.5px solid ${T.line}`,display:"flex",flexDirection:"column"}}>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.mid,marginBottom:8,letterSpacing:".3px",textTransform:"uppercase"}}>Confirm new password</label>
                  <div style={{position:"relative",flex:1,display:"flex"}}>
                    <input type={showPw.confirm?"text":"password"} placeholder="Repeat new password" style={{width:"100%",padding:"13px 48px 13px 18px",border:`1.5px solid ${T.line}`,borderRadius:12,background:T.white,color:T.ink,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)",flex:1}}/>
                    <button onClick={()=>setShowPw(p=>({...p,confirm:!p.confirm}))} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center"}}>{showPw.confirm?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.soft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}</button>
                  </div>
                </div>
              </div>
              <div style={{paddingTop:20,borderTop:`1px solid ${T.line}`,marginTop:16}}>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:16}}>Two-factor authentication</div>
                <div style={{background:T.paper,borderRadius:12,padding:"16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <h4 style={{margin:0,fontSize:13,fontWeight:700,color:T.ink}}>Enable 2FA</h4>
                    <p style={{margin:0,fontSize:12,color:T.soft,marginTop:4}}>Require a code when logging in from a new device</p>
                  </div>
                  <label className="toggle"><input type="checkbox"/><div className="toggle-track"/><div className="toggle-thumb"/></label>
                </div>
              </div>
              <div style={{paddingTop:20,borderTop:`1px solid ${T.line}`,marginTop:16}}>
                <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>Active sessions</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:12}}>
                  {[["Chrome · MacBook Pro","Manchester, UK · Active now"],["Safari · iPhone 15","Manchester, UK · 2h ago"]].map(([device,loc])=>(
                    <div key={device} style={{background:T.paper,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{device}</div><div style={{fontSize:11.5,color:T.soft,marginTop:2}}>{loc}</div></div>
                      <button className="btn-danger" style={{fontSize:12,padding:"5px 12px"}}>Revoke</button>
                    </div>
                  ))}
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


function DashboardApp({ onBack }) {
  const [active, setActive] = useState("Dashboard");
  const PageComponent = PAGE_MAP[active] || PageDashboard;
  return (
    <div className="dash-wrap">
      <Sidebar active={active} onNav={(p) => { setActive(p); document.body.classList.remove('mob-nav-open'); window.scrollTo(0,0); }} />
      <main className="dash-main" key={active}>
        <div className="dash-overlay" onClick={() => document.body.classList.remove('mob-nav-open')} />
        <PageComponent />
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);

  const go = s => { document.body.classList.remove('mob-nav-open'); setScreen(s); window.scrollTo(0, 0); };

  const nextOb = () => { if (step < 7) { setStep(step + 1); go(`ob${step + 1}`); } else go("success"); };
  const backOb = () => { if (step > 0) { setStep(step - 1); go(`ob${step - 1}`); } else go("landing"); };

  const renderScreen = () => {
    if (screen === "landing")   return <Landing onCTA={() => { setStep(0); go("ob0"); }} />;
    if (screen === "ob0")       return <Step0 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob1")       return <Step1 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob2")       return <Step2 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob3")       return <Step3 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob4")       return <Step4 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob5")       return <Step5 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob6")       return <Step6 onNext={nextOb} onBack={backOb} />;
    if (screen === "ob7")       return <Step7 onNext={() => go("success")} onBack={backOb} />;
    if (screen === "success")   return <SuccessScreen onDashboard={() => go("dashboard")} />;
    if (screen === "dashboard") return <DashboardApp onBack={() => go("landing")} />;
  };

  return (
    <>
      <style>{G}</style>
      {renderScreen()}
    </>
  );
}
