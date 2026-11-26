import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const TIP = { borderRadius:10, border:"1px solid #e5e7ef", background:"#fff", fontSize:13 };

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+"M";
  if (n >= 1_000) return (n/1_000).toFixed(1)+"K";
  return n.toLocaleString();
}

function Insight({ icon, bg, title, body }) {
  return (
    <li className="insight-item">
      <div className="insight-icon" style={{ background: bg }}>{icon}</div>
      <div>
        <strong style={{ display:"block", marginBottom:3 }}>{title}</strong>
        <span style={{ color:"var(--muted)", fontSize:"0.88rem" }}>{body}</span>
      </div>
    </li>
  );
}

export default function GrowthInsights() {
  const [posts, setPosts] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/analytics/posts?sort_by=views&order=desc"),
      api.get("/api/analytics/overview"),
    ])
      .then(([p, o]) => { setPosts(p.data); setOverview(o.data); })
      .catch(e => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const topByViews    = posts.slice(0, 5);
  const topByEng      = [...posts].sort((a,b) => (parseFloat(b.engagement_rate)||0)-(parseFloat(a.engagement_rate)||0)).slice(0,5);
  const avgViews      = overview && overview.total_posts ? Math.round(overview.total_views / overview.total_posts) : 0;
  const highest       = posts[0];
  const mostEngaging  = topByEng[0];

  // Build engagement chart
  const engChart = topByEng.map(p => ({
    name: (p.title || p.caption || "").slice(0, 20),
    engagement: parseFloat(p.engagement_rate) || 0,
  }));

  // Rule-based insights
  const insights = [];
  if (highest) insights.push({
    icon: "🏆", bg: "#fdf8ed",
    title: `Most Viewed: ${(highest.title || highest.caption || "").slice(0,50)}`,
    body: `${fmt(highest.views)} views — your best-performing video by reach.`,
  });
  if (mostEngaging && mostEngaging !== highest) insights.push({
    icon: "🔥", bg: "#fef2f2",
    title: `Most Engaging: ${(mostEngaging.title || mostEngaging.caption || "").slice(0,50)}`,
    body: `${mostEngaging.engagement_rate}% engagement rate — highest audience interaction.`,
  });
  if (avgViews) insights.push({
    icon: "📊", bg: "#f1eeff",
    title: `Average Views Per Video: ${fmt(avgViews)}`,
    body: "Compare individual video performance against this benchmark.",
  });
  const aboveAvg = posts.filter(p => (p.views||0) > avgViews);
  if (aboveAvg.length > 0) insights.push({
    icon: "⬆️", bg: "#dcfce7",
    title: `${aboveAvg.length} videos above average views`,
    body: "Consider creating more content in the style of your top performers.",
  });
  if (topByEng[0]?.engagement_rate > 5) insights.push({
    icon: "💬", bg: "#eff6ff",
    title: "High Engagement Detected",
    body: `Your top video has ${topByEng[0].engagement_rate}% engagement — excellent audience connection. Reply to comments to maintain momentum.`,
  });
  insights.push({
    icon: "📅", bg: "#f0fdf4",
    title: "Consistency is Key",
    body: "YouTube channels that upload consistently (1–2 videos/week) grow 3× faster than irregular uploaders.",
  });
  insights.push({
    icon: "🔍", bg: "#faf5ff",
    title: "SEO Tip: Optimize Titles & Descriptions",
    body: "Videos with keyword-rich titles and detailed descriptions rank higher in YouTube search results.",
  });

  const COLORS = ["#6d4ae8","#c9a84c","#22c55e","#ef4444","#0ea5e9"];

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1 className="gradient-text">Growth & Insights</h1>
          <p className="muted">Channel performance trends and content recommendations</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          {/* Performance overview */}
          {overview && (
            <section className="kpis kpis-4">
              {[
                { icon:"users", tone:"violet", label:"Subscribers", value:fmt(overview.subscribers) },
                { icon:"eye",   tone:"indigo", label:"Total Views",  value:fmt(overview.total_views) },
                { icon:"analytics", tone:"amber", label:"Avg Views/Video", value:fmt(avgViews) },
                { icon:"heart", tone:"rose",   label:"Total Likes", value:fmt(overview.total_likes) },
              ].map(k => (
                <article key={k.label} className="card kpi">
                  <div className="kpi-top"><span className={`kpi-ico tone-${k.tone}`}><Icon name={k.icon} size={18}/></span><span className="kpi-label">{k.label}</span></div>
                  <div className="kpi-main"><strong>{k.value}</strong></div>
                </article>
              ))}
            </section>
          )}

          <div className="row row-a">
            {/* Top by engagement */}
            <article className="card">
              <div className="card-head">
                <h2><Icon name="trending" size={16}/> Top 5 by Engagement Rate</h2>
              </div>
              {engChart.length > 0 ? (
                <div className="chart" style={{ height:220 }}>
                  <ResponsiveContainer>
                    <BarChart data={engChart} margin={{ top:8, right:8, left:-8, bottom:40 }}>
                      <CartesianGrid vertical={false} stroke="#e5e7ef" />
                      <XAxis dataKey="name" tick={{ fontSize:10, fill:"#6b7280" }} axisLine={false} tickLine={false}
                        angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize:11, fill:"#6b7280" }} axisLine={false} tickLine={false}
                        tickFormatter={v => `${v}%`} width={40} />
                      <Tooltip contentStyle={TIP} formatter={v => [`${v}%`, "Engagement Rate"]} />
                      <Bar dataKey="engagement" radius={[6,6,0,0]}>
                        {engChart.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted" style={{ textAlign:"center", padding:"32px 0" }}>Sync a channel to view engagement data</p>
              )}
            </article>

            {/* Top 5 by views */}
            <article className="card">
              <div className="card-head"><h2><Icon name="star" size={16}/> Top Videos</h2></div>
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:10 }}>
                {topByViews.map((p, i) => (
                  <li key={p.post_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"var(--bg)", borderRadius:10 }}>
                    <span style={{ width:24, height:24, borderRadius:8, background:COLORS[i%COLORS.length], color:"#fff", display:"grid", placeItems:"center", fontSize:"0.72rem", fontWeight:800, flex:"none" }}>
                      {i+1}
                    </span>
                    {p.thumbnail_url && <img src={p.thumbnail_url} style={{ width:44, height:32, borderRadius:6, objectFit:"cover", flex:"none" }} alt="" />}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:"0.85rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {(p.title||p.caption||"Untitled").slice(0,42)}
                      </div>
                      <div style={{ fontSize:"0.76rem", color:"var(--muted)" }}>{fmt(p.views)} views · {p.engagement_rate}% eng.</div>
                    </div>
                  </li>
                ))}
                {topByViews.length === 0 && (
                  <li style={{ textAlign:"center", padding:"24px", color:"#9ca3af" }}>No data — sync a channel first</li>
                )}
              </ul>
            </article>
          </div>

          {/* AI-style insights */}
          <article className="card">
            <div className="card-head">
              <h2><Icon name="analytics" size={16}/> Performance Insights & Recommendations</h2>
              <span style={{ fontSize:"0.76rem", color:"var(--muted)", fontWeight:600 }}>Based on your YouTube data</span>
            </div>
            <ul className="insight-list">
              {insights.map((ins, i) => (
                <Insight key={i} icon={ins.icon} bg={ins.bg} title={ins.title} body={ins.body} />
              ))}
            </ul>
          </article>

          <article className="card" style={{ background:"linear-gradient(135deg,#1a1040,#4b2fc4)", color:"#fff", border:"none" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
              <div style={{ fontSize:"2rem" }}>📈</div>
              <div>
                <h2 style={{ color:"#fff", marginBottom:6 }}>Historical Growth Limitation</h2>
                <p style={{ margin:0, color:"#c4b8f8", lineHeight:1.7, fontSize:"0.92rem" }}>
                  YouTube Data API v3 does not expose historical subscriber growth timelines for public channels.
                  The subscriber growth chart above is estimated from your 14-day sync history stored in the database.
                  For detailed historical analytics, YouTube Studio or YouTube Analytics API (requires OAuth2) is required.
                </p>
              </div>
            </div>
          </article>
        </>
      )}
    </AppLayout>
  );
}
