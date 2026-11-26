export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <main className="auth-form-side">
        <div className="brand">
          <img
            src="/logo.png"
            alt="CreatorIQ Logo"
            style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 6 }}
          />
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.4rem", fontWeight: 700 }}>CreatorIQ</span>
        </div>
        <div className="auth-card">{children}</div>
      </main>

      <aside className="auth-visual" aria-hidden="true" style={{ background: "linear-gradient(135deg, #1C1917 0%, #2D4A3E 100%)", color: "#FAF7F2" }}>
        <h2 style={{ color: "#FAF7F2", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.2rem" }}>
          Quietly Commanding Creator Intelligence.
        </h2>
        <p style={{ color: "rgba(250, 247, 242, 0.8)", fontSize: "1rem", lineHeight: 1.6 }}>
          Connect your own YouTube channel during sign-up for authentic, zero-fluff video analytics, revenue estimates, and AI growth benchmarking.
        </p>
        <div className="mini-chart" style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(176, 141, 87, 0.3)", borderRadius: 12, padding: 18 }}>
          <div className="mini-stat">
            <span style={{ color: "#B08D57", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.75rem" }}>OWNER ANALYTICS</span>
            <strong style={{ fontSize: "1.6rem", display: "block", margin: "4px 0" }}>Real YouTube Sync</strong>
            <em style={{ color: "rgba(250, 247, 242, 0.7)", fontStyle: "normal", fontSize: "0.85rem" }}>✨ Later Instagram extension will also be introduced</em>
          </div>
        </div>
      </aside>
    </div>
  );
}
