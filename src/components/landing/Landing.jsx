import React from "react";

const T = {
  ivory: "#FDFCFA", white: "#FFFFFF", paper: "#F8F6FF", mist: "#F2EEFF",
  frost: "#EAE4FF", lavBlue: "#E0D9FF",
  p50: "#F5F2FF", p100: "#ECE5FF", p200: "#D9CEFF", p300: "#BBA8FF",
  p400: "#9E7EFF", p500: "#8657FF", p600: "#7035F5", p700: "#5E24D8", p800: "#4B1AB5",
  ink: "#130D2E", ink2: "#2D2150", mid: "#6B5E8A", soft: "#9E92BA",
  faint: "#C8C0DC", line: "#EBE6F5",
  green: "#22C55E", greenBg: "#F0FDF4", greenBd: "#BBF7D0",
  red: "#EF4444", redBg: "#FEF2F2", amber: "#F59E0B",
};

export default function Landing({ onCTA, onLogin }) {
  return (
    <div style={{ background: T.ivory }}>
      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", justifyContent: "center",
        padding: "14px 24px",
        animation: "fadeIn .6s ease both",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", maxWidth: 1120,
          background: T.white,
          border: `1px solid ${T.line}`,
          borderRadius: 60,
          padding: "10px 12px 10px 24px",
          boxShadow: "0 2px 20px rgba(19,13,46,.06), 0 1px 4px rgba(19,13,46,.04)",
        }}>
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700, color: T.ink,
            letterSpacing: "-.3px", cursor: "pointer", flexShrink: 0,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: `linear-gradient(135deg, ${T.p500}, ${T.p700})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 14, fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", fontWeight: 700,
              boxShadow: "0 3px 12px rgba(134,87,255,.3)",
            }}>t</div>
            talkativ
          </div>

          {/* Center Links */}
          <div style={{
            display: "flex", alignItems: "center", gap: 32,
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }}>
            {["Features", "Integrations", "Pricing", "Blog"].map(l => (
              <span key={l} style={{
                fontSize: 14, fontWeight: 500, color: T.mid,
                cursor: "pointer", transition: "color .2s",
                letterSpacing: "-.1px",
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.ink}
              onMouseLeave={e => e.currentTarget.style.color = T.mid}
              >{l}</span>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button onClick={onLogin} style={{
              background: "transparent", border: "none",
              color: T.mid, fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              padding: "10px 18px", borderRadius: 50,
              transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.ink; e.currentTarget.style.background = T.paper; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.mid; e.currentTarget.style.background = "transparent"; }}
            >Login</button>
            <button onClick={onCTA} style={{
              background: T.ink, color: "white", border: "none",
              borderRadius: 50, padding: "10px 22px",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              transition: "all .22s",
              boxShadow: "0 2px 12px rgba(19,13,46,.18)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.p700; e.currentTarget.style.boxShadow = "0 4px 20px rgba(134,87,255,.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.ink; e.currentTarget.style.boxShadow = "0 2px 12px rgba(19,13,46,.18)"; e.currentTarget.style.transform = ""; }}
            >Start free →</button>
          </div>
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
              { icon: "🔌", label: "POS connected", sub: "Clover · Square · resOS" },
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
          <React.Fragment key={l}>
            <div className="proof-item">
              <div className="proof-n">{n}</div>
              <div className="proof-l">{l}</div>
            </div>
            {i < arr.length - 1 && <div className="proof-div" />}
          </React.Fragment>
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
              { span: 6, icon: "🔌", title: "Deep POS integrations", body: "Clover, Square, and resOS. One-click setup, real-time sync." },
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
