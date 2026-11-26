import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../dashboard/Icons.jsx";

export default function Landing() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct instructions for desktop and mobile
      alert(
        "To install CreatorIQ as a native app safely:\n\n" +
        "• On Mobile (Android / Chrome): Tap the ⋮ Menu -> 'Add to Home screen' or 'Install app'.\n" +
        "• On Desktop (Chrome / Edge): Click the Install icon in the address bar or Menu -> 'Install CreatorIQ'.\n\n" +
        "This runs directly from your device without any unsigned APK security warnings!"
      );
    }
  };

  return (
    <div className="om-landing">
      {/* Top Navigation */}
      <header className="om-nav">
        <div className="om-brand">
          <img
            src="/logo.png"
            alt="CreatorIQ - Vibe & Slay"
            style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }}
          />
          <div>
            <strong style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem" }}>
              CreatorIQ
            </strong>
            <span style={{ color: "#B08D57", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.14em" }}>
              VIBE & SLAY
            </span>
          </div>
        </div>
        <div className="om-nav-actions">
          <a href="#features" className="om-nav-link">Features</a>
          <a href="#download" className="om-nav-link">Get the App</a>
          <Link to="/login" className="btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-sm">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="om-hero">
        <div style={{ marginBottom: 12 }}>
          <img
            src="/logo.png"
            alt="CreatorIQ Logo"
            style={{ width: 140, height: "auto", margin: "0 auto 14px", filter: "drop-shadow(0 4px 16px rgba(176,141,87,0.25))" }}
          />
        </div>
        <span className="om-tagline-pill">Quietly Commanding Creator Intelligence</span>
        <h1>
          Timeless Analytics for <em>Discerning</em> YouTube Creators.
        </h1>
        <p className="om-hero-sub">
          Connect your own YouTube channel at sign-up and unlock authentic, real-time performance
          intelligence, YouTube Studio insights, CSV exports, and AI-guided growth strategies.
        </p>
        <div className="om-hero-cta">
          <Link to="/register" className="btn">Create Your Account</Link>
          <Link to="/login" className="btn-outline">Sign In to Studio</Link>
        </div>
        <p className="om-ig-note">
          ✦ Later Instagram extension will also be introduced.
        </p>
      </section>

      {/* Features Bento */}
      <section id="features" className="om-section">
        <div className="om-section-head">
          <span>THE SUITE</span>
          <h2>Crafted for Authentic Channel Mastery</h2>
        </div>
        <div className="om-grid-3">
          <article className="card">
            <div className="kpi-ico tone-gold" style={{ marginBottom: 14 }}><Icon name="youtube" size={20} /></div>
            <h3>Owner-Only YouTube Sync</h3>
            <p className="muted">Your channel handle is linked privately at registration—view your own real views, likes, comments, and YouTube Studio link.</p>
          </article>
          <article className="card">
            <div className="kpi-ico tone-violet" style={{ marginBottom: 14 }}><Icon name="analytics" size={20} /></div>
            <h3>Content & Growth Insights</h3>
            <p className="muted">Filter, sort, and compare your videos side by side, with engagement rates and rule-based growth recommendations.</p>
          </article>
          <article className="card">
            <div className="kpi-ico tone-green" style={{ marginBottom: 14 }}><Icon name="crown" size={20} /></div>
            <h3>Pro AI Strategist & Exports</h3>
            <p className="muted">Benchmark against top channels in your niche, project subscriber & revenue growth, and export real CSV reports anytime.</p>
          </article>
        </div>
      </section>

      {/* Cross-Platform Safe Installation Section */}
      <section id="download" className="om-section">
        <div className="om-download-box" style={{ background: "linear-gradient(135deg, #1C1917, #2D4A3E)", color: "#FAF7F2", borderRadius: 16, padding: "36px 40px" }}>
          <div>
            <span className="om-tagline-pill" style={{ color: "#B08D57", background: "rgba(176,141,87,0.15)" }}>
              VERIFIED NATIVE & PWA INSTALLATION
            </span>
            <h2 style={{ color: "#FAF7F2", margin: "10px 0" }}>Take CreatorIQ Everywhere Safely</h2>
            <p style={{ color: "rgba(250,247,242,0.85)", maxWidth: 640, lineHeight: 1.6 }}>
              Install CreatorIQ seamlessly on your <strong>Android Phone</strong> or <strong>Desktop (Windows / Mac)</strong> without any browser security warnings or untrusted APK blocks.
            </p>
          </div>
          <div className="om-download-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
            {/* 1-Click Trusted Instant Install */}
            <button
              onClick={handleInstallClick}
              className="btn-gold"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.95rem" }}
            >
              <Icon name="download" size={18} /> {isInstalled ? "App Installed ✓" : "Install App (1-Click Desktop & Mobile)"}
            </button>

            {/* Direct Package Downloads */}
            <a
              href="/CreatorIQ-Desktop-Setup.exe"
              download="CreatorIQ-Desktop-Setup.exe"
              className="btn-outline"
              style={{ color: "#FAF7F2", borderColor: "rgba(250,247,242,0.4)" }}
            >
              <Icon name="download" size={16} /> Desktop App (.exe for Windows)
            </a>
            <button
              onClick={() => {
                alert(
                  "📱 How to install on your Phone:\n\n" +
                  "Because Google Play blocks third-party APKs from web browsers, use the browser install:\n" +
                  "1. Open https://creatoriq-content-in-gbxclply.onslate.in in Chrome on your phone.\n" +
                  "2. Tap the 3 dots (⋮) in the top-right.\n" +
                  "3. Tap 'Install app' or 'Add to Home screen'.\n\n" +
                  "It installs immediately with the CreatorIQ logo and full app experience!"
                );
              }}
              className="btn-outline"
              style={{ color: "#FAF7F2", borderColor: "rgba(250,247,242,0.4)", cursor: "pointer" }}
            >
              <Icon name="download" size={16} /> Mobile App (Android / iOS)
            </button>
          </div>
        </div>
      </section>

      <footer className="om-footer">
        <strong>CreatorIQ — Vibe & Slay</strong> · Quietly Commanding Creator Intelligence · Later Instagram extension will also be introduced.
      </footer>
    </div>
  );
}
