import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { Icon } from "./Icons.jsx";

const NAV = {
  creator: [
    { label: "Overview",           icon: "dash",      to: "/dashboard" },
    { label: "Content Analytics",  icon: "content",   to: "/content" },
    { label: "Audience",           icon: "audience",  to: "/audience" },
    { label: "Growth & Insights",  icon: "analytics", to: "/growth" },
    { label: "Revenue",            icon: "revenue",   to: "/revenue" },
    { label: "Reports",            icon: "reports",   to: "/reports" },
    { label: "My Profile",         icon: "user",      to: "/profile" },
    { label: "Settings",           icon: "settings",  to: "/settings" },
  ],
  agency: [
    { label: "Overview",         icon: "dash",      to: "/dashboard" },
    { label: "Content",          icon: "content",   to: "/content" },
    { label: "Audience",         icon: "audience",  to: "/audience" },
    { label: "Growth",           icon: "analytics", to: "/growth" },
    { label: "Reports",          icon: "reports",   to: "/reports" },
    { label: "Agency Profile",   icon: "user",      to: "/profile" },
    { label: "Settings",         icon: "settings",  to: "/settings" },
  ],
  marketing_team: [
    { label: "Overview",   icon: "dash",      to: "/dashboard" },
    { label: "Content",    icon: "content",   to: "/content" },
    { label: "Audience",   icon: "audience",  to: "/audience" },
    { label: "Reports",    icon: "reports",   to: "/reports" },
    { label: "Settings",   icon: "settings",  to: "/settings" },
  ],
  admin: [
    { label: "Overview",      icon: "dash",    to: "/dashboard" },
    { label: "User Management", icon: "shield", to: "/admin/users" },
    { label: "Settings",      icon: "settings", to: "/settings" },
  ],
};

export default function Sidebar({ role }) {
  const items = NAV[role] || NAV.creator;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="sb">
      <div className="sb-brand">
        <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2"  y="14" width="6" height="12" rx="2" fill="#c9a84c" />
          <rect x="11" y="8"  width="6" height="18" rx="2" fill="#8b7bf2" />
          <rect x="20" y="2"  width="6" height="24" rx="2" fill="#fff" />
        </svg>
        <span>CreatorIQ</span>
      </div>

      <nav aria-label="Main">
        {items.map((n) => (
          <NavLink
            key={n.label}
            to={n.to}
            end={n.to === "/dashboard"}
            className={({ isActive }) => "sb-item" + (isActive ? " active" : "")}
          >
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {(role === "creator" || role === "agency") && (
        <div className="sb-plan">
          <Icon name="crown" size={20} />
          <strong>Pro Plan</strong>
          <p>AI Channel Strategist: benchmark & forecast growth</p>
          <NavLink to="/pro" className="btn-solid">Open AI Strategist</NavLink>
        </div>
      )}

      <button
        className="sb-item"
        style={{ marginTop: "auto", border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "rgba(255,255,255,.5)" }}
        onClick={handleLogout}
      >
        <Icon name="logout" size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
