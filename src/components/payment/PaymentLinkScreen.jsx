import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { T } from "../../utils/tokens";
import PaymentConfirmScreen from "./PaymentConfirmScreen";

const API_URL = import.meta.env.VITE_API_URL || 'https://talkativ-backend.onrender.com';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CARD_STYLE = {
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

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Real Stripe checkout form (inside Elements provider) ─────────────────────
function CheckoutForm({ pi, amount, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError("");
    try {
      const card = elements.getElement(CardElement);
      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(pi, {
        payment_method: { card },
      });
      if (stripeErr) {
        setError(stripeErr.message || "Payment failed. Please try again.");
        setProcessing(false);
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        onPaid();
      } else {
        setError("Payment did not complete. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setProcessing(false);
    }
  };

  return (
    <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, boxShadow: `0 8px 32px rgba(134,87,255,.06)` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 16 }}>
        Card details
      </div>
      <div style={{ background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
        <CardElement options={CARD_STYLE} />
      </div>
      {error && (
        <div style={{ fontSize: 13, color: T.red, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={processing || !stripe}
        style={{ width: "100%", padding: "16px", background: processing || !stripe ? T.soft : T.ink, color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: processing || !stripe ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .22s", marginBottom: 12 }}>
        {processing ? "Processing…" : `Pay £${amount} →`}
      </button>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 12, color: T.soft }}>🔒 Secured by Stripe · 256-bit SSL encryption</span>
      </div>
    </div>
  );
}

// ─── Main payment page ────────────────────────────────────────────────────────
export default function PaymentLinkScreen({ onBack }) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState("");

  // Hash-router puts query params after the hash: /#/pay?pi=...
  const hash = window.location.hash;
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(qs);
  const pi            = params.get("pi");               // client_secret
  const orderId       = params.get("order_id");
  const reservationId = params.get("reservation_id");
  const type          = params.get("type");             // 'order' | 'reservation'

  useEffect(() => {
    const load = async () => {
      try {
        if (type === "order" && orderId) {
          const res = await fetch(`${API_URL}/api/public/order/${orderId}`);
          if (res.ok) setData(await res.json());
          else setFetchError("Could not load order details. The link may have expired.");
        } else if (type === "reservation" && reservationId) {
          const res = await fetch(`${API_URL}/api/public/reservation/${reservationId}`);
          if (res.ok) setData(await res.json());
          else setFetchError("Could not load reservation details. The link may have expired.");
        } else {
          setFetchError("Invalid payment link.");
        }
      } catch {
        setFetchError("Could not connect to server. Please try again.");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (paid) return <PaymentConfirmScreen onBack={onBack} data={data} type={type} />;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.paper }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${T.p200}`, borderTopColor: T.p600, borderRadius: "50%", animation: "ob-spin .65s linear infinite", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 14, color: T.soft }}>Loading payment details…</div>
        </div>
      </div>
    );
  }

  const businessName = data?.business?.name || "the restaurant";
  const isOrder = type === "order";
  const isReservation = type === "reservation";

  // Order specifics
  const orderAmount   = Number(data?.amount || 0).toFixed(2);
  const deliveryFee   = Number(data?.business?.orderingPolicy?.deliveryFee || 0);
  const itemsJson     = data?.itemsJson;  // [{name, qty, price}] — set by agent
  const itemsList     = data?.items ? data.items.split(",").map(s => s.trim()).filter(Boolean) : [];

  // Reservation specifics
  const depositAmount  = Number(data?.depositAmount || 0).toFixed(2);
  const depositPolicy  = data?.business?.reservationPolicy;
  const depositType    = depositPolicy?.depositType;
  const perGuestAmt    = depositPolicy?.depositAmount ? Number(depositPolicy.depositAmount) : null;

  const amount = isOrder ? orderAmount : depositAmount;

  return (
    <div style={{ minHeight: "100vh", background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo + heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.p500},${T.p700})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontStyle: "italic", fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>t</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.ink }}>talkativ</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            {businessName}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: T.ink, marginBottom: 6 }}>
            {isOrder ? "Complete your order" : "Confirm your reservation"}
          </h1>
          <p style={{ fontSize: 14, color: T.mid, fontWeight: 300 }}>
            {isOrder ? "Secure payment powered by Stripe" : "Pay deposit to secure your table"}
          </p>
        </div>

        {/* Summary card */}
        <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: `0 8px 32px rgba(134,87,255,.06)` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.soft, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 16 }}>
            {isOrder ? "Order summary" : "Reservation summary"}
          </div>

          {/* ── ORDER ── */}
          {isOrder && data && (
            <>
              {/* Type badge + customer name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 50,
                  background: data.type === "DELIVERY" ? "#eff6ff" : T.p50,
                  color: data.type === "DELIVERY" ? "#1d4ed8" : T.p700,
                  border: `1px solid ${data.type === "DELIVERY" ? "#bfdbfe" : T.p100}`,
                }}>
                  {data.type === "DELIVERY" ? "🚗 Delivery" : "🏃 Collection"}
                </span>
                {data.customerName && (
                  <span style={{ fontSize: 13, color: T.soft }}>for <strong style={{ color: T.ink }}>{data.customerName}</strong></span>
                )}
              </div>

              {/* Items list */}
              <div style={{ borderBottom: `1px solid ${T.paper}`, paddingBottom: 12, marginBottom: 12 }}>
                {itemsJson && itemsJson.length > 0 ? (
                  itemsJson.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: T.p50, color: T.p700, border: `1px solid ${T.p100}`, borderRadius: 4, padding: "1px 7px" }}>{item.qty}×</span>
                        <span style={{ fontSize: 14, color: T.ink }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>£{(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  itemsList.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.p400, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: T.ink }}>{item}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Delivery fee */}
              {data.type === "DELIVERY" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.paper}`, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.soft }}>Delivery fee</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: deliveryFee > 0 ? T.ink : "#15803d" }}>
                    {deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : "Free"}
                  </span>
                </div>
              )}

              {/* Delivery address */}
              {data.type === "DELIVERY" && data.deliveryAddress && (
                <div style={{ fontSize: 12, color: T.soft, marginBottom: 10 }}>
                  📍 Delivering to: <strong style={{ color: T.ink }}>{data.deliveryAddress}</strong>
                </div>
              )}

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1.5px solid ${T.line}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: T.p600 }}>£{orderAmount}</span>
              </div>
            </>
          )}

          {/* ── RESERVATION ── */}
          {isReservation && data && (
            <>
              {[
                ["Guest", data.guestName],
                ["Venue", businessName],
                ["Date & time", fmtDate(data.dateTime)],
                ["Party size", `${data.guests} guest${data.guests !== 1 ? "s" : ""}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.paper}` }}>
                  <span style={{ fontSize: 13, color: T.soft }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                </div>
              ))}

              {/* Deposit breakdown */}
              {depositType === "PER_GUEST" && perGuestAmt && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.paper}` }}>
                  <span style={{ fontSize: 13, color: T.soft }}>Deposit calculation</span>
                  <span style={{ fontSize: 13, color: T.soft }}>£{perGuestAmt.toFixed(2)} × {data.guests} guests</span>
                </div>
              )}

              {/* Deposit total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Deposit due</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: T.p600 }}>£{depositAmount}</span>
              </div>

              <div style={{ marginTop: 14, background: T.p50, border: `1px solid ${T.p100}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.p700 }}>
                This deposit secures your reservation. The remaining balance is settled at the venue.
              </div>
            </>
          )}

          {/* Fetch error (when no data) */}
          {fetchError && !data && (
            <div style={{ fontSize: 13, color: T.red, textAlign: "center", padding: "20px 0" }}>
              ⚠️ {fetchError}
            </div>
          )}
        </div>

        {/* Stripe payment form */}
        {pi && data && (
          <Elements stripe={stripePromise}>
            <CheckoutForm pi={pi} amount={amount} type={type} data={data} onPaid={() => setPaid(true)} />
          </Elements>
        )}

        {(!pi || !data) && !loading && (
          <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 20, padding: 28, textAlign: "center", color: T.red, fontSize: 13 }}>
            ⚠️ {fetchError || "Invalid payment link. Please contact the restaurant."}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 12, color: T.faint }}>
            Payment link generated by Talkativ AI · {businessName}
          </span>
        </div>
      </div>
    </div>
  );
}
