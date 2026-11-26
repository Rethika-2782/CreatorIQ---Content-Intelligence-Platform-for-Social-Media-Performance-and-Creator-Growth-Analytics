import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon, PlatformBadge } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const AXIS = { fontSize: 11, fill: "#6b7280" };
const TIP  = { borderRadius: 10, border: "1px solid #e5e7ef", background: "#fff", fontSize: 13 };
const COLORS = ["#6d4ae8", "#c9a84c", "#22c55e", "#ef4444", "#0ea5e9", "#a21caf"];

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function KpiCard({ icon, tone, label, value, sub }) {
  return (
    <article className="card kpi">
      <div className="kpi-top">
        <span className={`kpi-ico tone-${tone}`}><Icon name={icon} size={18} /></span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-main"><strong>{value ?? "—"}</strong></div>
      <p className="kpi-sub">{sub}</p>
    </article>
  );
}

export default function ContentAnalytics() {
  const [posts, setPosts] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/api/analytics/posts?sort_by=${sortBy}&order=${order}`),
      api.get("/api/analytics/overview"),
    ])
      .then(([p, o]) => { setPosts(p.data); setOverview(o.data); })
      .catch(e => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sortBy, order]);

  const displayed = posts.filter(p =>
    !filter || (p.title || p.caption || "").toLowerCase().includes(filter.toLowerCase())
  );

  const topByViews = [...posts].sort((a,b) => (b.views||0)-(a.views||0)).slice(0,8);

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1 className="gradient-text">Content Analytics</h1>
          <p className="muted">Detailed performance metrics for every video</p>
        </div>
      </div>

      {/* KPI Row */}
      {overview && (
        <section className="kpis kpis-5">
          <KpiCard icon="content"   tone="violet" label="Total Videos"       value={fmt(overview.total_posts)}    sub="published videos" />
          <KpiCard icon="eye"       tone="indigo" label="Total Views"         value={fmt(overview.total_views)}    sub="across all content" />
          <KpiCard icon="heart"     tone="rose"   label="Total Likes"         value={fmt(overview.total_likes)}    sub="audience engagement" />
          <KpiCard icon="message"   tone="blue"   label="Total Comments"      value={fmt(overview.total_comments)} sub="audience feedback" />
          <KpiCard icon="analytics" tone="amber"  label="Avg Engagement Rate" value={overview.avg_engagement_rate ? `${overview.avg_engagement_rate}%` : "—"} sub="(likes+comments)/views" />
        </section>
      )}

      {/* Top videos bar chart */}
      {topByViews.length > 0 && (
        <article className="card">
          <div className="card-head">
            <h2><Icon name="trending" size={16} /> Top Videos by Views</h2>
          </div>
          <div className="chart" style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={topByViews} margin={{ top:8, right:12, left:-8, bottom:40 }}>
                <CartesianGrid vertical={false} stroke="#e5e7ef" />
                <XAxis dataKey="title" tick={{ fontSize:10, fill:"#6b7280" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v.length > 18 ? v.slice(0,16)+"…" : v} angle={-20} textAnchor="end" />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={52} />
                <Tooltip contentStyle={TIP} formatter={v => [fmt(v), "Views"]} labelFormatter={l => l} />
                <Bar dataKey="views" radius={[6,6,0,0]}>
                  {topByViews.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      )}

      {/* Video Table */}
      <article className="card">
        <div className="card-head">
          <h2><Icon name="content" size={16} /> All Videos</h2>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <input
              placeholder="Filter by title…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding:"7px 12px", borderRadius:9, border:"1px solid #e5e7ef", fontSize:13, width:180 }}
            />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding:"7px 12px", borderRadius:9, border:"1px solid #e5e7ef", fontSize:13 }}>
              <option value="views">Sort: Views</option>
              <option value="likes">Sort: Likes</option>
              <option value="engagement_rate">Sort: Engagement</option>
              <option value="published_at">Sort: Date</option>
            </select>
            <button className="chip" onClick={() => setOrder(o => o === "desc" ? "asc" : "desc")}>
              <Icon name={order === "desc" ? "down" : "up"} size={14} /> {order === "desc" ? "Desc" : "Asc"}
            </button>
            <button className="chip chip-gold" onClick={() => setShowCompare(s => !s)}>
              <Icon name="analytics" size={14} /> Compare
            </button>
          </div>
        </div>

        {/* Compare panel */}
        {showCompare && posts.length >= 2 && (
          <div className="comp-wrap">
            <div className="comp-head">
              <strong>Compare Two Videos</strong>
              <div className="comp-selectors">
                <select style={{ padding:"7px 12px", borderRadius:9, border:"1px solid #e5e7ef", fontSize:13 }}
                  onChange={e => setCompareA(posts.find(p => String(p.post_id) === e.target.value))}>
                  <option value="">Select Video A</option>
                  {posts.map(p => <option key={p.post_id} value={p.post_id}>{(p.title||p.caption||"").slice(0,50)}</option>)}
                </select>
                <span className="muted">vs</span>
                <select style={{ padding:"7px 12px", borderRadius:9, border:"1px solid #e5e7ef", fontSize:13 }}
                  onChange={e => setCompareB(posts.find(p => String(p.post_id) === e.target.value))}>
                  <option value="">Select Video B</option>
                  {posts.map(p => <option key={p.post_id} value={p.post_id}>{(p.title||p.caption||"").slice(0,50)}</option>)}
                </select>
              </div>
            </div>
            {compareA && compareB && (
              <div className="comp-grid">
                {[compareA, compareB].map((v, i) => (
                  <div key={i} className="comp-col">
                    <div className="comp-video-info">
                      {v.thumbnail_url && <img src={v.thumbnail_url} className="comp-thumb" alt="" />}
                      <span className="comp-video-title">{v.title || v.caption}</span>
                    </div>
                    <div className="comp-metrics">
                      <div className="comp-metric"><small>Views</small><strong>{fmt(v.views)}</strong></div>
                      <div className="comp-metric"><small>Likes</small><strong>{fmt(v.likes)}</strong></div>
                      <div className="comp-metric"><small>Comments</small><strong>{fmt(v.comments)}</strong></div>
                      <div className="comp-metric"><small>Engagement</small><strong style={{ color:"var(--violet)" }}>{v.engagement_rate}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Platform</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Eng. Rate</th>
                  <th>Published</th>
                  <th>Watch Link</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const eng = parseFloat(p.engagement_rate) || 0;
                  const engClass = eng >= 5 ? "eng eng-high" : eng < 2 ? "eng eng-low" : "eng";
                  return (
                    <tr key={p.post_id}>
                      <td>
                        <div className="post">
                          {p.thumbnail_url
                            ? <img src={p.thumbnail_url} className="thumb" alt="" />
                            : <span className="thumb" style={{ background:"linear-gradient(135deg,#6d4ae8,#c9a84c)" }} />}
                          <span>
                            <strong title={p.title || p.caption}>{(p.title || p.caption || "Untitled").slice(0, 44)}</strong>
                            <small>{p.content_type || "Video"}</small>
                          </span>
                        </div>
                      </td>
                      <td><PlatformBadge name={p.platform || "YouTube"} /></td>
                      <td><strong>{fmt(p.views)}</strong></td>
                      <td>{fmt(p.likes)}</td>
                      <td>{fmt(p.comments)}</td>
                      <td><span className={engClass}>{p.engagement_rate ? `${p.engagement_rate}%` : "—"}</span></td>
                      <td className="muted">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" }) : "—"}
                      </td>
                      <td>
                        <a href={`https://youtube.com/watch?v=${p.platform_post_id}`} target="_blank" rel="noreferrer"
                          style={{ color:"var(--violet)", fontWeight:600, fontSize:13 }}>
                          Watch ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {displayed.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:"center", padding:"32px", color:"#9ca3af" }}>
                    No videos found. Sync a YouTube channel from the Overview page.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </AppLayout>
  );
}
