const fs = require('fs');

const expertSource = fs.readFileSync('c:/Users/olade/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/C8CD06F16DD4BC443AE23E827127AE5752ED602E/transfers/2026-12/talkativ-expert.jsx', 'utf8');
const pagesSource = fs.readFileSync('c:/Users/olade/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/C8CD06F16DD4BC443AE23E827127AE5752ED602E/transfers/2026-12/talkativ-dashboard-pages (1).jsx', 'utf8');

// 1. Extract block 1: Tokens, CSS, Landing + Onboarding from expertSource
let landingPart = expertSource.substring(0, expertSource.indexOf('function Dashboard({'));

const gStartIndex = landingPart.indexOf('const G =');
const gEndIndex = landingPart.indexOf('`;', gStartIndex);
let originalG = landingPart.substring(gStartIndex, gEndIndex + 2);

// Inject the responsive CSS
const responsiveCSS = `
/* ── RESPONSIVE CLASSES ── */
.resp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.resp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.resp-grid-dashboard-hub { display: grid; grid-template-columns: 1fr 340px; gap: 18px; }

.resp-show-mobile { display: none !important; }

/* ── MEDIA QUERIES ── */
@media (max-width: 1024px) {
  .bento-stack { margin-top: 32px; }
  .bento-main { position: relative; }
  
  /* Off-canvas Navigation Overlay */
  .dash-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 900;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
  }
  body.mob-nav-open .dash-overlay { opacity: 1; pointer-events: auto; }
  body.mob-nav-open { overflow: hidden; }

  /* Hamburger Toggle */
  .resp-show-mobile { display: block !important; }

  /* Off-canvas Sidebar */
  .dash-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 280px; height: 100vh;
    z-index: 1000; box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  body.mob-nav-open .dash-sidebar { transform: translateX(0); }
  .dash-main { padding: 36px 32px; }
}

@media (max-width: 768px) {
  .hero-wrap, .ob-wrap, .feat-card, .testi-grid, .footer-cta { display: flex; flex-direction: column; }
  .hero-left, .hero-right { padding: 40px 24px; }
  .features-section, .testi-section { padding: 60px 24px; }
  .ob-sidebar { width: 100%; border-right: none; border-bottom: 1.5px solid #EBE6F5; padding: 24px; }
  .ob-main { padding: 24px; }
  .nav-center { display: none; }
  .nav { padding: 0 24px; }

  /* Grid Fallbacks */
  .resp-grid-2, .resp-grid-3, .resp-grid-dashboard-hub, .kpi-row, .dash-grid {
    grid-template-columns: 1fr !important;
  }
  .dash-main { padding: 24px 20px; }
  .card { overflow-x: auto; scrollbar-width: none; }
  .live-banner { flex-direction: column; text-align: center; gap: 12px; }
  .lb-wave { margin: 10px auto; }
  .lb-btn { margin-left: 0; }
  .proof-bar { padding: 24px; flex-direction: column; gap: 16px; }
  .proof-div { display: none; }
}
`;

let newG = originalG.replace(/`;\s*$/, '\\n' + responsiveCSS + '\\n`;');
landingPart = landingPart.substring(0, gStartIndex) + newG + landingPart.substring(gEndIndex + 2);

// 2. Extract block 2: Dashboard Pages from pagesSource
const navIndex = pagesSource.indexOf('const NAV = [');
let dashboardPart = pagesSource.slice(navIndex);

// Remove the inline App component from dashboardPart
const dashAppIndex = dashboardPart.indexOf('export default function App() {');
if (dashAppIndex !== -1) {
    dashboardPart = dashboardPart.slice(0, dashAppIndex);
}

// Strip Italics from Dashboard features
dashboardPart = dashboardPart.replace(/<em>(.*?)<\/em>/g, "<strong>$1</strong>");
dashboardPart = dashboardPart.replace(/fontStyle:\s*["']italic["']/gi, 'fontWeight: "700"');

// Dynamically port responsive classnames by removing hardcoded grids
dashboardPart = dashboardPart.replace(/style={{display:"grid",gridTemplateColumns:"1fr 3[0-9]{2}px",gap:[0-9]+.*?}}/gi, 'className="resp-grid-dashboard-hub"');
dashboardPart = dashboardPart.replace(/style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:[0-9]+.*?}}/gi, 'className="resp-grid-dashboard-hub"');
dashboardPart = dashboardPart.replace(/style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:[0-9]+.*?}}/gi, 'className="resp-grid-2"');
dashboardPart = dashboardPart.replace(/style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:[0-9]+.*?}}/gi, 'className="resp-grid-3"');
dashboardPart = dashboardPart.replace(/style={{display:"grid",gridTemplateColumns:"repeat\\(3.*?\\)",gap:[0-9]+.*?}}/gi, 'className="resp-grid-3"');

// Note: In kpi-row, the replacement matches things safely too
dashboardPart = dashboardPart.replace(/<div style={{display:"grid",gridTemplateColumns:"repeat\\(4.*?\\)".*?}}>/gi, '<div className="kpi-row">');


// Inject Hamburger nav wrappers for the dashboard screens
dashboardPart = dashboardPart.replace(
  /(<div className="dash-topbar"[^>]*>\s*)<div>/g,
  `$1<div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>\n        <button className="resp-show-mobile" onClick={() => document.body.classList.add('mob-nav-open')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>\n        <div>`
);

// Safely close the injected div right before the dash-topbar-right wrapper
dashboardPart = dashboardPart.replace(
  /(\s*)<\/div>\n(\s*)<div className="dash-topbar-right"/g,
  `$1</div>\n$1</div>\n$2<div className="dash-topbar-right"`
);

// 3. Construct Final React Application
const unifiedApp = `
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

  const nextOb = () => { if (step < 7) { setStep(step + 1); go(\`ob\${step + 1}\`); } else go("success"); };
  const backOb = () => { if (step > 0) { setStep(step - 1); go(\`ob\${step - 1}\`); } else go("landing"); };

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
`;

fs.writeFileSync('c:/Users/olade/Desktop/code projects/talkativ/talkativ-expert-ui/src/App.jsx', landingPart + '\\n\\n' + dashboardPart + '\\n\\n' + unifiedApp);
console.log('Merge operations executed successfully!');
