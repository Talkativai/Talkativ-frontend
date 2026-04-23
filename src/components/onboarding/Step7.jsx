import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;
const IS_TEST_MODE = STRIPE_KEY?.startsWith('pk_test_') ?? true;

// Fixed prices per currency (ISO 4217 codes)
const PLAN_PRICES = {
  GBP: { growth: 99, pro: 179 },
  EUR: { growth: 119, pro: 209 },
  USD: { growth: 119, pro: 219 },
  AUD: { growth: 189, pro: 339 },
  CAD: { growth: 169, pro: 299 },
  NZD: { growth: 209, pro: 369 },
  CHF: { growth: 109, pro: 199 },
  SEK: { growth: 1299, pro: 2399 },
  NOK: { growth: 1299, pro: 2399 },
  DKK: { growth: 849, pro: 1549 },
  SGD: { growth: 169, pro: 299 },
  HKD: { growth: 949, pro: 1749 },
  ZAR: { growth: 2299, pro: 4199 },
  NGN: { growth: 199000, pro: 359000 },
};

const PLAN_IDS = {
  growth: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID || "",
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || "",
};

const fmtPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "'Outfit', sans-serif",
      color: "#130D2E",
      letterSpacing: "0.3px",
      "::placeholder": { color: "#C4BFD6" },
    },
    invalid: { color: "#EF4444" },
  },
};

const PLAN_NAMES = ["Growth", "Pro"];

// ─── Shared plan cards component ─────────────────────────────────────────────
function PlanCards({ plan, setPlan, prices, currency, subscribed }) {
  const plans = [
    {
      nm: "Growth", key: "growth",
      pr: fmtPrice(prices.growth, currency),
      fs: ["500 calls/month", "100% calls answered 24/7", "Orders & reservations", "SumUp + Stripe payments", "Menu Q&A & analytics", "Email support"],
    },
    {
      nm: "Pro", key: "pro",
      pr: fmtPrice(prices.pro, currency),
      fs: ["1,000 calls/month", "Everything in Growth", "Square, Clover & Zettle POS", "resOS & ResDiary booking", "Full POS integration", "Priority support"],
      pop: true,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
      {/* Growth & Pro selectable cards */}
      {plans.map((p, i) => (
        <div
          key={p.nm}
          className={`plan-card ${plan === i ? "selected" : ""}`}
          onClick={() => !subscribed && setPlan(i)}
          style={{ cursor: subscribed ? "default" : "pointer", opacity: subscribed && plan !== i ? 0.45 : 1, padding: "22px 18px" }}
        >
          {p.pop && <div className="plan-popular-badge">Most popular</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div className="plan-name">{p.nm}</div>
              <div className="plan-price" style={{ fontSize: 30 }}>{p.pr}<span>/mo</span></div>
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              border: `2px solid ${plan === i ? T.p500 : T.faint}`,
              background: plan === i ? T.p500 : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {plan === i && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />}
            </div>
          </div>
          <div className="plan-feature-list">
            {p.fs.map(f => <div key={f} className="plan-feature" style={{ fontSize: 12 }}>{f}</div>)}
          </div>
        </div>
      ))}

      {/* Enterprise — contact sales card */}
      <div style={{
        border: `1.5px solid ${T.line}`, borderRadius: 22, padding: "22px 18px",
        background: T.ink, display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".8px" }}>Enterprise</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "white", marginBottom: 14 }}>Custom</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 14 }}>
            Unlimited calls · Full platform access · Dedicated support · Custom SLA
          </div>
        </div>
        <a
          href="mailto:product@uvanatech.com?subject=Talkativ Enterprise enquiry"
          style={{
            display: "block", textAlign: "center", background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.2)", color: "white", borderRadius: 50,
            padding: "9px 0", fontSize: 12.5, fontWeight: 600, textDecoration: "none",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Contact sales →
        </a>
      </div>
    </div>
  );
}

// ─── Success confirmation card ────────────────────────────────────────────────
function TrialActivatedCard({ planName, currency, prices }) {
  const planKey = planName.toLowerCase(); // "growth" or "pro"
  const price = fmtPrice(prices[planKey] ?? prices.growth, currency);
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
      border: "1.5px solid #bbf7d0",
      borderRadius: 16, padding: "22px 24px", marginTop: 16,
      animation: "fadeUp .4s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
          boxShadow: "0 4px 12px rgba(34,197,94,.25)",
        }}>✓</div>
        <div>
          <div style={{ fontWeight: 700, color: "#15803d", fontSize: 15 }}>
            14-day free trial activated
          </div>
          <div style={{ fontSize: 13, color: "#166534", marginTop: 2 }}>
            {planName} plan · {price}/mo after trial
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#166534", background: "rgba(255,255,255,.6)", borderRadius: 10, padding: "10px 14px" }}>
        You won't be charged until <strong>{trialEnd}</strong>. Cancel any time before then.
      </div>
    </div>
  );
}

// ─── Test Mode Plan Form (auto-attaches Stripe test card, no manual entry) ───
function PlanFormTest({ onNext, onBack }) {
  const [plan, setPlan] = useState(0); // default to Growth (index 0)
  const [currency, setCurrency] = useState("GBP");
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.business.get().then((d) => { if (d?.currency) setCurrency(d.currency); }).catch(() => {});
    api.billing.get().then((d) => {
      if (d?.plan && d.plan !== 'NONE' && d.status !== 'NO_SUBSCRIPTION') {
        setPlan(d.plan === 'PRO' || d.plan === 'ENTERPRISE' ? 1 : 0);
        setSubscribed(true);
      }
    }).catch(() => {});
  }, []);

  const prices = PLAN_PRICES[currency] || PLAN_PRICES.GBP;
  const planKey = plan === 0 ? "growth" : "pro";
  const planName = PLAN_NAMES[plan];

  const handleSubscribe = async () => {
    if (subscribed) { onNext(); return; }
    setSaving(true);
    setError("");
    try {
      // Try attaching test card via Stripe (sk_test_ key required)
      await api.billing.attachTestCard({
        plan: planKey.toUpperCase(),
        priceId: PLAN_IDS[planKey],
      });
      setSubscribed(true);
    } catch (e) {
      // Fallback: no Stripe keys in dev — create a local trial record
      try {
        await api.billing.subscribe({ plan: planKey.toUpperCase(), priceId: "" });
        setSubscribed(true);
      } catch (e2) {
        setError(e2?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!subscribed) return;
    try { await api.business.completeOnboarding(); } catch {}
    onNext();
  };

  return (
    <ObShell
      step={7}
      onNext={subscribed ? handleNext : handleSubscribe}
      onBack={onBack}
      nextLabel={saving ? "Activating trial…" : subscribed ? "Continue →" : "Start free trial →"}
      loading={saving}
      nextDisabled={false}
    >
      <div className="ob-step-label">Step 8 · Plan</div>
      <h1 className="ob-heading">Choose your<br /><em>plan</em></h1>
      <p className="ob-subheading">14-day free trial on all plans. No charge until your trial ends — cancel any time.</p>

      <PlanCards plan={plan} setPlan={setPlan} prices={prices} currency={currency} subscribed={subscribed} />

      {/* Billing account block — only shown before subscribing */}
      {!subscribed && (
        <div className="info-block">
          <div style={{ fontWeight: 700, color: T.ink, marginBottom: 16, fontSize: 14 }}>💳 Billing account</div>

          <div style={{
            background: "linear-gradient(135deg,#130D2E,#2D2150)",
            borderRadius: 16, padding: "20px 22px", marginBottom: 16,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>Test Account</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "white", letterSpacing: 4, marginBottom: 16, fontFamily: "monospace" }}>•••• •••• •••• 4242</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>VALID THRU</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>12/{new Date().getFullYear() + 3}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: 1 }}>VISA</div>
            </div>
          </div>

          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "#15803d" }}>
            ✓ A <strong>Stripe test account</strong> will be set up automatically — no card details needed.
            You can manage it from the billing dashboard.
          </div>

          {error && (
            <div style={{ fontSize: 13, color: T.red, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>⚠️ {error}</div>
          )}

          <div style={{ fontSize: 12, color: T.soft, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={T.soft}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            Secured by Stripe · You won't be charged until your 14-day trial ends
          </div>
        </div>
      )}

      {/* Success confirmation — shown after subscribing */}
      {subscribed && (
        <TrialActivatedCard planName={planName} currency={currency} prices={prices} />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ObShell>
  );
}

// ─── Live Mode Plan Form (manual card entry via Stripe Elements) ──────────────
function PlanFormLive({ onNext, onBack }) {
  const stripe = useStripe();
  const elements = useElements();

  const [plan, setPlan] = useState(0); // default to Growth
  const [currency, setCurrency] = useState("GBP");
  const [saving, setSaving] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(true);

  useEffect(() => {
    api.business.get().then((d) => { if (d?.currency) setCurrency(d.currency); }).catch(() => {});
    api.billing.get().then((d) => {
      if (d?.plan && d.plan !== 'NONE' && d.status !== 'NO_SUBSCRIPTION') {
        setPlan(d.plan === 'PRO' || d.plan === 'ENTERPRISE' ? 1 : 0);
        setSubscribed(true);
        setLoadingSecret(false);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (subscribed) return;
    if (!STRIPE_KEY) { setLoadingSecret(false); return; }
    api.billing.createSetupIntent()
      .then((d) => { if (d?.clientSecret) setClientSecret(d.clientSecret); })
      .catch(() => setError("Could not initialise payment. Please refresh and try again."))
      .finally(() => setLoadingSecret(false));
  }, [subscribed]);

  const prices = PLAN_PRICES[currency] || PLAN_PRICES.GBP;
  const planKey = plan === 0 ? "growth" : "pro";
  const planName = PLAN_NAMES[plan];

  const handleSubscribe = async () => {
    if (!stripe || !elements) return;
    setSaving(true);
    setError("");
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        setError(stripeError.message || "Card verification failed.");
        setSaving(false);
        return;
      }

      await api.billing.subscribe({
        plan: planKey.toUpperCase(),
        priceId: PLAN_IDS[planKey],
        paymentMethodId: setupIntent.payment_method,
      });
      setSubscribed(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!subscribed) return;
    try { await api.business.completeOnboarding(); } catch {}
    onNext();
  };

  const isCardReady = cardComplete && !loadingSecret && !!clientSecret;

  return (
    <ObShell
      step={7}
      onNext={subscribed ? handleNext : handleSubscribe}
      onBack={onBack}
      nextLabel={saving ? "Processing…" : subscribed ? "Continue →" : "Start free trial →"}
      loading={saving}
      nextDisabled={!subscribed && !isCardReady}
    >
      <div className="ob-step-label">Step 8 · Plan</div>
      <h1 className="ob-heading">Choose your<br /><em>plan</em></h1>
      <p className="ob-subheading">14-day free trial on all plans. No charge until your trial ends — cancel any time.</p>

      <PlanCards plan={plan} setPlan={setPlan} prices={prices} currency={currency} subscribed={subscribed} />

      {/* Card input — only shown before subscribing */}
      {!subscribed && (
        <div className="info-block">
          <div style={{ fontWeight: 700, color: T.ink, marginBottom: 16, fontSize: 14 }}>💳 Payment details</div>
          {loadingSecret ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0", color: T.soft, fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: `2px solid ${T.p200}`, borderTopColor: T.p600, borderRadius: "50%", animation: "ob-spin .65s linear infinite", flexShrink: 0 }} />
              Preparing payment form…
            </div>
          ) : (
            <div style={{ background: T.white, border: `1.5px solid ${cardComplete ? T.p300 : T.line}`, borderRadius: 12, padding: "14px 18px", marginBottom: 12, transition: "border-color .2s" }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => setCardComplete(e.complete)} />
            </div>
          )}
          {!cardComplete && !loadingSecret && (
            <div style={{ fontSize: 12, color: T.soft, marginBottom: 10 }}>
              Enter your card details above to continue
            </div>
          )}
          {error && (
            <div style={{ fontSize: 13, color: T.red, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>⚠️ {error}</div>
          )}
          <div style={{ fontSize: 12, color: T.soft, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={T.soft}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            Secured by Stripe · You won't be charged until your 14-day trial ends
          </div>
        </div>
      )}

      {/* Success confirmation */}
      {subscribed && (
        <TrialActivatedCard planName={planName} currency={currency} prices={prices} />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ObShell>
  );
}

// ─── Wrapper with Stripe Elements provider ────────────────────────────────────
// In test mode: uses auto-attach flow (no manual card entry)
// In live mode: shows full Stripe Elements card form
export default function Step7({ onNext, onBack }) {
  if (IS_TEST_MODE) {
    return <PlanFormTest onNext={onNext} onBack={onBack} />;
  }
  return (
    <Elements stripe={stripePromise}>
      <PlanFormLive onNext={onNext} onBack={onBack} />
    </Elements>
  );
}
