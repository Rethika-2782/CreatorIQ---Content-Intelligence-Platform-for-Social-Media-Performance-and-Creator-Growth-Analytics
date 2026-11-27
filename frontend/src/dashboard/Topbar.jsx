import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icons";

const SEARCH_PAGES = [
  { label: "Overview", path: "/dashboard", keywords: "overview home dashboard summary kpi" },
  { label: "Content Analytics", path: "/content", keywords: "content analytics videos posts views likes" },
  { label: "Audience", path: "/audience", keywords: "audience subscribers followers growth" },
  { label: "Growth & Insights", path: "/growth", keywords: "growth insights trends recommendations" },
  { label: "Revenue", path: "/revenue", keywords: "revenue money earnings monetization" },
  { label: "Reports", path: "/reports", keywords: "reports export pdf csv" },
  { label: "YouTube Channel", path: "/youtube", keywords: "youtube channel sync videos" },
  { label: "AI Strategist", path: "/pro-strategist", keywords: "ai strategist pro plan forecast" },
  { label: "My Profile", path: "/profile", keywords: "profile account bio" },
  { label: "Settings", path: "/settings", keywords: "settings api key password" },
];

export default function Topbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const q = query.trim().toLowerCase();
  const matches = q
    ? SEARCH_PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.keywords.includes(q))
    : [];

  const handleSelect = (path) => {
    setQuery("");
    setOpen(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && matches.length > 0) {
      e.preventDefault();
      handleSelect(matches[0].path);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="tb">
      <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
        <label className="tb-search" style={{ width: "100%" }}>
          <Icon name="search" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search content, analytics, reports..."
            aria-label="Search"
          />
        </label>
        {open && q && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {matches.length > 0 ? (
              matches.map((m) => (
                <button
                  key={m.path}
                  type="button"
                  onMouseDown={() => handleSelect(m.path)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--line)",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {m.label}
                </button>
              ))
            ) : (
              <div style={{ padding: "10px 14px", color: "var(--muted)", fontSize: "0.88rem" }}>
                No matching pages found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tb-right">
        <label className="tb-range">
          <Icon name="calendar" />
          <select aria-label="Date range" defaultValue="30">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </label>

        <button className="icon-btn" aria-label="Notifications">
          <Icon name="bell" />
          <span className="dot" />
        </button>

        <div className="tb-user">
          <span className="avatar">{initials}</span>
          <span className="tb-name">
            <strong>{user.name}</strong>
            <small>{user.role_label}</small>
          </span>
        </div>

        <button className="icon-btn" onClick={onLogout} aria-label="Log out" title="Log out">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}
