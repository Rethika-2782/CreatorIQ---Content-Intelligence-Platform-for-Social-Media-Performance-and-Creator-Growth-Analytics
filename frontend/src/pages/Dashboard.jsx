import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import { Icon, PlatformBadge } from "../dashboard/Icons.jsx";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const fmt = (n) => {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Number(n).toLocaleString();
};

const fmtINR = (n) => {
  if (n == null || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const AXIS = { fontSize: 11, fill: "var(--muted)" };
const TIP = { borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 12 };

export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [error, setError] = useState("");
  const [channelHandle, setChannelHandle] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ovRes, postsRes] = await Promise.all([
        api.get("/api/analytics/overview"),
        api.get("/api/analytics/posts?sort_by=views&order=desc"),
      ]);
      setOverview(ovRes.data && !Array.isArray(ovRes.data) && ovRes.data.channel_name ? ovRes.data : null);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSyncing(true);
    setSyncMsg("");
    setError("");
    const storedApiKey = localStorage.getItem("creatoriq_yt_api_key") || undefined;
    try {
      const res = await api.post("/api/youtube/sync", {
        channel_handle: channelHandle.trim() || undefined,
        api_key: storedApiKey,
      });
      setSyncMsg(`Channel synced: ${res.data.channel} (${res.data.total_posts} videos)`);
      setChannelHandle("");
      await loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 6000);
    }
  };

  const topPosts = posts.slice(0, 5);
  const highestViewed = posts[0];

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1>{greeting}, {user.name.split(" ")[0]}!</h1>
          <p className="muted">
            {overview
              ? `Channel: ${overview.channel_name} · Real YouTube analytics & studio intelligence`
              : "Welcome to your creator suite. Sync your YouTube channel to view real data."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-sm" onClick={handleSync} disabled={syncing}>
            <Icon name="refresh" size={14} /> {syncing ? "Syncing..." : "Sync My YouTube Channel"}
          </button>
          {overview?.channel_name && (
            <a
              href={`https://studio.youtube.com`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline btn-sm"
              title="Open YouTube Studio"
            >
              <Icon name="youtube" size={14} /> YouTube Studio ↗
            </a>
          )}
        </div>
      </div>

      {syncMsg && <div className="success" role="status" style={{ marginBottom: 16 }}>✓ {syncMsg}</div>}
      {error && <div className="error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : !overview ? (
        <article className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div className="kpi-ico tone-gold" style={{ margin: "0 auto 16px", width: 56, height: 56 }}>
            <Icon name="youtube" size={28} />
          </div>
          <h2>No YouTube Channel Connected Yet</h2>
          <p className="muted" style={{ maxWidth: 520, margin: "8px auto 20px" }}>
            Enter your YouTube channel handle or URL below to automatically sync your videos, views, likes, and analytics.
          </p>
          <form onSubmit={handleSync} style={{ display: "flex", gap: 10, justifyContent: "center", maxWidth: 460, margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="text"
              value={channelHandle}
              onChange={(e) => setChannelHandle(e.target.value)}
              placeholder="e.g. @VillageCookingChannel or channel URL"
              style={{ flex: "1 1 240px", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)" }}
              required
            />
            <button type="submit" className="btn" disabled={syncing || !channelHandle.trim()}>
              <Icon name="refresh" size={16} /> {syncing ? "Syncing..." : "Sync Channel"}
            </button>
          </form>
          <div style={{ marginTop: 24, fontSize: "0.85rem", color: "var(--muted)" }}>
            Tip: Make sure your YouTube Data API v3 key is placed in <code>backend/.env</code> or channel handle is set in My Profile.
          </div>
        </article>
      ) : (
        <>
          {/* Key Metric KPIs */}
          <section className="kpis kpis-4" aria-label="Key channel metrics">
            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-violet"><Icon name="users" size={18} /></span>
                <span className="kpi-label">Subscribers</span>
              </div>
              <div className="kpi-main"><strong>{fmt(overview.subscribers)}</strong></div>
              <p className="kpi-sub">Public subscriber count</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-indigo"><Icon name="eye" size={18} /></span>
                <span className="kpi-label">Total Channel Views</span>
              </div>
              <div className="kpi-main"><strong>{fmt(overview.total_views)}</strong></div>
              <p className="kpi-sub">{overview.total_posts} published videos</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-gold"><Icon name="heart" size={18} /></span>
                <span className="kpi-label">Avg Engagement</span>
              </div>
              <div className="kpi-main"><strong>{overview.avg_engagement_rate}%</strong></div>
              <p className="kpi-sub">(likes + comments) / views</p>
            </article>

            <article className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico tone-green"><Icon name="revenue" size={18} /></span>
                <span className="kpi-label">Est. AdSense Earnings</span>
              </div>
              <div className="kpi-main"><strong>{fmtINR(overview.est_revenue * 83)}</strong></div>
              <p className="kpi-sub">{overview.est_revenue ? `$${overview.est_revenue} USD (~$2 CPM)` : "₹0 if zero views"}</p>
            </article>
          </section>

          {/* Highest Viewed Video Highlight */}
          {highestViewed && (
            <article className="card" style={{ background: "linear-gradient(135deg, #1C1917, #2D4A3E)", color: "#FAF7F2", border: "none" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                {highestViewed.thumbnail_url && (
                  <img
                    src={highestViewed.thumbnail_url}
                    alt=""
                    style={{ width: 140, height: 80, borderRadius: 8, objectFit: "cover", flex: "none" }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#B08D57", fontWeight: 700 }}>
                    ★ Highest Viewed Video
                  </span>
                  <h3 style={{ color: "#FAF7F2", margin: "4px 0 6px", fontSize: "1.15rem" }}>
                    {highestViewed.title || highestViewed.caption}
                  </h3>
                  <div style={{ display: "flex", gap: 16, fontSize: "0.86rem", color: "rgba(250, 247, 242, 0.8)" }}>
                    <span>👁 <strong>{fmt(highestViewed.views)}</strong> views</span>
                    <span>♥ <strong>{fmt(highestViewed.likes)}</strong> likes</span>
                    <span>💬 <strong>{fmt(highestViewed.comments)}</strong> comments</span>
                    <span>⚡ <strong>{highestViewed.engagement_rate}%</strong> eng</span>
                  </div>
                </div>
                <a
                  href={`https://youtube.com/watch?v=${highestViewed.platform_post_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </article>
          )}

          {/* Charts Row */}
          <div className="row row-a">
            {/* Top Videos Chart */}
            <article className="card">
              <div className="card-head">
                <h2><Icon name="trending" size={16} /> Content Performance (Top Videos)</h2>
              </div>
              {topPosts.length > 0 ? (
                <div className="chart" style={{ height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={topPosts} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                      <CartesianGrid vertical={false} stroke="var(--line)" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 10, fill: "var(--muted)" }}
                        axisLine={false}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                        tickFormatter={(t) => (t && t.length > 18 ? t.slice(0, 16) + "…" : t)}
                      />
                      <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={fmt} width={50} />
                      <Tooltip contentStyle={TIP} formatter={(v) => [fmt(v), "Views"]} />
                      <Bar dataKey="views" fill="#2D4A3E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted" style={{ padding: "40px 0", textAlign: "center" }}>No videos found.</p>
              )}
            </article>

            {/* Engagement Rate Bar Chart */}
            <article className="card">
              <div className="card-head">
                <h2><Icon name="analytics" size={16} /> Engagement by Video (%)</h2>
              </div>
              {topPosts.length > 0 ? (
                <div className="chart" style={{ height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={topPosts} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                      <CartesianGrid vertical={false} stroke="var(--line)" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 10, fill: "var(--muted)" }}
                        axisLine={false}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                        tickFormatter={(t) => (t && t.length > 18 ? t.slice(0, 16) + "…" : t)}
                      />
                      <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={45} />
                      <Tooltip contentStyle={TIP} formatter={(v) => [`${v}%`, "Engagement Rate"]} />
                      <Bar dataKey="engagement_rate" fill="#B08D57" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted" style={{ padding: "40px 0", textAlign: "center" }}>No videos found.</p>
              )}
            </article>
          </div>

          {/* Recent Synced Videos Table */}
          <article className="card">
            <div className="card-head">
              <h2><Icon name="content" size={16} /> Latest Channel Videos</h2>
              <span className="muted" style={{ fontSize: "0.84rem" }}>{posts.length} total videos synced</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Platform</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Engagement</th>
                    <th>Published</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.slice(0, 10).map((p) => (
                    <tr key={p.post_id || p.platform_post_id}>
                      <td>
                        <div className="post">
                          {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} alt="" className="thumb" />
                          ) : (
                            <span className="thumb" style={{ background: "var(--forest)" }} />
                          )}
                          <span>
                            <strong title={p.title || p.caption}>{(p.title || p.caption || "Untitled").slice(0, 42)}</strong>
                            <small>{p.content_type || "Video"}</small>
                          </span>
                        </div>
                      </td>
                      <td><PlatformBadge name="YouTube" /></td>
                      <td><strong>{fmt(p.views)}</strong></td>
                      <td>{fmt(p.likes)}</td>
                      <td>{fmt(p.comments)}</td>
                      <td><span className="eng">{p.engagement_rate != null ? `${p.engagement_rate}%` : "—"}</span></td>
                      <td className="muted">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                      </td>
                      <td>
                        <a
                          href={`https://youtube.com/watch?v=${p.platform_post_id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--forest)", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          Watch ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </AppLayout>
  );
}
