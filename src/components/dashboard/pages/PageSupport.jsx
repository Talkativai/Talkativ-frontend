import { useState } from 'react';
import T from '../../../utils/tokens';
import TopBar from '../TopBar';
import { api } from '../../../api.js';

const deriveMerchantId = (bizId) =>
  bizId ? bizId.replace(/-/g, '').substring(0, 12).toUpperCase() : '';

const CATEGORIES = [
  { key: 'Agent',         icon: '🤖', desc: 'Voice agent, calls, script issues' },
  { key: 'Billing',       icon: '💳', desc: 'Invoices, charges, plans' },
  { key: 'Payment',       icon: '💰', desc: 'Payment failures, refunds' },
  { key: 'Account Setup', icon: '⚙️',  desc: 'Profile, credentials, onboarding' },
  { key: 'Integration',   icon: '🔗', desc: 'POS, Square, Clover, resOS' },
];

export default function PageSupport({ user, agentName, bizData }) {
  const [category, setCategory] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail]       = useState(bizData?.email || user?.email || '');
  const [phone, setPhone]       = useState(bizData?.phone || '');
  const [merchantId, setMerchantId] = useState(deriveMerchantId(bizData?.id));
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState(null);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setSuccess(false);
    setError(null);
    setSubject('');
    setMessage('');
    // Re-sync autofill in case bizData loaded after mount
    setEmail(bizData?.email || user?.email || '');
    setPhone(bizData?.phone || '');
    setMerchantId(deriveMerchantId(bizData?.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in the subject and message.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api.support.submitTicket({ category: category.key, subject, message, email, phone, merchantId });
      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="dash-page">
      <TopBar title="Customer Support" agentName={agentName} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 4px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: '0 0 6px' }}>How can we help?</h2>
          <p style={{ fontSize: 14, color: T.soft, margin: 0 }}>Select a topic below to create a support ticket.</p>
        </div>

        {/* Category cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12, marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.key}
              onClick={() => handleCategorySelect(cat)}
              style={{
                background: category?.key === cat.key ? T.p50 : T.white,
                border: `1.5px solid ${category?.key === cat.key ? T.p400 : T.line}`,
                borderRadius: 14,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all .15s',
                boxShadow: category?.key === cat.key ? `0 0 0 3px ${T.p100}` : 'none',
              }}
              onMouseEnter={e => { if (category?.key !== cat.key) e.currentTarget.style.borderColor = T.p200; }}
              onMouseLeave={e => { if (category?.key !== cat.key) e.currentTarget.style.borderColor = T.line; }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: category?.key === cat.key ? T.p700 : T.ink, marginBottom: 3 }}>{cat.key}</div>
              <div style={{ fontSize: 11.5, color: T.soft, lineHeight: 1.4 }}>{cat.desc}</div>
            </div>
          ))}
        </div>

        {/* Form — shown when a category is selected */}
        {category && !success && (
          <div style={{ background: T.white, border: `1.5px solid ${T.line}`, borderRadius: 16, padding: '24px 28px', animation: 'fadeUp .2s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.p400},${T.p700})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {category.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{category.key} Support</div>
                <div style={{ fontSize: 12, color: T.soft }}>Fill in the form below and we'll get back to you</div>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Subject */}
              <div className="form-group">
                <label className="form-label">Subject <span style={{ color: T.red }}>*</span></label>
                <input
                  className="form-input"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={`e.g. My agent isn't answering calls after 6 PM`}
                  required
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label">Message <span style={{ color: T.red }}>*</span></label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail — include any error messages, steps to reproduce, or screenshots if relevant."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Email & Phone side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+44 7000 000000"
                  />
                </div>
              </div>

              {/* Merchant ID */}
              <div className="form-group">
                <label className="form-label">
                  Merchant ID
                  <span style={{ fontSize: 11, color: T.soft, fontWeight: 400, marginLeft: 6 }}>(auto-filled — helps us find your account faster)</span>
                </label>
                <input
                  className="form-input"
                  value={merchantId}
                  onChange={e => setMerchantId(e.target.value)}
                  placeholder="Your merchant ID"
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: sending ? T.p300 : `linear-gradient(135deg,${T.p500},${T.p700})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: "'Outfit',sans-serif",
                  marginTop: 4,
                  transition: 'all .2s',
                }}
              >
                {sending ? 'Sending…' : 'Send message →'}
              </button>
            </form>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 16, padding: '28px 32px', textAlign: 'center', animation: 'fadeUp .25s ease both' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#166534', marginBottom: 8 }}>Ticket submitted!</div>
            <div style={{ fontSize: 14, color: '#15803d', lineHeight: 1.6 }}>
              Our customer support will get back to you within a day.
            </div>
            <button
              onClick={() => { setSuccess(false); setCategory(null); }}
              style={{ marginTop: 20, background: 'transparent', border: `1.5px solid #bbf7d0`, borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#16a34a', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}
            >
              Submit another ticket
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
