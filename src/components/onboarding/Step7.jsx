import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { T } from "../../utils/tokens";
import { api } from "../../api.js";
import ObShell from "./ObShell";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

const PLAN_IDS = {
  starter: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || "",
  growth: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID || "",
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

// ─── Inner form (needs Stripe context) ────────────────────────────────────────
function PlanForm({ onNext, onBack }) {
  const stripe = useStripe();
  const elements = useElements();

  const [plan, setPlan] = useState(1); // 0=Starter, 1=Growth
  const [currency, setCurrency] = useState("GBP");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  // Fetch business currency
  useEffect(() => {
    api.business
      .get()
      .then((d) => {
        if (d?.currency) setCurrency(d.currency);
      })
      .catch(() => {});
  }, []);

  // Create SetupIntent on mount
  useEffect(() => {
    api.billing
      .createSetupIntent()
      .then((d) => {
        if (d?.clientSecret) setClientSecret(d.clientSecret);
      })
      .catch((err) => {
        console.error("Failed to create setup intent:", err);
        setError("Could not initialize payment. You can set this up later.");
      });
  }, []);

  const prices = PLAN_PRICES[currency] || PLAN_PRICES.GBP;
  const planKey = plan === 0 ? "starter" : "growth";

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setSaving(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      // Confirm the SetupIntent to save the card
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Card verification failed.");
        setSaving(false);
        return;
      }

      // Card saved successfully — now create the subscription
      const priceId = PLAN_IDS[planKey];

      await api.billing.subscribe({
        plan: planKey.toUpperCase(),
        priceId,
        paymentMethodId: setupIntent.payment_method,
      });

      // Complete onboarding
      try {
        await api.business.completeOnboarding();
      } catch (e) {
        console.error("completeOnboarding failed:", e);
      }

      onNext();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ObShell
      step={7}
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={saving ? "Processing…" : "Start free trial →"}
    >
      <div className="ob-step-label">Step 8 · Plan</div>
      <h1 className="ob-heading">
        Choose your
        <br />
        <em>plan</em>
      </h1>
      <p className="ob-subheading">
        14-day free trial on all plans. No charge until your trial ends — cancel
        any time.
      </p>

      {/* Plan cards */}
      <div className="plan-grid">
        {[
          {
            nm: "Starter",
            pr: fmtPrice(prices.starter, currency),
            fs: [
              "100% calls answered",
              "Menu Q&A & information",
              "Basic call analytics",
              "Email support",
            ],
          },
          {
            nm: "Growth",
            pr: fmtPrice(prices.growth, currency),
            fs: [
              "Everything in Starter",
              "Takeout & delivery orders",
              "Reservation booking",
              "POS integration",
              "Priority support",
            ],
            pop: true,
          },
        ].map((p, i) => (
          <div
            key={p.nm}
            className={`plan-card ${plan === i ? "selected" : ""}`}
            onClick={() => setPlan(i)}
          >
            {p.pop && <div className="plan-popular-badge">Most popular</div>}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
              }}
            >
              <div>
                <div className="plan-name">{p.nm}</div>
                <div className="plan-price">
                  {p.pr}
                  <span>/mo</span>
                </div>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${plan === i ? T.p500 : T.faint}`,
                  background: plan === i ? T.p500 : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {plan === i && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "white",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="plan-feature-list">
              {p.fs.map((f) => (
                <div key={f} className="plan-feature">
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stripe Card Element */}
      <div className="info-block">
        <div
          style={{
            fontWeight: 700,
            color: T.ink,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          💳 Payment details
        </div>

        <div
          style={{
            background: T.white,
            border: `1.5px solid ${T.line}`,
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 12,
          }}
        >
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: T.red,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            fontSize: 12,
            color: T.soft,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={T.soft}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
          </svg>
          Secured by Stripe · You won't be charged until your 14-day trial ends
        </div>
      </div>

      {/* Test card hint (dev only) */}
      <div
        style={{
          marginTop: 14,
          background: T.paper,
          border: `1.5px solid ${T.line}`,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 14 }}>🧪</span>
        <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.5 }}>
          <strong style={{ color: T.mid }}>Test mode</strong> — Use card{" "}
          <code
            style={{
              background: T.p50,
              padding: "1px 6px",
              borderRadius: 4,
              fontSize: 11.5,
              color: T.p700,
              fontWeight: 600,
            }}
          >
            4242 4242 4242 4242
          </code>{" "}
          with any future expiry and any CVC.
        </div>
      </div>
    </ObShell>
  );
}

// ─── Wrapper with Stripe Elements provider ────────────────────────────────────
export default function Step7({ onNext, onBack }) {
  return (
    <Elements stripe={stripePromise}>
      <PlanForm onNext={onNext} onBack={onBack} />
    </Elements>
  );
}
