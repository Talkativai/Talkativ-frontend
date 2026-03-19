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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');

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
  font-family: 'Inter', sans-serif;
  font-size: 64px;
  font-weight: 700; line-height: 1.1;
  letter-spacing: -2px; color: oklch(0.21 0.034 264.665);
  margin-bottom: 22px;
}
.hero-h1 em { 
  font-style: italic; 
  color: ${T.p600}; 
}
.hero-sub {
  font-family: 'Inter', sans-serif;
  font-size: 20px; color: oklch(0.446 0.03 256.802); line-height: 1.6;
  max-width: 480px; margin-bottom: 40px; font-weight: 600;
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
  font-family: 'Inter', sans-serif;
  font-size: 48px; font-weight: 700; line-height: 1.2;
  letter-spacing: -1.5px; color: oklch(0.21 0.034 264.665);
  margin-bottom: 12px;
}
.section-h2 em { font-style: italic; color: ${T.p600}; }
.section-sub { font-family: 'Inter', sans-serif; font-size: 16px; color: oklch(0.446 0.03 256.802); max-width: 480px; line-height: 1.6; font-weight: 400; }
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
  font-family: 'Inter', sans-serif;
  font-size: 20px; font-weight: 600; color: oklch(0.21 0.034 264.665);
  margin-bottom: 10px; letter-spacing: -.3px;
}
.feat-card p { font-family: 'Inter', sans-serif; font-size: 16px; color: oklch(0.446 0.03 256.802); line-height: 1.6; font-weight: 400; }

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
.ob-heading em { font-style: italic; color: ${T.p600}; }
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
`;

/* ═══════════════════════════════════════════
   STEP DEFINITIONS
═══════════════════════════════════════════ */
const STEPS = [
  { name: "Create account",   time: "~1 min" },
  { name: "Business & Menu",  time: "~4 min" },
  { name: "AI voice & script",time: "~4 min" },
  { name: "Go live",          time: "~2 min" },
  { name: "Choose plan",      time: "~2 min" },
];

/* ═══════════════════════════════════════════
   SHARED ONBOARDING SHELL
═══════════════════════════════════════════ */
function ObShell({ step, children, onNext, onBack, nextLabel = "Continue →" }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div className="ob-wrap">
      <style>{G}</style>
      <aside className="ob-sidebar">
        <div className="ob-sidebar-logo">
          <div className="ob-sidebar-logo-mark">t</div>
          talkativ
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
        <div>
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="ob-progress-label">Step {step + 1} of {STEPS.length} · {STEPS[step].time} remaining</div>
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
          <button className="btn-ghost" onClick={onCTA}>Log in</button>
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
              Start free
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </button>
            <button className="btn-hero-outline" onClick={onCTA}>
              ▷ Hear a demo call
            </button>
          </div>
          <div className="hero-trust">
            {/* Avatars removed as requested */}
            <div style={{ height: 30 }} />
            <span>Loved by 2,400+ restaurant owners</span>
          </div>
        </div>

        {/* RIGHT — floating bento */}
        <div className="hero-right">
          <div className="bento-main">
            <div className="call-header">
              <div className="call-avatar">T</div>
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
              { label: "Live in 20 min", sub: "Self-serve setup" },
              { label: "POS connected", sub: "Toast · Clover · Square" },
              { label: "24/7 coverage", sub: "Zero missed calls" },
              { label: "Live dashboard", sub: "Every call tracked" },
            ].map(({ label, sub }) => (
              <div key={label} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 16px rgba(134,87,255,.06)`, transition: "all .22s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = T.p300; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = T.line; }}>
                {/* Icon removed */}
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
              { span: 4, title: "Sounds like you", body: "Custom voice, agent name, and brand tone. Your customers won't know it's AI." },
              { span: 4, title: "Knows your menu", body: "Import via URL, PDF, or POS. Orders go directly to your kitchen system." },
              { span: 4, title: "Always on", body: "Every call answered — even at 2am, during peak rush, on bank holidays." },
              { span: 6, title: "Deep POS integrations", body: "Toast, Clover, Square, OpenTable, Aloha and 8 more. One-click setup, real-time sync." },
              { span: 3, title: "Live in 20 min", body: "No sales calls. No IT team. Self-serve and ready in under 20 minutes." },
              { span: 3, title: "Live analytics", body: "Every call, order and transcript in one beautiful dashboard." },
            ].map(({ span, title, body }) => (
              <div key={title} className="feat-card" style={{ gridColumn: `span ${span}` }}>
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
  return (
    <ObShell step={0} onNext={onNext} onBack={onBack} nextLabel="Create account →">
      <div className="ob-step-label">Step 1 · Account</div>
      <h1 className="ob-heading">Create your<br />account</h1>
      <p className="ob-subheading">No credit card required. 14-day free trial on all plans — cancel any time.</p>
      <div className="sso-row">
        <button className="sso-btn">Continue with Google</button>
      </div>
      <div className="divider-row"><div className="divider-line" /><span className="divider-text">or continue with email</span><div className="divider-line" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">First name</label><input className="form-input" placeholder="Maria" /></div>
        <div className="form-group"><label className="form-label">Last name</label><input className="form-input" placeholder="Chen" /></div>
      </div>
      <div className="form-group"><label className="form-label">Email address</label><input className="form-input" placeholder="maria@restaurant.com" type="email" /></div>
      <div className="form-group">
        <label className="form-label">Mobile number</label>
        <input className="form-input" placeholder="+44 7700 000 000" value={ph} onChange={e => setPh(e.target.value)} />
      </div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" placeholder="At least 8 characters" type="password" /></div>
      <p style={{ fontSize: 12.5, color: T.soft, marginTop: 6 }}>By continuing you agree to our <span style={{ color: T.p600, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: T.p600, cursor: "pointer" }}>Privacy Policy</span>.</p>
    </ObShell>
  );
}

function Step2({ onNext, onBack }) {
  const [sel, setSel] = useState(0);
  const [imported, setImported] = useState(false);
  const opts = [
    { title: "Import from URL", desc: "Paste your website or online menu link", badge: "Fastest" },
    { title: "Upload a PDF", desc: "Drag and drop your printed menu" },
    { title: "Connect your POS", desc: "Toast, Clover, Square and 8 more", badge: "Recommended" },
  ];

  return (
    <ObShell step={1} onNext={onNext} onBack={onBack} nextLabel="Looks good →">
      <div className="ob-step-label">Step 2 · Business & Menu</div>
      <h1 className="ob-heading">Set up your business<br />and menu</h1>
      <p className="ob-subheading">We'll pull your address from Google, and automatically parse your menu to train your AI agent.</p>
      
      <div className="form-group" style={{ marginTop: 24 }}>
        <label className="form-label">Business name</label>
        <div style={{ position: "relative" }}>
          <input className="form-input" defaultValue="Tony's Pizzeria" style={{ paddingRight: 80 }} />
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: T.p600, color: "white", borderRadius: 8, padding: "6px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</div>
        </div>
      </div>

      <div style={{ marginTop: 40, marginBottom: 16, fontSize: 14, fontWeight: 700, color: T.ink }}>How should we import your Menu?</div>
      <div className="import-list">
        {opts.map((o, i) => (
          <div key={o.title} className={`import-item ${sel === i ? "selected" : ""}`} onClick={() => { setSel(i); setImported(false); }}>
            <div className="import-item-info"><h4>{o.title}</h4><p>{o.desc}</p></div>
            {o.badge && <div className="import-badge">{o.badge}</div>}
            <div className="radio-dot" style={{ borderColor: sel === i ? T.p500 : T.faint, background: sel === i ? T.p500 : "transparent" }}>
              {sel === i && <div className="radio-inner" />}
            </div>
          </div>
        ))}
      </div>

      {sel === 0 && (
        <div style={{ marginTop: 18 }}>
          <label className="form-label">Menu URL</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <input className="form-input" placeholder="https://tonys-pizzeria.com/menu" style={{ flex: 1 }} />
            <button onClick={() => setImported(true)} style={{ background: T.ink, color: 'white', border: 'none', borderRadius: 8, padding: '0 24px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Import</button>
          </div>
        </div>
      )}

      {sel === 1 && !imported && (
        <div style={{ marginTop: 18, border: `2px dashed ${T.borderM || T.faint}`, borderRadius: 16, padding: 36, textAlign: "center", cursor: "pointer", background: T.paper }} onClick={() => setImported(true)}>
          <div style={{ fontWeight: 600, color: T.ink, fontSize: 14 }}>Drop your PDF here</div>
          <div style={{ fontSize: 13, color: T.soft, marginTop: 5 }}>or click to browse files</div>
        </div>
      )}

      {sel === 1 && imported && (
        <div style={{ marginTop: 18, border: `1.5px solid ${T.greenBd}`, background: T.greenBg, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setImported(false)}>
          <div>
            <div style={{ fontWeight: 600, color: T.green, fontSize: 13.5 }}>menu_final_2026.pdf</div>
            <div style={{ fontSize: 11.5, color: T.green, opacity: 0.8, marginTop: 2 }}>2.4 MB · Uploaded successfully</div>
          </div>
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

      {(sel === 0 || sel === 1) && imported && (
        <div style={{ marginTop: 24, padding: 22, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, animation: 'fadeUp .4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>Information successfully extracted</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[["Menu", "142 items found"], ["Opening hours", "Mon-Sun schedule"], ["FAQ", "12 common questions"]].map(([title, desc]) => (
              <div key={title} style={{ background: T.ivory, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{title}</div>
                <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ObShell>
  );
}

function Step4({ onNext, onBack }) {
  const [vc, setVc] = useState(0);
  const [gender, setGender] = useState(0);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [greeting, setGreeting] = useState("Thanks for calling Tony's Pizzeria! I'm Aria, your AI assistant. Would you like to place an order, check our hours, or something else?");
  return (
    <ObShell step={2} onNext={onNext} onBack={onBack} nextLabel="Save & continue →">
      <div className="ob-step-label">Step 3 · Voice & script</div>
      <h1 className="ob-heading">Customise your<br />AI agent</h1>
      <p className="ob-subheading">Pick a voice and personalise your greeting. All fields are pre-filled — just change what you want.</p>

      <div className="form-group" style={{ marginBottom: 24 }}>
        <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Agent gender</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {["Female", "Male"].map((g, i) => (
            <div key={g} onClick={() => setGender(i)} style={{ flex: 1, textAlign: 'center', padding: '14px 0', border: `1.5px solid ${gender === i ? T.p500 : T.line}`, background: gender === i ? T.p50 : T.white, color: gender === i ? T.p700 : T.mid, fontSize: 13.5, fontWeight: 700, borderRadius: 12, cursor: 'pointer', transition: 'all .2s', boxShadow: gender === i ? `0 2px 12px rgba(112,53,245,.15)` : 'none' }}>
              {g}
            </div>
          ))}
        </div>
      </div>

      <label className="form-label" style={{ marginBottom: 12 }}>Choose a voice</label>
      <style>{`@keyframes miniWave { 0%, 100% { height: 25%; } 50% { height: 100%; } }`}</style>
      <div className="voice-grid">
        {[{ n: "Aria", d: "Warm & professional" }, { n: "Leo", d: "Friendly & upbeat" }, { n: "Nova", d: "Calm & precise" }, { n: "Finn", d: "Casual & relaxed" }].map((v, i) => (
          <div key={v.n} className={`voice-card ${vc === i ? "selected" : ""}`} onClick={() => setVc(i)}>
            <div>
              <div className="voice-name">{v.n}</div>
              <div className="voice-desc">{v.d}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 2.5, alignItems: 'center', height: 18, width: playingVoice === i ? 24 : 0, opacity: playingVoice === i ? 1 : 0, transition: 'all .25s ease-out' }}>
                {[...Array(5)].map((_, w) => (
                  <div key={w} style={{ width: 3, borderRadius: 2, background: vc === i ? T.p600 : T.mid, animation: playingVoice === i ? `miniWave .8s infinite ease-in-out ${w * 0.15}s` : 'none', height: playingVoice === i ? '100%' : '3px' }} />
                ))}
              </div>
              <div className="voice-play-btn" style={{ position: 'relative', right: 'auto', top: 'auto', margin: 0 }} onClick={(e) => { e.stopPropagation(); setPlayingVoice(playingVoice === i ? null : i); }}>
                {playingVoice === i ? "■" : "▶"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="form-group"><label className="form-label">Agent name</label><input className="form-input" defaultValue="Aria" /></div>
      <div className="form-group">
        <label className="form-label">Greeting message</label>
        <textarea className="form-input" rows={3} value={greeting} onChange={e => setGreeting(e.target.value)} />
        <div style={{ fontSize: 11.5, color: T.soft, marginTop: 6 }}>💡 Keep under 20 seconds of speech for the best experience</div>
      </div>
      <div className="form-group">
        <label className="form-label">When agent can't help, it should…</label>
        <select className="form-input"><option>Transfer to your phone number</option><option>Take a voicemail</option><option>Ask caller to call back later</option></select>
      </div>
    </ObShell>
  );
}

function Step5({ onNext, onBack }) {
  const [called, setCalled] = useState(false);
  return (
    <ObShell step={3} onNext={onNext} onBack={onBack} nextLabel={called ? "Choose a plan →" : "Skip for now →"}>
      <div className="ob-step-label">Step 4 · Go live</div>
      <h1 className="ob-heading">Your agent is<br />live</h1>
      <p className="ob-subheading">We've automatically assigned you a Talkativ number. Your agent is active and ready to take calls.</p>
      
      <div style={{ marginTop: 24, background: T.greenBg, border: `1.5px solid ${T.greenBd}`, borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.green, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</div>
        <div>
          <div style={{ fontSize: 13, color: T.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 3 }}>System Active</div>
          <div style={{ fontSize: 18, color: T.green, fontWeight: 800 }}>+44 161 792 4831</div>
        </div>
      </div>

      <div style={{ marginTop: 40, marginBottom: 16, fontSize: 14, fontWeight: 700, color: T.ink }}>Test call</div>
      <p style={{ fontSize: 13.5, color: T.mid, marginBottom: 16 }}>Call your Talkativ number and hear your fully configured AI agent answering as your business.</p>

      <div className="test-call-card">
        <div className="test-call-icon">{called ? "T" : "T"}</div>
        <h3>{called ? "Your agent sounds perfect!" : "Ready for a test run?"}</h3>
        {!called && (
          <button onClick={() => setCalled(true)} style={{ background: T.ink, color: "white", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 20px rgba(19,13,46,.2)", transition: "all .22s", position: "relative", zIndex: 1 }}>
            Call my number now
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
          {[["1 call", "Completed"], ["0:42", "Duration"], ["Order taken", "Outcome"]].map(([v, l]) => (
            <div key={l} style={{ flex: 1, background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: 18, textAlign: "center", boxShadow: `0 4px 16px rgba(134,87,255,.06)` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: T.p600 }}>{v}</div>
              <div style={{ fontSize: 11, color: T.soft, marginTop: 3, textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </ObShell>
  );
}

function Step6({ onNext, onBack }) {
  const [plan, setPlan] = useState(1);
  return (
    <ObShell step={4} onNext={onNext} onBack={onBack} nextLabel="Start free trial →">
      <div className="ob-step-label">Step 5 · Plan</div>
      <h1 className="ob-heading">Choose your<br />plan</h1>
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
        <div style={{ fontSize: 12, color: T.soft, display: "flex", alignItems: "center", gap: 6 }}>🔒 Secured by Stripe · You won't be charged until your 14-day trial ends</div>
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
      <h1 className="success-h1">You're live!</h1>
      <p className="success-sub">Aria is now answering calls for Tony's Pizzeria. Your first real customer call could come in any moment.</p>
      <div className="success-stats">
        {[["Live", "Agent status"], ["24/7", "Coverage"], ["Ready", "For orders"]].map(([v, l]) => (
          <div className="ss-card" key={l}>
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
   CALLS SCREEN
═══════════════════════════════════════════ */
function CallsScreen({ onBack, onNavigate }) {
  const [activeCall, setActiveCall] = useState(null);
  
  const callLogs = [
    { id: "1", n: "+1 (415) 555-0921", t: "14:20 · Today", txt: `"I'd like to change my reservation to tomorrow evening..."`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "2m 45s", ic: "✓" },
    { id: "2", n: "Private Number", t: "13:05 · Today", txt: `"Customer disconnected during agent transfer."`, s: "Escalated", sb: "#FECACA", sc: "#B91C1C", dur: "0m 12s", ic: "↷" },
    { id: "3", n: "+1 (212) 555-8844", t: "Yesterday 18:30", txt: `"How much is the special tonight?"`, s: "Enquiry", sb: "#D1FAE5", sc: "#065F46", dur: "1m 02s", ic: "✓" },
    { id: "4", n: "+1 (650) 555-1234", t: "Yesterday 12:15", txt: `"Order #122 contains a gluten-free pizza, right?"`, s: "Order Mod", sb: T.p100, sc: T.p700, dur: "4m 20s", ic: "✓" },
    { id: "5", n: "+44 7911 123456", t: "16 Mar 2026", txt: `"Can I book a table for 6 on Friday?"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "3m 15s", ic: "✓" },
    { id: "6", n: "+1 (310) 555-9876", t: "16 Mar 2026", txt: `"Do you have any vegan options on the menu?"`, s: "Enquiry", sb: "#D1FAE5", sc: "#065F46", dur: "1m 45s", ic: "✓" },
    { id: "7", n: "Unknown Caller", t: "15 Mar 2026", txt: `"Are you open on Easter Sunday?"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "0m 50s", ic: "✓" }
  ];

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "calls" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}` }}>
          <div>
            <div className="dash-date">Wednesday · 18 March 2026</div>
            <div className="dash-greeting">Good afternoon, Tony 👋</div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-live-badge"><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />Agent live</div>
            <button onClick={onBack} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, color: T.mid, cursor: "pointer", transition: "all .18s" }}>← Back to demo</button>
            <div className="dash-avatar" style={{ cursor: "pointer" }}>TC</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: activeCall ? "1.2fr 1fr" : "1fr", gap: 32, paddingBottom: 64, transition: "all 0.3s ease", alignItems: "start" }}>
            {/* Call History */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>Call history</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12.5, fontWeight: 600 }}>
                  <div style={{ color: T.p600, cursor: "pointer" }}>All</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Failed</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Escalated</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {callLogs.map((r) => {
                  const isActive = activeCall && activeCall.id === r.id;
                  return (
                    <div key={r.id} onClick={() => setActiveCall(isActive ? null : r)} style={{ background: isActive ? "white" : T.paper, border: `1.5px solid ${isActive ? T.p400 : "transparent"}`, borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: isActive ? "0 4px 16px rgba(134,87,255,0.12)" : "none", cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: isActive ? T.p50 : "white", border: `1.5px solid ${isActive ? T.p200 : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight:"bold", color: r.s==="Escalated"? "#B91C1C" : (isActive ? T.p600 : T.ink) }}>{r.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{r.n}</div>
                          <div style={{ fontSize: 12, color: T.soft, fontWeight: 600 }}>{r.t}</div>
                        </div>
                        <div style={{ fontSize: 13.5, color: T.mid, marginBottom: 12 }}>{r.txt}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: r.sb, color: r.sc, padding: "4px 8px", borderRadius: 4 }}>{r.s}</span>
                          <span style={{ fontSize: 11.5, color: T.soft, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 12 }}>🕒</span> {r.dur}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "0 8px" }}>
                <div style={{ fontSize: 13, color: T.soft, fontWeight: 500 }}>Showing 1-7 of 142 calls</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.soft, cursor: "not-allowed" }}>Previous</button>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer" }}>Next</button>
                </div>
              </div>
            </div>

            {/* Call Details */}
            {activeCall && (
              <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", position: "sticky", top: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Call Details</div>
                    <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600 }}>ID: #TALK-9921-{activeCall.id}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>Processed via VoiceCore™</div>
                    </div>
                    <button onClick={() => setActiveCall(null)} style={{ background: T.paper, border: `1px solid ${T.line}`, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: T.mid, fontWeight: "bold", padding: 0, marginTop: -4 }}>×</button>
                  </div>
                </div>

                {/* Transcript */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase" }}>Transcript</div>
                  <div style={{ fontSize: 14, color: T.mid, fontWeight: "bold", cursor: "pointer", transform:"rotate(-45deg)" }}>⚲</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40, maxHeight: 380, overflowY: "auto", paddingRight: 8 }}>
                  {/* AI */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, flexShrink: 0 }}>🤖</div>
                    <div style={{ background: T.p50, padding: "14px 18px", borderRadius: "0 18px 18px 18px", fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>
                      Hello! Welcome to Talkativ. How can I help you today?
                    </div>
                  </div>
                  {/* User */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "flex-end" }}>
                    <div style={{ background: T.paper, padding: "14px 18px", borderRadius: "18px 0 18px 18px", fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>
                      {activeCall.txt.replace(/"/g, '')}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.line, display: "flex", alignItems: "center", justifyContent: "center", color: T.mid, fontSize: 12, flexShrink: 0, fontWeight: "bold" }}>👤</div>
                  </div>
                  {/* AI */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, flexShrink: 0 }}>🤖</div>
                    <div style={{ background: T.p50, padding: "14px 18px", borderRadius: "0 18px 18px 18px", fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>
                      Of course. I see you've called from {activeCall.n}. Shall I pull up those details to confirm?
                    </div>
                  </div>
                  {/* User */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "flex-end" }}>
                    <div style={{ background: T.paper, padding: "14px 18px", borderRadius: "18px 0 18px 18px", fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>
                      Yes, please. That would be great.
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.line, display: "flex", alignItems: "center", justifyContent: "center", color: T.mid, fontSize: 12, flexShrink: 0, fontWeight: "bold" }}>👤</div>
                  </div>
                </div>

                {/* Special Requests */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Special Requests & Allergies</div>
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "12px 16px", borderRadius: "12px", fontSize: 13.5, color: "#991B1B", lineHeight: 1.6, fontWeight: 600 }}>
                     "Severe nut allergy. Celebrating 10th anniversary. Preferred seating near window if possible."
                  </div>
                </div>
                
                {/* AI Context */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", display:"flex", alignItems:"center", gap: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8 }}>✦</div>
                      Talkativ AI Context
                    </div>
                    <div style={{ fontSize: 12, color: T.p600, fontWeight: 700, cursor: "pointer", display:"flex", alignItems:"center", gap:4 }}>View Full Call Log <span style={{fontSize: 14}}>↗</span></div>
                  </div>
                  <div style={{ background: T.p50, border: `1px solid ${T.p100}`, padding: "16px", borderRadius: "16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.white, display: "flex", alignItems: "center", justifyContent: "center", color: T.p600, fontSize: 14, cursor:"pointer", border:`1px solid ${T.line}`, flexShrink: 0, boxShadow: "0 2px 8px rgba(134,87,255,0.15)", transform:"scaleX(1.1)" }}>▶</div>
                    <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.6, flex: 1, fontStyle: "italic", fontWeight: 500 }}>
                      "The caller mentioned they want a specific vintage wine if available. I confirmed our sommelier would be notified."
                    </div>
                  </div>
                </div>

                {/* Bottom intent panel */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Intent</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{activeCall.s}</div>
                  </div>
                  <div style={{ background: "#F6FBF9", borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Payment</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#059669" }}>Pre-auth Success</div>
                  </div>
                </div>

                <button style={{ width: "100%", background: T.p100, color: T.p700, border: "none", borderRadius: 30, padding: "16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24, transition: "background .2s" }}>
                  📅 View Booking #RSV-{activeCall.id}20
                </button>

                <div style={{ textAlign: "center", fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationColor: T.line }}>
                  Flag as Incorrect Intent
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function Dashboard({ onBack, onNavigate }) {
  const calls = [
    { s: "live", n: "Incoming call",   d: "Live now · +44 7811 234 567", o: "Taking order",    b: "order" },
    { s: "done", n: "Sarah Williams",  d: "Today 2:14pm · 1:42",          o: "Order — £34.50", b: "order" },
    { s: "done", n: "James Patel",     d: "Today 1:58pm · 0:38",          o: "Menu enquiry",   b: "info" },
    { s: "done", n: "Unknown caller",  d: "Today 1:22pm · 0:12",          o: "Hours check",    b: "info" },
    { s: "miss", n: "Missed call",     d: "Today 12:45pm",                 o: "Missed",         b: "missed" },
    { s: "done", n: "Lucy Chen",       d: "Today 11:30am · 2:05",          o: "Order — £52.00", b: "order" },
  ];
  const bars = [42, 67, 58, 82, 74, 91, 100, 79, 88, 96, 62, 50];
  const days = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F"];

  return (
    <div className="dash-wrap">
      <style>{G}</style>
      <aside className="dash-sidebar">
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "dashboard" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}` }}>
          <div>
            <div className="dash-date">Wednesday · 18 March 2026</div>
            <div className="dash-greeting">Good afternoon, Tony 👋</div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-live-badge"><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />Agent live</div>
            <button onClick={onBack} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, color: T.mid, cursor: "pointer", transition: "all .18s" }}>← Back to demo</button>
            <div className="dash-avatar" style={{ cursor: "pointer" }} onClick={() => onNavigate && onNavigate('settings')}>TC</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px", maxWidth: 1200, margin: "0 auto" }}>
          
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             {/* Heading removed per request */}
          </div>

          {/* KPI CARDS (Calls, Orders, Reservations) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 32 }}>
            
            {/* Call History Widget */}
            <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", boxShadow: "0 4px 16px rgba(134,87,255,.04)", transition: "transform .2s", cursor: "pointer" }} onClick={() => onNavigate && onNavigate('calls')}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p50, marginBottom: 20, display: "flex", alignItems:"center", justifyContent:"center", color:T.p600, fontSize:18 }}>📞</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 24 }}>Call History</div>
              <div style={{ display: "flex", gap: 32, marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", marginBottom: 6 }}>Total Calls</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1, marginBottom: 8 }}>1,284</div>
                  <div style={{ fontSize: 12.5, color: T.green, fontWeight: 600 }}>↗ +12%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", marginBottom: 6 }}>Missed</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1, marginBottom: 8 }}>42</div>
                  <div style={{ fontSize: 12.5, color: T.red, fontWeight: 600 }}>↘ -5%</div>
                </div>
              </div>
              <div style={{ marginTop: "auto", fontSize: 13, color: T.p600, fontWeight: 700, display:"flex", alignItems:"center", gap:4 }}>View full call logs <span style={{fontSize:14}}>→</span></div>
            </div>

            {/* Orders Status Widget */}
            <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", boxShadow: "0 4px 16px rgba(134,87,255,.04)", transition: "transform .2s", cursor: "pointer" }} onClick={() => onNavigate && onNavigate('orders')}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF3C7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🍔</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: T.soft, fontWeight: 600 }}>Total Today</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>156</div>
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 20 }}>Orders Status</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "Accepted", val: "84", pct: "60%", color: T.p500 },
                  { label: "Confirmed", val: "62", pct: "40%", color: T.green },
                  { label: "Cancelled", val: "10", pct: "10%", color: T.red },
                ].map(b => (
                  <div key={b.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: b.color }} />{b.label}</div>
                      <div>{b.val}</div>
                    </div>
                    <div style={{ height: 6, background: T.paper, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: b.pct, height: "100%", background: b.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", fontSize: 13, color: T.p600, fontWeight: 700, display:"flex", alignItems:"center", gap:4 }}>View all orders <span style={{fontSize:14}}>→</span></div>
            </div>

            {/* Bookings Widget */}
            <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", boxShadow: "0 4px 16px rgba(134,87,255,.04)", transition: "transform .2s", cursor: "pointer" }} onClick={() => onNavigate && onNavigate('reservations')}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display:"flex", alignItems:"center", justifyContent:"center", color:T.p700, fontSize:18 }}>📅</div>
                <div style={{ display: "flex", alignItems: "center", gap: -4 }}>
                   <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.mist, border: "2px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600 }}>G</div>
                   <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.paper, border: "2px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, marginLeft: -8 }}>T</div>
                   <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.p50, border: "2px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, marginLeft: -8, color: T.p600 }}>+12</div>
                </div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 20 }}>Bookings</div>
              <div style={{ display: "flex", gap: 28, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1, marginBottom: 8 }}>48</div>
                  <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase" }}>Reserved/Booked</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1, marginBottom: 8 }}>12</div>
                  <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase" }}>Updated</div>
                </div>
              </div>
              <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600 }}>
                  <div style={{ color: T.mid }}>Cancellation Rate</div>
                  <div style={{ color: T.red }}>4.2%</div>
                </div>
                <div style={{ fontSize: 12, color: T.soft }}><strong style={{ color: T.red }}>2</strong> Cancelled today</div>
              </div>
              <div style={{ marginTop: "auto", fontSize: 13, color: T.p600, fontWeight: 700, display:"flex", alignItems:"center", gap:4 }}>View all reservations <span style={{fontSize:14}}>→</span></div>
            </div>

          </div>

          {/* SECONDARY HUB (Agent, Knowledge Base, Settings) */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 24 }}>
             
             {/* Agent Overview */}
             <div style={{ background: `linear-gradient(135deg, ${T.ink}, #2D3748)`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "white" }}>Your Agent</div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green, boxShadow: "0 0 12px rgba(16,185,129,0.8)" }} />
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, position: "relative" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${T.p300}, ${T.p600})`, color: "white", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>E</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Emily</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Active · Tony's Pizzeria</div>
                  </div>
                </div>

                <button onClick={() => onNavigate && onNavigate('agent')} style={{ marginTop: "auto", width: "100%", padding: "12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, fontSize: 13.5, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
                  Edit agent configuration →
                </button>
             </div>

             {/* Knowledge Base */}
             <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.p50, color: T.p700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Knowledge Base</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontSize: 13.5, color: T.mid, fontWeight: 600 }}>Active FAQs</span>
                     <span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>12</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontSize: 13.5, color: T.mid, fontWeight: 600 }}>Menu Items</span>
                     <span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>48</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <span style={{ fontSize: 13.5, color: T.mid, fontWeight: 600 }}>Files Synced</span>
                     <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>Up to date ✓</span>
                   </div>
                </div>

                <button onClick={() => onNavigate && onNavigate('knowledge-base')} style={{ marginTop: "auto", width: "100%", padding: "12px", background: T.paper, border: `1px solid ${T.line}`, borderRadius: 12, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", transition: "all .2s" }}>
                  Update knowledge base →
                </button>
             </div>

             {/* System Settings */}
             <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.paper, color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚙️</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>System Setup</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  <div onClick={() => onNavigate && onNavigate('billing')} style={{ padding: "14px 16px", background: T.paper, borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: T.ink, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid transparent`, transition: "border .2s" }}>
                    <span>Billing & Plans</span>
                    <span style={{ color: T.soft }}>→</span>
                  </div>
                  <div onClick={() => onNavigate && onNavigate('settings')} style={{ padding: "14px 16px", background: T.paper, borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: T.ink, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid transparent`, transition: "border .2s" }}>
                    <span>Account Settings</span>
                    <span style={{ color: T.soft }}>→</span>
                  </div>
                </div>

                <div style={{ marginTop: "auto", fontSize: 11.5, color: T.soft, fontWeight: 600, textAlign: "center" }}>
                  Current Plan: <span style={{ color: T.p600, fontWeight: 800 }}>Pro Business</span>
                </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ORDERS SCREEN
═══════════════════════════════════════════ */
function OrdersScreen({ onBack, onNavigate }) {
  const [activeCall, setActiveCall] = useState(null);
  
  const callLogs = [
    { id: "442", n: "+1 (415) 555-0921", t: "14:20 · Today", txt: `"1x Large Pepperoni, 2x Garlic Bread"`, s: "Preparing", sb: "#FEF3C7", sc: "#B45309", dur: "£32.50", ic: "O" },
    { id: "441", n: "+1 (212) 555-8844", t: "13:05 · Today", txt: `"2x Margherita, 1x Coke (1.5L)"`, s: "Out for Delivery", sb: "#DBEAFE", sc: "#1D4ED8", dur: "£28.00", ic: "O" },
    { id: "440", n: "Unknown Caller", t: "12:30 · Today", txt: `"1x Vegan Supreme, 1x Water"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "£18.50", ic: "✓" },
    { id: "439", n: "+1 (650) 555-1234", t: "Yesterday 12:15", txt: `"Order #122 contains a gluten-free pizza, right?"`, s: "Cancelled", sb: "#FECACA", sc: "#B91C1C", dur: "£0.00", ic: "×" },
    { id: "438", n: "+44 7911 123456", t: "16 Mar 2026", txt: `"1x BBQ Chicken, 1x Fries"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "£15.50", ic: "✓" },
    { id: "437", n: "+1 (310) 555-9876", t: "16 Mar 2026", txt: `"1x Meat Feast, 1x Diet Coke"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "£19.00", ic: "✓" },
    { id: "436", n: "+1 (888) 555-0000", t: "15 Mar 2026", txt: `"1x Hawaiian, Extra Pineapple"`, s: "Completed", sb: "#D1FAE5", sc: "#065F46", dur: "£14.50", ic: "✓" }
  ];

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "orders" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}` }}>
          <div>
            <div className="dash-date">Wednesday · 18 March 2026</div>
            <div className="dash-greeting">Good afternoon, Tony 👋</div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-live-badge"><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />Agent live</div>
            <button onClick={onBack} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, color: T.mid, cursor: "pointer", transition: "all .18s" }}>← Back to demo</button>
            <div className="dash-avatar" style={{ cursor: "pointer" }}>TC</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: activeCall ? "1.2fr 1fr" : "1fr", gap: 32, paddingBottom: 64, transition: "all 0.3s ease", alignItems: "start" }}>
            {/* Orders History */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>Order history</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12.5, fontWeight: 600 }}>
                  <div style={{ color: T.p600, cursor: "pointer" }}>All</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Completed</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Cancelled</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {callLogs.map((r) => {
                  const isActive = activeCall && activeCall.id === r.id;
                  return (
                    <div key={r.id} onClick={() => setActiveCall(isActive ? null : r)} style={{ background: isActive ? "white" : T.paper, border: `1.5px solid ${isActive ? T.p400 : "transparent"}`, borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: isActive ? "0 4px 16px rgba(134,87,255,0.12)" : "none", cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: isActive ? T.p50 : "white", border: `1.5px solid ${isActive ? T.p200 : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight:"bold", color: r.s==="Cancelled"? "#B91C1C" : (isActive ? T.p600 : T.ink) }}>{r.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{r.n}</div>
                          <div style={{ fontSize: 12, color: T.soft, fontWeight: 600 }}>{r.t}</div>
                        </div>
                        <div style={{ fontSize: 13.5, color: T.mid, marginBottom: 12 }}>{r.txt}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: r.sb, color: r.sc, padding: "4px 8px", borderRadius: 4 }}>{r.s}</span>
                          <span style={{ fontSize: 11.5, color: T.soft, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            {r.dur}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "0 8px" }}>
                <div style={{ fontSize: 13, color: T.soft, fontWeight: 500 }}>Showing 1-7 of 156 orders</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.soft, cursor: "not-allowed" }}>Previous</button>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer" }}>Next</button>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {activeCall && (
              <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", position: "sticky", top: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Order Details</div>
                    <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600 }}>ID: #ORD-5541-{activeCall.id}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>Processed via VoiceCore™</div>
                    </div>
                    <button onClick={() => setActiveCall(null)} style={{ background: T.paper, border: `1px solid ${T.line}`, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: T.mid, fontWeight: "bold", padding: 0, marginTop: -4 }}>×</button>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase" }}>Order Items</div>
                  <div style={{ fontSize: 14, color: T.mid, fontWeight: "bold", cursor: "pointer", transform:"rotate(-45deg)" }}>⚲</div>
                </div>

                <div style={{ background: T.paper, padding: "16px", borderRadius: "16px", fontSize: 13.5, color: T.ink, lineHeight: 1.6, marginBottom: 40 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: `1px dashed ${T.line}`, marginBottom: 12 }}>
                     <div>{activeCall.txt.replace(/"/g, '')}</div>
                     <div style={{ fontWeight: 700 }}>{activeCall.dur}</div>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: T.ink }}>
                     <div>Total</div>
                     <div>{activeCall.dur}</div>
                   </div>
                </div>

                {/* Special Requests */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Special Requests & Allergies</div>
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "12px 16px", borderRadius: "12px", fontSize: 13.5, color: "#991B1B", lineHeight: 1.6, fontWeight: 600 }}>
                     "Severe nut allergy. Celebrating 10th anniversary. Preferred seating near window if possible."
                  </div>
                </div>
                
                {/* AI Context */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", display:"flex", alignItems:"center", gap: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8 }}>✦</div>
                      Talkativ AI Context
                    </div>
                    <div style={{ fontSize: 12, color: T.p600, fontWeight: 700, cursor: "pointer", display:"flex", alignItems:"center", gap:4 }}>View Full Call Log <span style={{fontSize: 14}}>↗</span></div>
                  </div>
                  <div style={{ background: T.p50, border: `1px solid ${T.p100}`, padding: "16px", borderRadius: "16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.white, display: "flex", alignItems: "center", justifyContent: "center", color: T.p600, fontSize: 14, cursor:"pointer", border:`1px solid ${T.line}`, flexShrink: 0, boxShadow: "0 2px 8px rgba(134,87,255,0.15)", transform:"scaleX(1.1)" }}>▶</div>
                    <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.6, flex: 1, fontStyle: "italic", fontWeight: 500 }}>
                      "The caller mentioned they want a specific vintage wine if available. I confirmed our sommelier would be notified."
                    </div>
                  </div>
                </div>

                {/* Bottom intent panel */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{activeCall.s}</div>
                  </div>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Order Type</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{["441", "439", "436"].includes(activeCall.id) ? "Delivery" : "Collection"}</div>
                  </div>
                  <div style={{ background: "#F6FBF9", borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Payment</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#059669" }}>{["441", "439", "436"].includes(activeCall.id) ? (activeCall.id === "441" ? "Pay on Delivery" : "Paid Now") : "Pay at counter"}</div>
                  </div>
                </div>

                <button style={{ width: "100%", background: T.p100, color: T.p700, border: "none", borderRadius: 30, padding: "16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
                  🍕 Print Ticket to Kitchen
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   RESERVATIONS SCREEN
═══════════════════════════════════════════ */
function ReservationsScreen({ onBack, onNavigate }) {
  const [activeCall, setActiveCall] = useState(null);
  
  const callLogs = [
    { id: "882", n: "+1 (415) 555-0921", t: "Tomorrow, 19:00", txt: `"Party of 4. Inside seating."`, s: "Confirmed", sb: "#D1FAE5", sc: "#065F46", dur: "4 Ppl", ic: "R" },
    { id: "881", n: "+1 (212) 555-8844", t: "Friday, 20:00", txt: `"Party of 2. Window seat if possible."`, s: "Pending", sb: "#FEF3C7", sc: "#B45309", dur: "2 Ppl", ic: "R" },
    { id: "880", n: "+1 (650) 555-1234", t: "Saturday, 18:30", txt: `"Party of 6. High chair needed."`, s: "Confirmed", sb: "#D1FAE5", sc: "#065F46", dur: "6 Ppl", ic: "✓" },
    { id: "879", n: "Unknown Caller", t: "Sun, 12:15", txt: `"Party of 8 for brunch."`, s: "Cancelled", sb: "#FECACA", sc: "#B91C1C", dur: "8 Ppl", ic: "×" },
    { id: "878", n: "+44 7911 123456", t: "16 Mar 2026", txt: `"Table for 3. Celebrating anniversary."`, s: "Confirmed", sb: "#D1FAE5", sc: "#065F46", dur: "3 Ppl", ic: "✓" },
    { id: "877", n: "+1 (310) 555-9876", t: "16 Mar 2026", txt: `"Party of 5. Outdoor patio."`, s: "Confirmed", sb: "#D1FAE5", sc: "#065F46", dur: "5 Ppl", ic: "✓" },
    { id: "876", n: "+1 (888) 555-0000", t: "15 Mar 2026", txt: `"Party of 2. Quiet corner requested."`, s: "Confirmed", sb: "#D1FAE5", sc: "#065F46", dur: "2 Ppl", ic: "✓" }
  ];

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "reservations" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}` }}>
          <div>
            <div className="dash-date">Wednesday · 18 March 2026</div>
            <div className="dash-greeting">Good afternoon, Tony 👋</div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-live-badge"><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />Agent live</div>
            <button onClick={onBack} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, color: T.mid, cursor: "pointer", transition: "all .18s" }}>← Back to demo</button>
            <div className="dash-avatar" style={{ cursor: "pointer" }}>TC</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: activeCall ? "1.2fr 1fr" : "1fr", gap: 32, paddingBottom: 64, transition: "all 0.3s ease", alignItems: "start" }}>
            {/* Reservations History */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>Reservation history</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12.5, fontWeight: 600 }}>
                  <div style={{ color: T.p600, cursor: "pointer" }}>All</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Confirmed</div>
                  <div style={{ color: T.mid, cursor: "pointer" }}>Cancelled</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {callLogs.map((r) => {
                  const isActive = activeCall && activeCall.id === r.id;
                  return (
                    <div key={r.id} onClick={() => setActiveCall(isActive ? null : r)} style={{ background: isActive ? "white" : T.paper, border: `1.5px solid ${isActive ? T.p400 : "transparent"}`, borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: isActive ? "0 4px 16px rgba(134,87,255,0.12)" : "none", cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: isActive ? T.p50 : "white", border: `1.5px solid ${isActive ? T.p200 : T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight:"bold", color: r.s==="Cancelled"? "#B91C1C" : (isActive ? T.p600 : T.ink) }}>{r.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{r.n}</div>
                          <div style={{ fontSize: 12, color: T.soft, fontWeight: 600 }}>{r.t}</div>
                        </div>
                        <div style={{ fontSize: 13.5, color: T.mid, marginBottom: 12 }}>{r.txt}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: r.sb, color: r.sc, padding: "4px 8px", borderRadius: 4 }}>{r.s}</span>
                          <span style={{ fontSize: 11.5, color: T.soft, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            {r.dur}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "0 8px" }}>
                <div style={{ fontSize: 13, color: T.soft, fontWeight: 500 }}>Showing 1-7 of 48 bookings</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.soft, cursor: "not-allowed" }}>Previous</button>
                  <button style={{ background: "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer" }}>Next</button>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            {activeCall && (
              <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", position: "sticky", top: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Reservation Details</div>
                    <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600 }}>ID: #RSV-9921-{activeCall.id}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: T.soft, marginTop: 4 }}>Processed via VoiceCore™</div>
                    </div>
                    <button onClick={() => setActiveCall(null)} style={{ background: T.paper, border: `1px solid ${T.line}`, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: T.mid, fontWeight: "bold", padding: 0, marginTop: -4 }}>×</button>
                  </div>
                </div>

                {/* Info Text */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase" }}>Request Info</div>
                  <div style={{ fontSize: 14, color: T.mid, fontWeight: "bold", cursor: "pointer", transform:"rotate(-45deg)" }}>⚲</div>
                </div>

                <div style={{ background: T.paper, padding: "16px", borderRadius: "16px", fontSize: 13.5, color: T.ink, lineHeight: 1.6, marginBottom: 40 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: `1px dashed ${T.line}`, marginBottom: 12 }}>
                     <div>{activeCall.txt.replace(/"/g, '')}</div>
                     <div style={{ fontWeight: 700 }}>{activeCall.dur}</div>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: T.ink }}>
                     <div>Time Requested</div>
                     <div>{activeCall.t}</div>
                   </div>
                </div>

                {/* Special Requests */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Special Requests & Allergies</div>
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "12px 16px", borderRadius: "12px", fontSize: 13.5, color: "#991B1B", lineHeight: 1.6, fontWeight: 600 }}>
                     "Severe nut allergy. Celebrating 10th anniversary. Preferred seating near window if possible."
                  </div>
                </div>
                
                {/* AI Context */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: T.soft, letterSpacing: 1.5, textTransform: "uppercase", display:"flex", alignItems:"center", gap: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8 }}>✦</div>
                      Talkativ AI Context
                    </div>
                    <div style={{ fontSize: 12, color: T.p600, fontWeight: 700, cursor: "pointer", display:"flex", alignItems:"center", gap:4 }}>View Full Call Log <span style={{fontSize: 14}}>↗</span></div>
                  </div>
                  <div style={{ background: T.p50, border: `1px solid ${T.p100}`, padding: "16px", borderRadius: "16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.white, display: "flex", alignItems: "center", justifyContent: "center", color: T.p600, fontSize: 14, cursor:"pointer", border:`1px solid ${T.line}`, flexShrink: 0, boxShadow: "0 2px 8px rgba(134,87,255,0.15)", transform:"scaleX(1.1)" }}>▶</div>
                    <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.6, flex: 1, fontStyle: "italic", fontWeight: 500 }}>
                      "The caller mentioned they want a specific vintage wine if available. I confirmed our sommelier would be notified."
                    </div>
                  </div>
                </div>

                {/* Bottom intent panel (4 items for Reservations) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{activeCall.s}</div>
                  </div>
                  <div style={{ background: "#F6FBF9", borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Party Size</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#059669" }}>{activeCall.dur}</div>
                  </div>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Table</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>T-08 (Window)</div>
                  </div>
                  <div style={{ background: T.paper, borderRadius: 20, padding: "14px 20px" }}>
                    <div style={{ fontSize: 10, color: T.soft, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>Deposit</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>$40 Paid</div>
                  </div>
                </div>

                <button style={{ width: "100%", background: T.p100, color: T.p700, border: "none", borderRadius: 30, padding: "16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
                  📅 Send Calendar Invite
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AGENT SCREEN
═══════════════════════════════════════════ */
function AgentScreen({ onBack, onNavigate }) {
  const [activeVoice, setActiveVoice] = useState('a');
  const [is247, setIs247] = useState(false);
  const scheduleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "agent" ? "active" : ""}`} onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}` }}>
          <div>
            <div className="dash-date">Wednesday · 18 March 2026</div>
            <div className="dash-greeting">Good afternoon, Tony 👋</div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-live-badge"><div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />Agent live</div>
            <button onClick={onBack} style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, color: T.mid, cursor: "pointer", transition: "all .18s" }}>← Back to demo</button>
            <div className="dash-avatar" style={{ cursor: "pointer" }}>TC</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}>
          
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: T.ink, marginBottom: 8, letterSpacing: "-0.5px" }}>Customize your receptionist's identity</h1>
              <p style={{ fontSize: 14.5, color: T.mid }}>Configure your AI agent's personality, core identity, and greeting.</p>
            </div>
            <button style={{ padding: "14px 28px", background: T.ink, border: "none", borderRadius: 16, fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all .2s" }}>Save Configuration</button>
          </div>

          {/* TOP IDENTITY BANNER */}
          <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 24, padding: "32px", marginBottom: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${T.p300}, ${T.p600})`, color: "white", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", boxShadow: "0 8px 16px rgba(134,87,255,0.2)" }}>E</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>Emily</div>
                  <div style={{ background: T.p50, color: T.p700, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>✦ AI Receptionist</div>
                </div>
                <div style={{ display: "flex", gap: 20, color: T.mid, fontSize: 13.5, fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>🏢 Tech Fix Web Design Hosting Training SEO Tyngsboro MA</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>📞 +1 978 932 8576</div>
                </div>
              </div>
            </div>

            <div style={{ borderLeft: `1px dashed ${T.line}`, paddingLeft: 32, display: "flex", flexDirection: "column", gap: 8 }}>
               <div style={{ fontSize: 11, fontWeight: 800, color: T.soft, letterSpacing: 0.5, textTransform: "uppercase" }}>Capabilities</div>
               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                 <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10 }}>✓</div>
                 <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>Inbound calls only</span>
               </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start", marginBottom: 32 }}>
            
            {/* Identity & Greeting (Left) */}
            <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 24, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>Agent Profile</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Agent Name</div>
                  <input type="text" defaultValue="Emily" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${T.line}`, fontSize: 14.5, fontWeight: 500, color: T.ink, background: T.paper }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Gender</div>
                  <select defaultValue="Female" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${T.line}`, fontSize: 14.5, fontWeight: 500, color: T.ink, background: T.paper, appearance: "auto" }}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Greeting Phrase</div>
                <textarea defaultValue="Hi, thank you for calling Tech Fix Web Design Hosting Training SEO Tyngsboro MA! I am Emily, I can speak many languages. How can I help you today?" style={{ width: "100%", padding: "16px", borderRadius: 12, border: `1.5px solid ${T.line}`, fontSize: 14.5, fontWeight: 500, color: T.ink, background: T.paper, minHeight: 110, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }} />
              </div>
              
              <button style={{ background: "transparent", border: `1.5px solid ${T.p500}`, borderRadius: 12, padding: "12px", fontSize: 13.5, fontWeight: 700, color: T.p600, cursor: "pointer", display:"flex", alignItems:"center", justifyContent: "center", gap:8, width: "100%", transition: "all .2s" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.p600, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10 }}>▶</div>
                Listen to agent voice with greeting message
              </button>
            </div>

            {/* Voice Selection (Right) */}
            <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 24, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 24 }}>Choose a Voice</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { id: 'a', name: 'Voice A', desc: 'Energetic & Pushy' },
                  { id: 'b', name: 'Voice B', desc: 'Steady & Confident' },
                  { id: 'c', name: 'Voice C', desc: 'Soft & Relaxed' }
                ].map(v => {
                  const isActive = activeVoice === v.id;
                  return (
                    <div key={v.id} onClick={() => setActiveVoice(v.id)} style={{ padding: "20px 24px", border: `1.5px solid ${isActive ? T.p500 : T.line}`, borderRadius: 16, background: isActive ? T.p50 : "white", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all .2s" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                         <div style={{ width: 44, height: 44, borderRadius: "50%", background: isActive ? "white" : T.paper, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isActive ? "0 4px 12px rgba(134,87,255,0.15)" : "none", color: isActive ? T.p600 : T.mid, fontSize: 16 }}>🎙</div>
                         <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? T.p700 : T.ink, marginBottom: 4 }}>{v.name}</div>
                            <div style={{ fontSize: 13, color: isActive ? T.p600 : T.mid, fontWeight: 500 }}>{v.desc}</div>
                         </div>
                       </div>
                       
                       <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isActive ? T.p600 : T.line}`, background: isActive ? T.p600 : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                         {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Working Schedule (Full Width Bottom) */}
          <div style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 24, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
               <div>
                 <h2 style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 8 }}>Thinking about main receptionist scenarios during working hours</h2>
                 <p style={{ fontSize: 14, color: T.mid }}>I found that you work on this schedule. Is that correct?</p>
               </div>
               
               <div onClick={() => setIs247(!is247)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                 <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>We operate 24/7</span>
                 <div style={{ width: 44, height: 24, borderRadius: 12, background: is247 ? T.green : T.mist, position: "relative", transition: "all .2s" }}>
                   <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: is247 ? 22 : 2, transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                 </div>
               </div>
            </div>
             
             <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 32, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 16, opacity: is247 ? 0.3 : 1, pointerEvents: is247 ? "none" : "auto", transition: "opacity .3s" }}>
                {scheduleDays.map(d => {
                  const isWeekend = d === "Sat" || d === "Sun";
                  return (
                    <div key={d} style={{ display: "flex", flexDirection: "column", gap: 12, background: isWeekend ? T.paper : "white", border: `1.5px solid ${isWeekend ? "transparent" : T.line}`, padding: "20px 16px", borderRadius: 16, textAlign: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isWeekend ? T.mid : T.ink }}>{d}</span>
                      {!isWeekend ? (
                        <>
                          <select style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, color: T.ink, background: T.paper, outline: "none" }}>
                            <option>09:00 AM</option>
                          </select>
                          <select style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, color: T.ink, background: T.paper, outline: "none" }}>
                            <option>05:00 PM</option>
                          </select>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: T.mid, padding: "10px 0", fontWeight: 600 }}>Closed</div>
                      )}
                    </div>
                  )
                })}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   KNOWLEDGE BASE SCREEN
═══════════════════════════════════════════ */
function KnowledgeBaseScreen({ onBack, onNavigate }) {
  const [faqs, setFaqs] = useState([
    { id: 1, q: "Do you have vegan options?", a: "Yes, we offer a dedicated vegan menu with several options." },
    { id: 2, q: "Is the meat halal?", a: "All our chicken and beef is 100% certified halal." }
  ]);
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Margherita Pizza", price: "£12.50", desc: "Classic tomato, fresh mozzarella, basil" },
    { id: 2, name: "Spicy Pepperoni", price: "£14.50", desc: "Double pepperoni, chili flakes, hot honey" }
  ]);
  const [syncUrl, setSyncUrl] = useState("https://tonys-pizzeria.com/menu");

  const addFaq = () => setFaqs([...faqs, { id: Date.now(), q: "", a: "" }]);
  const updateFaq = (id, field, val) => setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: val } : f));
  const deleteFaq = (id) => setFaqs(faqs.filter(f => f.id !== id));

  const addMenuItem = () => setMenuItems([...menuItems, { id: Date.now(), name: "", price: "", desc: "" }]);
  const updateMenuItem = (id, field, val) => setMenuItems(menuItems.map(m => m.id === id ? { ...m, [field]: val } : m));
  const deleteMenuItem = (id) => setMenuItems(menuItems.filter(m => m.id !== id));

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "knowledge-base" ? "active" : ""}`} onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}`, background: "white", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div className="dash-greeting">Train your AI Agent</div>
          </div>
          <div className="dash-topbar-right">
            <button style={{ background: T.ink, border: "none", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", transition: "all .18s", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>Save Changes</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px", maxWidth: 1000, margin: "0 auto" }}>
          
          {/* FILE UPLOAD & SYNC URL */}
          <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, marginBottom: 32, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 8 }}>Documents & Sync URL</div>
            <div style={{ fontSize: 13.5, color: T.mid, marginBottom: 24, lineHeight: 1.5 }}>Upload PDF, PNG, or DOCX files of your menu or business guidelines, or provide a URL for our AI to automatically sync.</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ border: `2px dashed ${T.p200}`, background: T.p50, borderRadius: 16, padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", color: T.p600, boxShadow: "0 2px 12px rgba(134,87,255,0.1)" }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.p700, marginBottom: 4 }}>Click to upload files</div>
                <div style={{ fontSize: 12, color: T.p400 }}>Supports PDF, PNG, DOCX (Max 10MB)</div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Live Sync URL</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={syncUrl} onChange={e => setSyncUrl(e.target.value)} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} placeholder="https://website.com/menu" />
                    <button style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 600, color: T.ink, cursor: "pointer" }}>Sync Now</button>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Uploaded Files</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F6FBF9", border: `1px solid #D1FAE5`, borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ padding: "6px", background: "white", borderRadius: 6, fontSize: 12 }}>📋</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#065F46" }}>menu_spring_2026.pdf</div>
                        <div style={{ fontSize: 11, color: "#059669" }}>Synced 2 hours ago</div>
                      </div>
                    </div>
                    <button style={{ background: "transparent", border: "none", color: T.red, cursor: "pointer", fontSize: 16, fontWeight: "bold" }}>×</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MENU LIST */}
          <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, marginBottom: 32, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Menu Items</div>
                <div style={{ fontSize: 13.5, color: T.mid }}>Manage what your AI can offer and quote prices for.</div>
              </div>
              <button onClick={addMenuItem} style={{ background: T.p100, color: T.p700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add Item</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 40px", gap: 12, alignItems: "start", background: T.paper, padding: 16, borderRadius: 12, border: `1px solid ${T.line}` }}>
                  <input value={item.name} onChange={e => updateMenuItem(item.id, 'name', e.target.value)} placeholder="Item Name (e.g. Margherita)" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13.5, outline: "none", background: "white", color: T.ink }} />
                  <input value={item.price} onChange={e => updateMenuItem(item.id, 'price', e.target.value)} placeholder="Price (e.g. £12.50)" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13.5, outline: "none", background: "white", color: T.ink }} />
                  <input value={item.desc} onChange={e => updateMenuItem(item.id, 'desc', e.target.value)} placeholder="Description or dietary info" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13.5, outline: "none", background: "white", color: T.ink }} />
                  <button onClick={() => deleteMenuItem(item.id)} style={{ height: "40px", background: "white", border: `1px solid ${T.line}`, borderRadius: 8, color: T.red, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
              {menuItems.length === 0 && <div style={{ fontSize: 13.5, color: T.soft, textAlign: "center", padding: 24 }}>No menu items added.</div>}
            </div>
          </section>

          {/* MENU FAQ */}
          <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, marginBottom: 32, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Frequently Asked Questions</div>
                <div style={{ fontSize: 13.5, color: T.mid }}>Train your AI on how to answer specific questions perfectly.</div>
              </div>
              <button onClick={addFaq} style={{ background: T.p100, color: T.p700, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add FAQ</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {faqs.map(faq => (
                <div key={faq.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.paper, padding: 16, borderRadius: 12, border: `1px solid ${T.line}` }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <input value={faq.q} onChange={e => updateFaq(faq.id, 'q', e.target.value)} placeholder="Question" style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, fontWeight: 600, outline: "none", background: "white", color: T.ink }} />
                    <textarea value={faq.a} onChange={e => updateFaq(faq.id, 'a', e.target.value)} placeholder="Answer" rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13.5, outline: "none", resize: "vertical", background: "white", color: T.ink }} />
                  </div>
                  <button onClick={() => deleteFaq(faq.id)} style={{ height: "42px", width: "42px", flexShrink: 0, background: "white", border: `1px solid ${T.line}`, borderRadius: 8, color: T.red, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
              {faqs.length === 0 && <div style={{ fontSize: 13.5, color: T.soft, textAlign: "center", padding: 24 }}>No FAQs added.</div>}
            </div>
          </section>

          {/* POLICIES GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* BUSINESS OPENING HOURS */}
            <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 32, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 20 }}>Business Hours</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                   const isWeekend = day === "Sunday";
                   return (
                    <div key={day} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: isWeekend ? T.mid : T.ink }}>{day}</span>
                      {!isWeekend ? (
                        <>
                          <input type="time" defaultValue="09:00" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, color: T.ink, background: "white", outline: "none" }} />
                          <input type="time" defaultValue="17:00" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13, color: T.ink, background: "white", outline: "none" }} />
                        </>
                      ) : (
                        <div style={{ gridColumn: "span 2", fontSize: 13, color: T.mid, padding: "8px 12px", background: "white", borderRadius: 8, textAlign: "center", border: `1px solid transparent` }}>Closed</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* RESERVATION POLICIES */}
              <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 16 }}>Reservation Policies</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 6 }}>Maximum Party Size</label>
                    <input type="number" defaultValue={8} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 6 }}>Booking Window</label>
                    <select style={{ width: "100%", padding: "10px 30px 10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink, cursor: "pointer", fontFamily: "inherit" }}>
                      <option>Up to 30 days in advance</option>
                      <option>Up to 14 days in advance</option>
                      <option>Up to 7 days in advance</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* ORDERING POLICIES */}
              <section style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 24, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 16 }}>Ordering Policies</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 6 }}>Delivery Radius</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" defaultValue={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} />
                      <span style={{ fontSize: 14, color: T.mid, fontWeight: 600 }}>miles</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 6 }}>Minimum Order</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: 10, fontSize: 14, color: T.mid }}>£</span>
                      <input type="number" defaultValue={15} style={{ width: "100%", padding: "10px 14px 10px 24px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 6 }}>Delivery Fee</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: 10, fontSize: 14, color: T.mid }}>£</span>
                      <input type="number" defaultValue={2.5} style={{ width: "100%", padding: "10px 14px 10px 24px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <div style={{ height: 60 }} />
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BILLING & PLANS SCREEN
═══════════════════════════════════════════ */
function BillingScreen({ onBack, onNavigate }) {
  const [reservationDeposit, setReservationDeposit] = useState(true);
  const [deliveryDeposit, setDeliveryDeposit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "billing" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}`, background: "white", position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Billing & Plans</div>
            <div style={{ fontSize: 14, color: T.mid }}>Manage your subscription, monitor usage, and update your payment information with ease.</div>
          </div>
          <div>
            <button style={{ background: T.p100, border: "none", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: T.p700, cursor: "pointer", transition: "all .18s" }}>Download All Invoices</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px", maxWidth: 1050, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* CURRENT PLAN */}
            <div style={{ background: `linear-gradient(135deg, #6C3CE9, #5527D1)`, borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 12px 24px rgba(108,60,233,0.2)" }}>
              <div style={{ position: "absolute", top: 24, right: 24, fontSize: 24, opacity: 0.2 }}>✨</div>
              <div style={{ background: "rgba(255,255,255,0.15)", display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 24, alignSelf: "flex-start" }}>Current Plan</div>
              
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Pro Business</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: "auto" }}>
                <span style={{ fontSize: 42, fontWeight: 800 }}>$99</span>
                <span style={{ fontSize: 15, opacity: 0.8, fontWeight: 600 }}>/ month</span>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "32px 0 24px 0" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Next Renewal</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>October 12, 2026</div>
                </div>
                <button style={{ background: "white", color: "#6C3CE9", border: "none", borderRadius: 24, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>Change Plan</button>
              </div>
            </div>

            {/* USAGE METRICS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Calls Used */}
              <div style={{ background: "white", borderRadius: 24, padding: 24, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Calls Used</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.mid }}>1,248 / 5,000</div>
                </div>
                <div style={{ height: 8, background: T.paper, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: "25%", height: "100%", background: "#6C3CE9", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: T.soft, fontStyle: "italic" }}>25% of monthly allowance used</div>
              </div>

              {/* Agent Usage */}
              <div style={{ background: "white", borderRadius: 24, padding: 24, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Agent Usage</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#6C3CE9" }}>88%</div>
                </div>
                <div style={{ display: "flex", gap: 4, height: 16, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{ flex: 1, background: i <= 5 ? "#8B5CF6" : T.paper, borderRadius: 2, opacity: i === 5 ? 0.7 : 1 }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: T.soft, fontStyle: "italic" }}>Agent active capacity approaching limit</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
            {/* PAYMENT METHOD */}
            <div style={{ background: "white", borderRadius: 24, padding: 32, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>Payment Method</div>
                <div style={{ fontSize: 18, color: T.mid }}>💳</div>
              </div>
              <div style={{ background: "#F8F7FA", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#1A1F36", color: "white", fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 6, fontStyle: "italic" }}>VISA</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: 2 }}>•••• •••• •••• 4242</div>
                  <div style={{ fontSize: 12, color: T.soft, marginTop: 4 }}>Expires 12/26</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ flex: 1, background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: "10px", fontSize: 13, fontWeight: 700, color: "#6C3CE9", cursor: "pointer" }}>Edit</button>
                <button style={{ flex: 1, background: T.paper, border: "none", borderRadius: 20, padding: "10px", fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer" }}>Add New</button>
              </div>
            </div>

            {/* TAX INFORMATION */}
            <div style={{ background: "white", borderRadius: 24, padding: 32, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)", position: "relative" }}>
              <button style={{ position: "absolute", top: 32, right: 32, background: "transparent", border: "none", color: "#6C3CE9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✎ Update Details</button>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 24 }}>Tax Information</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: T.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Business Name</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Tony's Pizzeria</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Billing Address</div>
                  <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.6 }}>
                    123 Culinary Way, Suite 400<br />
                    Manchester, M2 1WU<br />
                    United Kingdom
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEPOSIT SETTINGS */}
          <div style={{ background: "white", borderRadius: 24, padding: 32, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 24 }}>Deposit Settings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              
              <div style={{ padding: "24px", border: `1.5px solid ${T.line}`, borderRadius: 16, background: "#F8F7FA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Reservation Deposit</div>
                  {/* Toggle Switch */}
                  <div onClick={() => setReservationDeposit(!reservationDeposit)} style={{ width: 44, height: 24, borderRadius: 12, background: reservationDeposit ? "#6C3CE9" : T.mist, position: "relative", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: reservationDeposit ? 22 : 2, transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: T.mid, marginBottom: 20 }}>Require a deposit for booking slots</div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 8 }}>Deposit Amount ($)</label>
                  <input type="number" defaultValue={25.00} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} disabled={!reservationDeposit} />
                </div>
              </div>

              <div style={{ padding: "24px", border: `1.5px solid ${T.line}`, borderRadius: 16, background: "#F8F7FA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Delivery Deposit</div>
                  {/* Toggle Switch */}
                  <div onClick={() => setDeliveryDeposit(!deliveryDeposit)} style={{ width: 44, height: 24, borderRadius: 12, background: deliveryDeposit ? "#6C3CE9" : T.mist, position: "relative", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: deliveryDeposit ? 22 : 2, transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: T.mid, marginBottom: 20 }}>Upfront payment for delivery services</div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 8 }}>Deposit Amount ($)</label>
                  <input type="number" placeholder="Enter amount..." style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 14, outline: "none", background: "white", color: T.ink }} disabled={!deliveryDeposit} />
                </div>
              </div>

            </div>
          </div>

          {/* BILLING HISTORY */}
          <div style={{ background: "white", borderRadius: 24, padding: "32px 32px 24px", border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>Billing History</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.mid, cursor: "pointer" }}>
                Showing last 6 months <span style={{ fontSize: 10 }}>▼</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 40px", gap: 16, padding: "12px 0", borderBottom: `2px solid ${T.paper}`, fontSize: 11, fontWeight: 800, color: T.soft, letterSpacing: 1, textTransform: "uppercase" }}>
              <div>Invoice Date</div>
              <div>Invoice ID</div>
              <div>Amount</div>
              <div>Status</div>
              <div></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { d: "Sep 12, 2026", id: "#INV-2026-009", a: "$99.00", s: "Paid" },
                { d: "Aug 12, 2026", id: "#INV-2026-008", a: "$99.00", s: "Paid" },
                { d: "Jul 12, 2026", id: "#INV-2026-007", a: "$99.00", s: "Paid" },
                { d: "Jun 12, 2026", id: "#INV-2026-006", a: "$142.50", s: "Paid", meta: "Included overages" },
              ].map((inv, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 40px", gap: 16, padding: "20px 0", borderBottom: i === 3 ? "none" : `1px solid ${T.paper}`, alignItems: "center", fontSize: 14 }}>
                  <div style={{ fontWeight: 600, color: T.ink }}>{inv.d}</div>
                  <div style={{ color: T.mid }}>{inv.id}</div>
                  <div style={{ fontWeight: 800, color: T.ink }}>{inv.a}</div>
                  <div>
                    <span style={{ background: "#D1FAE5", color: "#065F46", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{inv.s}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {inv.meta && <div style={{ fontSize: 11, fontStyle: "italic", color: T.soft, whiteSpace: "nowrap", position: "relative", right: 20 }}>{inv.meta}</div>}
                    <button style={{ background: "transparent", border: "none", color: "#6C3CE9", cursor: "pointer", fontSize: 16, fontWeight: "bold" }}>↓</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 13, color: T.soft, fontWeight: 500 }}>Showing 1-4 of 12 invoices</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  style={{ background: currentPage === 1 ? T.paper : "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: currentPage === 1 ? T.soft : T.ink, cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "all .2s" }}>
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  style={{ background: currentPage === totalPages ? T.paper : "white", border: `1px solid ${T.line}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: currentPage === totalPages ? T.soft : T.ink, cursor: currentPage === totalPages ? "not-allowed" : "pointer", transition: "all .2s" }}>
                  Next
                </button>
              </div>
            </div>

          </div>

          <div style={{ height: 60 }} />
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS SCREEN
═══════════════════════════════════════════ */
function SettingsScreen({ onBack, onNavigate }) {
  const [profileName, setProfileName] = useState("Tony's Pizzeria");
  const [email, setEmail] = useState("tony@tonyspizzeria.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoReply, setAutoReply] = useState(true);

  return (
    <div className="dash-wrap" style={{ background: "#F8F7FA" }}>
      <style>{G}</style>
      <aside className="dash-sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div className="dash-logo"><div className="dash-logo-mark">t</div>talkativ</div>
        <div className="dash-section-label">Main</div>
        {[["Dashboard", "dashboard"], ["Calls", "calls"], ["Orders", "orders"], ["Reservations", "reservations"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div className="dash-section-label">Agent</div>
        {[["My Agent", "agent"], ["Knowledge base", "knowledge-base"]].map(([l, route]) => (
          <div key={l} className="dash-nav-item" onClick={() => route && onNavigate && onNavigate(route)}>{l}</div>
        ))}
        <div className="dash-section-label">Account</div>
        {[["Billing", "billing"], ["Settings", "settings"]].map(([l, route]) => (
          <div key={l} className={`dash-nav-item ${route === "settings" ? "active" : ""}`} onClick={() => route && onNavigate ? onNavigate(route) : null}>{l}</div>
        ))}
        <div style={{ marginTop: "auto", borderTop: `1.5px solid ${T.line}`, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>TC</div>
            <div>
               <div style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 2 }}>Tony's Pizzeria</div>
               <div style={{ fontSize: 12.5, color: T.soft, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: 3 }} onClick={() => onNavigate && onNavigate('landing')}>Logout</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", background: "white", border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
             Customer support ↗
          </button>
        </div>
      </aside>

      <main className="dash-main" style={{ padding: 0 }}>
        {/* TOP BAR */}
        <div className="dash-topbar" style={{ padding: "24px 32px", borderBottom: `1.5px solid ${T.line}`, background: "white", position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Settings</div>
            <div style={{ fontSize: 14, color: T.mid }}>Manage your business profile, team members, and overall application preferences.</div>
          </div>
          <div>
            <button style={{ background: T.ink, border: "none", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", transition: "all .18s", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>Save Changes</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "32px 48px", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* PROFILE CARD */}
          <section style={{ background: "white", borderRadius: 24, padding: 32, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 24 }}>Business Profile</div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", boxShadow: "0 4px 12px rgba(134,87,255,0.2)" }}>TC</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer" }}>Upload New</button>
                <button style={{ background: "transparent", border: "none", color: T.red, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Remove</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Business Name</label>
                <input value={profileName} onChange={e => setProfileName(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "#F8F7FA" }} />
              </div>
              <div style={{ gridColumn: "span 1" }}></div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "#F8F7FA" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "#F8F7FA" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Order notification email</label>
                <input placeholder="orders@tonyspizzeria.com" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "#F8F7FA" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Order webhook url</label>
                <input placeholder="https://api.example.com/webhook" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontSize: 14, outline: "none", color: T.ink, background: "#F8F7FA" }} />
              </div>
            </div>
          </section>



          {/* SECURITY */}
          <section style={{ background: "white", borderRadius: 24, padding: 32, border: `1px solid ${T.line}`, boxShadow: "0 4px 16px rgba(134,87,255,.04)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 24 }}>Security</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8F7FA", padding: "20px 24px", borderRadius: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Password</div>
                <div style={{ fontSize: 12, color: T.soft }}>Last changed 3 months ago</div>
              </div>
              <button style={{ background: "white", border: `1.5px solid ${T.line}`, borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 700, color: T.ink, cursor: "pointer" }}>Change Password</button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FEF2F2", padding: "20px 24px", borderRadius: 16, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: "#B91C1C" }}>Permanently remove your account and all associated data.</div>
              </div>
              <button style={{ background: "#DC2626", border: "none", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>Delete account</button>
            </div>
          </section>

          <div style={{ height: 60 }} />
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP ROUTER
═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);

  const go = s => { setScreen(s); window.scrollTo(0, 0); };

  const nextOb = () => { if (step < 4) { setStep(step + 1); go(`ob${step + 1}`); } else go("success"); };
  const backOb = () => { if (step > 0) { setStep(step - 1); go(`ob${step - 1}`); } else go("landing"); };

  if (screen === "landing")   return <Landing onCTA={() => { setStep(0); go("ob0"); }} />;
  if (screen === "ob0")       return <Step0 onNext={nextOb} onBack={backOb} />;
  if (screen === "ob1")       return <Step2 onNext={nextOb} onBack={backOb} />;
  if (screen === "ob2")       return <Step4 onNext={nextOb} onBack={backOb} />;
  if (screen === "ob3")       return <Step5 onNext={nextOb} onBack={backOb} />;
  if (screen === "ob4")       return <Step6 onNext={() => go("success")} onBack={backOb} />;
  if (screen === "success")         return <SuccessScreen onDashboard={() => go("dashboard")} />;
  if (screen === "dashboard")       return <Dashboard onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "calls")           return <CallsScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "orders")          return <OrdersScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "reservations")    return <ReservationsScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "agent")           return <AgentScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "knowledge-base")  return <KnowledgeBaseScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "billing")         return <BillingScreen onBack={() => go("landing")} onNavigate={go} />;
  if (screen === "settings")        return <SettingsScreen onBack={() => go("landing")} onNavigate={go} />;
}
