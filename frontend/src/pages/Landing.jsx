import { Link } from "react-router-dom";
import { Icon } from "../dashboard/Icons.jsx";

export default function Landing() {
  return (
    <div className="om-landing">
      {/* Top Navigation */}
      <header className="om-nav">
        <div className="om-brand">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="2" y="16" width="7" height="14" rx="2" fill="#B08D57" />
            <rect x="12.5" y="9" width="7" height="21" rx="2" fill="#2D4A3E" />
            <rect x="23" y="2" width="7" height="28" rx="2" fill="#1C1917" />
          </svg>
          <div>
            <strong>CreatorIQ</strong>
            <span>EST. 2026</span>
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

      {/* Desktop & Mobile APK Download Section */}
      <section id="download" className="om-section">
        <div className="om-download-box">
          <div>
            <span className="om-tagline-pill">CROSS-PLATFORM ACCESS</span>
            <h2>Take CreatorIQ Everywhere</h2>
            <p className="muted">
              Install CreatorIQ on your Desktop or download the Android Mobile APK to monitor your YouTube studio metrics on the move.
            </p>
          </div>
          <div className="om-download-btns">
            <a
              href="/CreatorIQ-Desktop-Setup.zip"
              download="CreatorIQ-Desktop-Setup.zip"
              className="btn-outline"
            >
              <Icon name="download" size={16} /> Desktop App (Windows / Mac)
            </a>
            <a
              href="/CreatorIQ-Mobile.apk"
              download="CreatorIQ-Mobile.apk"
              className="btn-gold"
            >
              <Icon name="download" size={16} /> Download Mobile APK (Android)
            </a>
          </div>
        </div>
      </section>

      <footer className="om-footer">
        <strong>CreatorIQ</strong> · Quietly Commanding Creator Intelligence · Later Instagram extension will also be introduced.
      </footer>
    </div>
  );
}
