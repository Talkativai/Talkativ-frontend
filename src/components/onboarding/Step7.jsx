import { useState, useEffect } from "react";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";

// Fixed prices per currency (ISO 4217 codes)
const PLAN_PRICES = {
  GBP: { starter: 199, growth: 399 },
  EUR: { starter: 229, growth: 459 },
  USD: { starter: 249, growth: 499 },
  AUD: { starter: 379, growth: 749 },
  CAD: { starter: 339, growth: 679 },
  NZD: { starter: 419, growth: 829 },
  CHF: { starter: 219, growth: 439 },
  SEK: { starter: 2699, growth: 5399 },
  NOK: { starter: 2699, growth: 5399 },
  DKK: { starter: 1699, growth: 3399 },
  SGD: { starter: 339, growth: 679 },
  HKD: { starter: 1949, growth: 3899 },
  ZAR: { starter: 4599, growth: 9199 },
  NGN: { starter: 399000, growth: 799000 },
};

const fmtPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export default function Step7({ onNext, onBack }) {
  const [plan, setPlan] = useState(1);
  const [currency, setCurrency] = useState('GBP');

  useEffect(() => {
    api.business.get()
      .then(d => { if (d?.currency) setCurrency(d.currency); })
      .catch(() => {});
  }, []);

  const prices = PLAN_PRICES[currency] || PLAN_PRICES.GBP;

  return (
    <ObShell step={7} onNext={onNext} onBack={onBack} nextLabel="Start free trial →">
      <div className="ob-step-label">Step 8 · Plan</div>
      <h1 className="ob-heading">Choose your<br /><em>plan</em></h1>
      <p className="ob-subheading">14-day free trial on all plans. No charge until your trial ends — cancel any time.</p>
      <div className="plan-grid">
        {[
          { nm: "Starter", pr: fmtPrice(prices.starter, currency), fs: ["100% calls answered", "Menu Q&A & information", "Basic call analytics", "Email support"] },
          { nm: "Growth", pr: fmtPrice(prices.growth, currency), fs: ["Everything in Starter", "Takeout & delivery orders", "Reservation booking", "POS integration", "Priority support"], pop: true },
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
