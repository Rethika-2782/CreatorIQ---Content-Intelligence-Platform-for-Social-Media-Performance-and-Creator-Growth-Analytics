import { useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function YoutubeChannel() {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [channel, setChannel] = useState(null);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSearchAndSync = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setMsg("");
    try {
      const syncRes = await api.post("/api/youtube/sync", {
        channel_handle: query.trim(),
        api_key: apiKey.trim() || undefined,
      });
      const chRes = await api.get(`/api/youtube/channel/${encodeURIComponent(query.trim())}`);
      setChannel(chRes.data);
      setMsg(`Synced ${syncRes.data.channel} (${syncRes.data.total_posts} real videos) across all dashboard pages!`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1 className="gradient-text">YouTube Channel Integration</h1>
          <p className="muted">Enter any YouTube @handle, channel ID, or URL to fetch its real, complete history</p>
        </div>
      </div>

      <article className="yt-connect">
        <Icon name="youtube" size={44} />
        <h2>Connect Your YouTube Channel</h2>
        <p>
          Paste your YouTube handle (e.g. <code>@mkbhd</code>, <code>@TechnicalGuruji</code>), channel ID, or URL.
          All pages (Overview, Content, Audience, Growth, Revenue, Reports) will update with your real channel data.
        </p>
        <form onSubmit={handleSearchAndSync} style={{ width: "100%", maxWidth: 560, gap: 12 }}>
          <div className="yt-input-row">
            <input
              placeholder="@handle, channel ID, or YouTube URL..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={searching || syncing}>
              {searching ? "Fetching..." : "Fetch & Sync Channel"}
            </button>
          </div>
          <input
            type="password"
            placeholder="Optional: YouTube Data API v3 Key (if not set in backend/.env)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </form>
      </article>

      {error && <div className="error">{error}</div>}
      {msg && <div className="success">{msg}</div>}

      {channel && (
        <article className="card">
          <div className="card-head">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {channel.thumbnail && (
                <img src={channel.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <div>
                <h2>{channel.title} <span className="sample-pill live">Live YouTube Data</span></h2>
                <small className="muted">{channel.username} · {channel.channel_id}</small>
              </div>
            </div>
          </div>
          <p className="muted" style={{ marginBottom: 16 }}>{channel.description || "No channel description."}</p>
          <div className="kpis kpis-4">
            <div className="comp-metric"><small>Subscribers</small><strong>{fmt(channel.subscribers)}</strong></div>
            <div className="comp-metric"><small>Total Views</small><strong>{fmt(channel.total_views)}</strong></div>
            <div className="comp-metric"><small>Total Videos</small><strong>{fmt(channel.video_count)}</strong></div>
            <div className="comp-metric"><small>Synced History</small><strong>{channel.videos?.length || 0} videos</strong></div>
          </div>
        </article>
      )}
    </AppLayout>
  );
}
