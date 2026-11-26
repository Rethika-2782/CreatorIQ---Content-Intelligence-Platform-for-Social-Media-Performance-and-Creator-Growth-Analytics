import { useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";

function fmtINR(n) {
  if (n == null) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function ProStrategist() {
  const [niche, setNiche] = useState("Tech, Education & Creator Economy");
  const [goal, setGoal] = useState("Grow subscribers and monthly ad/sponsorship revenue");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/pro/analyze", { niche, goal });
      setResult(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1>Pro Plan — AI Channel Strategist</h1>
          <p className="muted">Benchmark your channel against successful creators and forecast subscriber & revenue growth</p>
        </div>
      </div>

      <article className="card form-card">
        <h2><Icon name="crown" size={18} /> Ask the AI Strategist</h2>
        <form onSubmit={handleAnalyze}>
          <label>
            Your Content Niche
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g., Tech Reviews, Cooking, Finance" required />
          </label>
          <label>
            Primary Growth Goal
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Reach 100K subscribers and ₹50,000/month" required />
          </label>
          <button type="submit" className="btn-gold" disabled={loading}>
            <Icon name="crown" size={16} /> {loading ? "Analyzing Your Channel..." : "Analyze & Forecast Growth"}
          </button>
        </form>
      </article>

      {error && <div className="error">{error}</div>}

      {result && (
        <>
          <section className="kpis kpis-4">
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-violet"><Icon name="users" size={18} /></span><span className="kpi-label">Current Subscribers</span></div>
              <div className="kpi-main"><strong>{result.current_subs.toLocaleString()}</strong></div>
              <p className="kpi-sub">{result.channel_name}</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-gold"><Icon name="trending" size={18} /></span><span className="kpi-label">Projected Subs (6 Mo)</span></div>
              <div className="kpi-main"><strong>{result.projected_subs_6m.toLocaleString()}</strong></div>
              <p className="kpi-sub">With recommended strategy</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-green"><Icon name="revenue" size={18} /></span><span className="kpi-label">Est. Monthly Potential</span></div>
              <div className="kpi-main"><strong>{fmtINR(result.projected_monthly_revenue_inr)}</strong></div>
              <p className="kpi-sub">Illustrative AdSense + Sponsors</p>
            </article>
            <article className="card kpi">
              <div className="kpi-top"><span className="kpi-ico tone-indigo"><Icon name="analytics" size={18} /></span><span className="kpi-label">Avg Engagement</span></div>
              <div className="kpi-main"><strong>{result.current_avg_engagement}%</strong></div>
              <p className="kpi-sub">Current channel baseline</p>
            </article>
          </section>

          <article className="card">
            <div className="card-head"><h2>Benchmark vs. Top Channels</h2></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Metric</th><th>Your Channel</th><th>Top Channels</th><th>Recommended Action</th></tr>
                </thead>
                <tbody>
                  {result.benchmark_comparison.map((row) => (
                    <tr key={row.metric}>
                      <td><strong>{row.metric}</strong></td>
                      <td>{row.yours}</td>
                      <td><span className="role-tag">{row.top_channels}</span></td>
                      <td className="muted">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card">
            <div className="card-head"><h2>Actionable Improvement Strategies</h2></div>
            <ul className="insight-list">
              {result.strategies.map((s, idx) => (
                <li key={idx} className="insight-item">
                  <div className="insight-icon tone-gold">✦</div>
                  <div>{s}</div>
                </li>
              ))}
            </ul>
          </article>
        </>
      )}
    </AppLayout>
  );
}
