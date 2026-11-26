import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";

function fmtINR(n) {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function RevenueAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "sponsorship", brand: "", amount: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/api/revenue/summary")
      .then((res) => setData(res.data))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/revenue/entry", {
        type: form.type,
        brand: form.brand.trim(),
        amount: parseFloat(form.amount),
        description: form.description.trim(),
      });
      setForm({ type: "sponsorship", brand: "", amount: "", description: "" });
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/revenue/entry/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1 className="gradient-text">Revenue Analytics</h1>
          <p className="muted">Illustrative AdSense estimates & manual sponsorship/affiliate tracking</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : data && (
        <>
          <section className="kpis kpis-4">
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-gold"><Icon name="revenue" size={18}/></span><span className="kpi-label">Est. AdSense (Illustrative)</span></div>
              <div className="kpi-main"><strong>{fmtINR(data.est_adsense_inr)}</strong></div>
              <p className="kpi-sub">Based on {data.total_views_used?.toLocaleString()} views (~$2 CPM)</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-violet"><Icon name="star" size={18}/></span><span className="kpi-label">Sponsorships (Manual)</span></div>
              <div className="kpi-main"><strong>{fmtINR(data.sponsorship_total)}</strong></div>
              <p className="kpi-sub">Brand deals & integrations</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-green"><Icon name="link" size={18}/></span><span className="kpi-label">Affiliate Income (Manual)</span></div>
              <div className="kpi-main"><strong>{fmtINR(data.affiliate_total)}</strong></div>
              <p className="kpi-sub">Referral & affiliate links</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-indigo"><Icon name="crown" size={18}/></span><span className="kpi-label">Combined Total</span></div>
              <div className="kpi-main"><strong>{fmtINR(data.grand_total_inr)}</strong></div>
              <p className="kpi-sub">Estimated + Manual entries</p>
            </article>
          </section>

          <div style={{ background:"#fdf8ed", border:"1px solid #f0d78a", borderRadius:12, padding:"14px 18px", fontSize:"0.88rem", color:"#6b7280" }}>
            <strong style={{ color:"#9a7a2e" }}>Note:</strong> {data.disclaimer}
          </div>

          <div className="row row-a">
            {/* Add entry form */}
            <article className="card form-card">
              <h2>Add Sponsorship / Affiliate Income</h2>
              <form onSubmit={handleAdd}>
                <label>
                  Income Type
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Brand / Source Name
                  <input required placeholder="e.g., Notion, Amazon Associates" value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </label>
                <label>
                  Amount (INR)
                  <input required type="number" min="1" step="any" placeholder="e.g., 15000" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </label>
                <label>
                  Description (Optional)
                  <input placeholder="e.g., Dedicated 60s integration" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? "Saving..." : "Add Income Entry"}
                </button>
              </form>
            </article>

            {/* Entries list */}
            <article className="card">
              <div className="card-head">
                <h2><Icon name="revenue" size={16}/> Manual Income Records</h2>
              </div>
              {data.entries.length === 0 ? (
                <p className="muted" style={{ textAlign:"center", padding:"32px 0" }}>
                  No manual entries yet. Add your sponsorships or affiliate income on the left.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Brand</th><th>Type</th><th>Amount</th><th>Date</th><th></th></tr>
                    </thead>
                    <tbody>
                      {data.entries.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <strong>{e.brand}</strong>
                            {e.description && <div style={{ fontSize:"0.76rem", color:"var(--muted)" }}>{e.description}</div>}
                          </td>
                          <td><span className="role-tag">{e.type}</span></td>
                          <td><strong>{fmtINR(e.amount)}</strong></td>
                          <td className="muted">{e.date}</td>
                          <td>
                            <button className="icon-btn" style={{ width:32, height:32 }} onClick={() => handleDelete(e.id)} title="Delete">
                              <Icon name="trash" size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </div>
        </>
      )}
    </AppLayout>
  );
}
