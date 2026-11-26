import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const DONUT_COLORS = ["#2D4A3E", "#B08D57", "#1C1917", "#6B655E", "#8C6D3F"];
const TIP = { borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 12 };

function fmt(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Number(n).toLocaleString();
}

export default function AudienceAnalytics() {
  const [overview, setOverview] = useState(null);
  const [audienceData, setAudienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/analytics/overview"),
      api.get("/api/analytics/audience"),
    ])
      .then(([o, a]) => {
        setOverview(o.data && !Array.isArray(o.data) && o.data.channel_name ? o.data : null);
        setAudienceData(a.data || null);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  // Safe extraction of growth history regardless of backend return type (array vs object)
  const growthList = Array.isArray(audienceData)
    ? audienceData
    : (audienceData?.growth_history || []);

  const followerTrend = growthList.map((item, idx) => ({
    date: item.date || `Day ${idx + 1}`,
    Subscribers: item.followers || 0,
  }));

  const demographics = !Array.isArray(audienceData) && audienceData?.demographics
    ? audienceData.demographics
    : null;

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1>Audience Analytics</h1>
          <p className="muted">Public subscriber counts, growth history, and YouTube API audience insights</p>
        </div>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : !overview ? (
        <article className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div className="kpi-ico tone-gold" style={{ margin: "0 auto 16px", width: 56, height: 56 }}>
            <Icon name="users" size={28} />
          </div>
          <h2>No Channel Audience Data</h2>
          <p className="muted" style={{ maxWidth: 500, margin: "8px auto 20px" }}>
            Connect and sync your YouTube channel from the Overview page or Settings to track your audience growth.
          </p>
        </article>
      ) : (
        <>
          {/* KPIs */}
          <section className="kpis kpis-4" aria-label="Audience Metrics">
            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-violet"><Icon name="users" size={18} /></span>
                <span className="kpi-label">Subscribers</span>
              </div>
              <div className="kpi-main"><strong>{fmt(overview.subscribers)}</strong></div>
              <p className="kpi-sub">Public subscriber base</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-indigo"><Icon name="eye" size={18} /></span>
                <span className="kpi-label">Total Channel Views</span>
              </div>
              <div className="kpi-main"><strong>{fmt(overview.total_views)}</strong></div>
              <p className="kpi-sub">Lifetime audience reach</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-gold"><Icon name="content" size={18} /></span>
                <span className="kpi-label">Total Videos</span>
              </div>
              <div className="kpi-main"><strong>{fmt(overview.total_posts)}</strong></div>
              <p className="kpi-sub">Content catalog</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-green"><Icon name="analytics" size={18} /></span>
                <span className="kpi-label">Avg Engagement</span>
              </div>
              <div className="kpi-main"><strong>{overview.avg_engagement_rate}%</strong></div>
              <p className="kpi-sub">(likes + comments) / views</p>
            </article>
          </section>

          {/* Subscriber Trend */}
          <article className="card">
            <div className="card-head">
              <h2><Icon name="trending" size={16} /> Subscriber Snapshot Trend</h2>
              <span className="sample-pill live">Sync History</span>
            </div>
            {followerTrend.length > 0 ? (
              <div className="chart" style={{ height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={followerTrend} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={50} />
                    <Tooltip contentStyle={TIP} formatter={(v) => [fmt(v), "Subscribers"]} />
                    <Line type="monotone" dataKey="Subscribers" stroke="#2D4A3E" strokeWidth={2.6} dot={{ r: 4, fill: "#B08D57" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="muted" style={{ padding: "30px 0", textAlign: "center" }}>
                Daily sync snapshots will accumulate here as you sync your channel over time.
              </p>
            )}
          </article>

          {/* Demographics / Studio Notice */}
          <div className="row row-a">
            <article className="card">
              <div className="card-head">
                <h2><Icon name="info" size={16} /> Audience Demographics Transparency</h2>
              </div>
              <div style={{ background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 10, padding: "18px 20px" }}>
                <strong style={{ display: "block", marginBottom: 6, color: "var(--ink)", fontSize: "0.98rem" }}>
                  ℹ️ Public YouTube API Data Boundaries
                </strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6, fontSize: "0.88rem" }}>
                  Under Google's API policies, private viewer demographics (exact age, gender, geographic breakdown, watch time)
                  are restricted to channel owners via <strong>YouTube Studio</strong> or OAuth2 authorization.
                </p>
                <ul style={{ color: "var(--ink)", marginTop: 12, marginBottom: 0, lineHeight: 1.8, fontSize: "0.86rem" }}>
                  <li>✓ <strong>Subscriber count:</strong> Live & synced via YouTube Data API v3</li>
                  <li>✓ <strong>Cumulative views & engagement:</strong> Real public metrics</li>
                  <li>✓ <strong>Video-by-video interaction:</strong> Real comments, likes, and reach</li>
                  <li>🔒 <strong>Detailed private demographics:</strong> Accessible directly in your <a href="https://studio.youtube.com" target="_blank" rel="noreferrer" style={{ color: "var(--forest)", fontWeight: 600 }}>YouTube Studio ↗</a></li>
                </ul>
              </div>
            </article>

            {/* Channel Details Grid */}
            <article className="card">
              <div className="card-head">
                <h2><Icon name="youtube" size={16} /> Connected Channel Specs</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Channel Name", value: overview.channel_name || "—" },
                  { label: "Platform", value: "YouTube" },
                  { label: "Total Subscribers", value: fmt(overview.subscribers) },
                  { label: "Total Views", value: fmt(overview.total_views) },
                  { label: "Videos Synced", value: fmt(overview.total_posts) },
                  {
                    label: "Avg Views / Video",
                    value: overview.total_posts ? fmt(Math.round(overview.total_views / overview.total_posts)) : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <small style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase" }}>{label}</small>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: 4 }}>{value}</div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </>
      )}
    </AppLayout>
  );
}
