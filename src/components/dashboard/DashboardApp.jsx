import { useState, useEffect } from 'react';
import T from '../../utils/tokens';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext';
import { NAV } from '../../utils/constants';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageDashboard from './pages/PageDashboard';
import PageCalls from './pages/PageCalls';
import PageOrders from './pages/PageOrders';
import PageReservations from './pages/PageReservations';
import PageMyAgent from './pages/PageMyAgent';
import PageVoiceScript from './pages/PageVoiceScript';
import PageMenu from './pages/PageMenu';
import PageIntegrations from './pages/PageIntegrations';
import PageBilling from './pages/PageBilling';
import PageSettings from './pages/PageSettings';
import PageFaq from './pages/PageFaq';
import PageSupport from './pages/PageSupport';

const PAGE_MAP = {
  "Dashboard":        PageDashboard,
  "Calls":            PageCalls,
  "Orders":           PageOrders,
  "Reservations":     PageReservations,
  "My Agent":         PageMyAgent,
  "Voice & Script":   PageVoiceScript,
  "Menu":             PageMenu,
  "FAQs":             PageFaq,
  "Integrations":     PageIntegrations,
  "Billing":          PageBilling,
  "Settings":         PageSettings,
  "Customer Support": PageSupport,
};

export default function DashboardApp() {
  const { user } = useAuth();
  const [active, setActive] = useState("Dashboard");
  const [agentName, setAgentName] = useState("");
  const [bizName, setBizName] = useState("");
  const [agentData, setAgentData] = useState(null);
  const [bizData, setBizData] = useState(null);
  const [menuSynced, setMenuSynced] = useState(false);
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    api.agent.get().then(d => { if (d?.name) setAgentName(d.name); setAgentData(d); }).catch(() => {});
    api.business.get().then(d => { if (d?.name) setBizName(d.name); setBizData(d); }).catch(() => {});
    api.menu.getCategories().then(cats => { setMenuSynced(Array.isArray(cats) && cats.length > 0); }).catch(() => {});
    api.integrations.list().then(data => setIntegrations(Array.isArray(data) ? data : [])).catch(() => {});
    // Auto-open Integrations page after Stripe Connect OAuth redirect
    if (window.location.search.includes('stripe_connected=1') || window.location.search.includes('stripe_error=')) {
      setActive('Integrations');
      window.history.replaceState(null, '', window.location.pathname + '#/dashboard');
    }
  }, []);

  const [navSection, setNavSection] = useState(null);
  const nav = (p) => {
    // Support "Page:Section" format e.g. "Settings:Ordering"
    const [page, section] = p.split(":");
    setActive(page);
    setNavSection(section || null);
    document.body.classList.remove('mob-nav-open');
    window.scrollTo(0, 0);
  };
  const PageComponent = PAGE_MAP[active] || PageDashboard;
  const sharedProps = { onNav: nav, user, agentName, bizName, agentData, bizData, menuSynced, integrations, onAgentNameChange: setAgentName, onBizNameChange: setBizName, defaultSection: navSection };

  return (
    <div className="dash-wrap">
      <Sidebar active={active} onNav={nav} user={user} agentName={agentName} bizName={bizName} />
      <main className="dash-main" key={active + (navSection || "")}>
        <div className="dash-overlay" onClick={() => document.body.classList.remove('mob-nav-open')} />
        <PageComponent {...sharedProps} />
      </main>
    </div>
  );
}
