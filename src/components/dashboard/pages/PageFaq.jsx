import { useState, useEffect } from 'react';
import T from '../../../utils/tokens';
import { api } from '../../../api.js';
import TopBar from '../TopBar';

export default function PageFaq({ user, agentName }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [addingFaq, setAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editingFaqQ, setEditingFaqQ] = useState('');
  const [editingFaqA, setEditingFaqA] = useState('');
  const [savingFaq, setSavingFaq] = useState(false);
  const [faqError, setFaqError] = useState('');
  const [editFaqError, setEditFaqError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.faq.list()
      .then(d => { setFaqs(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const syncAgent = () => { api.agent.rebuildPrompt().catch(() => {}); };

  const handleAddFaq = async () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    setAddingFaq(true); setFaqError('');
    try {
      const created = await api.faq.create({ question: faqQuestion.trim(), answer: faqAnswer.trim() });
      setFaqs(prev => [...prev, created]);
      setFaqQuestion(''); setFaqAnswer('');
      syncAgent();
    } catch (e) { setFaqError(e.message || 'Failed to save FAQ. Please try again.'); }
    setAddingFaq(false);
  };

  const handleDeleteFaq = async (id) => {
    try {
      await api.faq.delete(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch {}
  };

  const startEditFaq = (faq) => { setEditingFaqId(faq.id); setEditingFaqQ(faq.question); setEditingFaqA(faq.answer); setEditFaqError(''); };
  const cancelEditFaq = () => { setEditingFaqId(null); setEditingFaqQ(''); setEditingFaqA(''); setEditFaqError(''); };

  const handleSaveFaq = async (id) => {
    setSavingFaq(true);
    setEditFaqError('');
    try {
      const updated = await api.faq.update(id, { question: editingFaqQ.trim(), answer: editingFaqA.trim() });
      setFaqs(prev => prev.map(f => f.id === id ? updated : f));
      cancelEditFaq();
      syncAgent();
    } catch (e) {
      setEditFaqError(e.message || 'Failed to save. Please try again.');
    }
    setSavingFaq(false);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", border: `1.5px solid ${T.line}`, borderRadius: 12, background: T.paper, color: T.ink, fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <TopBar title={<>FAQ <strong>Manager</strong></>} subtitle="Questions your agent will answer automatically on every call" user={user} agentName={agentName} />

      <div style={{ maxWidth: 720 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.soft, fontSize: 14 }}>Loading FAQs…</div>
        ) : faqs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 32px", marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 8 }}>No FAQs yet</div>
            <div style={{ fontSize: 13.5, color: T.soft, lineHeight: 1.6 }}>
              Add common questions and answers so your agent can handle them automatically on every call.
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-head">Your FAQs <span style={{ fontSize: 12, fontWeight: 500, color: T.soft }}>({faqs.length})</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {faqs.map((faq, idx) => (
                <div key={faq.id} style={{ background: T.paper, border: `1.5px solid ${editingFaqId === faq.id ? T.p300 : T.line}`, borderRadius: 14, padding: "14px 16px", transition: "border-color .2s" }}>
                  {editingFaqId === faq.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input value={editingFaqQ} onChange={e => setEditingFaqQ(e.target.value)} placeholder="Question" style={{ ...inputStyle, padding: "9px 12px", fontSize: 13, background: T.white }} />
                      <textarea rows={3} value={editingFaqA} onChange={e => setEditingFaqA(e.target.value)} placeholder="Answer" style={{ ...inputStyle, padding: "9px 12px", fontSize: 13, resize: "vertical", lineHeight: 1.5, background: T.white }} />
                      {editFaqError && <div style={{ fontSize: 12, color: T.red, background: T.redBg, border: `1px solid ${T.red}`, borderRadius: 8, padding: "7px 11px" }}>{editFaqError}</div>}
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={cancelEditFaq} style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${T.line}`, background: "transparent", color: T.mid, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
                        <button onClick={() => handleSaveFaq(faq.id)} disabled={savingFaq || !editingFaqQ.trim() || !editingFaqA.trim()} style={{ padding: "6px 14px", borderRadius: 9, border: "none", background: T.p600, color: "white", fontSize: 12.5, fontWeight: 700, cursor: savingFaq ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", opacity: savingFaq ? 0.7 : 1 }}>
                          {savingFaq ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: T.p500, background: T.p50, border: `1.5px solid ${T.p100}`, borderRadius: 6, padding: "2px 7px", marginTop: 1, flexShrink: 0 }}>Q{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginBottom: 5 }}>{faq.question}</div>
                          <div style={{ fontSize: 13, color: T.mid, lineHeight: 1.6 }}>{faq.answer}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => startEditFaq(faq)} style={{ padding: "5px 12px", borderRadius: 8, border: `1.5px solid ${T.line}`, background: T.white, color: T.mid, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Edit</button>
                        <button onClick={() => handleDeleteFaq(faq.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#FEE2E2", color: T.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-head">+ Add new FAQ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.soft, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>Question</label>
              <input
                value={faqQuestion}
                onChange={e => { setFaqQuestion(e.target.value); setFaqError(''); }}
                placeholder="e.g. Do you offer gluten-free options?"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.soft, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>Answer</label>
              <textarea
                rows={4}
                value={faqAnswer}
                onChange={e => { setFaqAnswer(e.target.value); setFaqError(''); }}
                placeholder="e.g. Yes! Several of our dishes are gluten-free. Ask your server for our allergen menu."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            {faqError && <div style={{ fontSize: 12, color: T.red, background: T.redBg, border: `1px solid ${T.red}`, borderRadius: 8, padding: "8px 12px" }}>{faqError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleAddFaq}
                disabled={addingFaq || !faqQuestion.trim() || !faqAnswer.trim()}
                className="btn-primary"
                style={{ fontSize: 14, padding: "10px 28px", opacity: addingFaq || !faqQuestion.trim() || !faqAnswer.trim() ? 0.6 : 1 }}
              >
                {addingFaq ? "Adding…" : "Add FAQ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
