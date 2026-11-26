import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import AppLayout from "../components/AppLayout.jsx";
import api, { errorMessage } from "../api";

function YouTubeConfigCard() {
  const [apiKey, setApiKey] = useState("");
  const [channelHandle, setChannelHandle] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("creatoriq_yt_api_key");
    if (saved) setApiKey(saved);
  }, []);

  async function onSaveAndSync(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);

    if (apiKey.trim()) {
      localStorage.setItem("creatoriq_yt_api_key", apiKey.trim());
    }

    try {
      const res = await api.post("/api/youtube/sync", {
        channel_handle: channelHandle.trim() || undefined,
        api_key: apiKey.trim() || undefined,
      });
      setMsg({
        type: "success",
        text: `Successfully synced channel ${res.data.channel} (${res.data.total_posts} videos)!`,
      });
    } catch (err) {
      setMsg({ type: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card form-card" style={{ border: "1.5px solid var(--gold)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: "1.2rem" }}>🔑</span>
        <h2>YouTube Data API v3 Configuration</h2>
      </div>
      <p className="muted" style={{ fontSize: "0.88rem", marginBottom: 16 }}>
        Provide your Google Cloud YouTube Data API v3 key here. It will be stored in your browser session and sent with your sync requests.
      </p>

      <form onSubmit={onSaveAndSync} noValidate>
        <label>
          YouTube API Key (starts with AIzaSy...)
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your YouTube Data API v3 key here"
            autoComplete="off"
          />
        </label>
        <label>
          Channel Handle or URL (optional override)
          <input
            value={channelHandle}
            onChange={(e) => setChannelHandle(e.target.value)}
            placeholder="e.g. @MrBeast or https://youtube.com/@channel"
          />
        </label>
        {msg.text && <div className={msg.type === "error" ? "error" : "success"} role="alert">{msg.text}</div>}
        <button className="btn-gold" disabled={busy || !apiKey.trim()}>
          {busy ? "Syncing with YouTube..." : "Save Key & Sync Channel"}
        </button>
      </form>
    </article>
  );
}

function NameForm() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (name.trim().length < 2) return setMsg({ type: "error", text: "Name must be at least 2 characters." });
    setBusy(true);
    try {
      const res = await api.patch("/api/account/me", { name: name.trim() });
      updateUser(res.data);
      setMsg({ type: "success", text: "Name updated." });
    } catch (err) {
      setMsg({ type: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card form-card">
      <h2>Account details</h2>
      <form onSubmit={onSubmit} noValidate>
        <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        <label>Email<input value={user.email} disabled aria-describedby="email-note" /></label>
        <small id="email-note" className="muted">Your email is your login and cannot be changed here.</small>
        <label>Role<input value={user.role_label} disabled /></label>
        {msg.text && <div className={msg.type === "error" ? "error" : "success"} role="alert">{msg.text}</div>}
        <button className="btn" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
      </form>
    </article>
  );
}

function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (f.next.length < 8) return setMsg({ type: "error", text: "New password must be at least 8 characters." });
    if (!/[A-Za-z]/.test(f.next) || !/\d/.test(f.next))
      return setMsg({ type: "error", text: "New password must contain at least one letter and one number." });
    if (f.next !== f.confirm) return setMsg({ type: "error", text: "New passwords do not match." });
    setBusy(true);
    try {
      await api.post("/api/account/change-password", { current_password: f.current, new_password: f.next });
      setF({ current: "", next: "", confirm: "" });
      setMsg({ type: "success", text: "Password changed." });
    } catch (err) {
      setMsg({ type: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card form-card">
      <h2>Change password</h2>
      <form onSubmit={onSubmit} noValidate>
        <label>Current password<input type="password" value={f.current} onChange={set("current")} autoComplete="current-password" /></label>
        <label>New password<input type="password" value={f.next} onChange={set("next")} placeholder="8+ characters, letters and numbers" autoComplete="new-password" /></label>
        <label>Confirm new password<input type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" /></label>
        {msg.text && <div className={msg.type === "error" ? "error" : "success"} role="alert">{msg.text}</div>}
        <button className="btn" disabled={busy || !f.current}>{busy ? "Changing..." : "Change password"}</button>
      </form>
    </article>
  );
}

function DangerZone() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onConfirm(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/account/deactivate", { password });
      logout();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <article className="card form-card danger">
      <h2>Deactivate account</h2>
      {user.role === "admin" ? (
        <p className="muted">Administrator accounts cannot be deactivated from here.</p>
      ) : !open ? (
        <>
          <p className="muted">Your account will be disabled and you will be logged out. An administrator can enable it again.</p>
          <button className="btn-danger" onClick={() => setOpen(true)}>Deactivate my account</button>
        </>
      ) : (
        <form onSubmit={onConfirm} noValidate>
          <label>Enter your password to confirm<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <div className="error" role="alert">{error}</div>}
          <div className="row-btns">
            <button type="button" className="btn-outline" onClick={() => { setOpen(false); setPassword(""); setError(""); }}>Cancel</button>
            <button className="btn-danger" disabled={busy || !password}>{busy ? "Deactivating..." : "Yes, deactivate"}</button>
          </div>
        </form>
      )}
    </article>
  );
}

export default function Settings() {
  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage your credentials, YouTube API configuration, and account preferences.</p>
        </div>
      </div>
      <div className="settings-grid">
        <div className="stack">
          <YouTubeConfigCard />
          <NameForm />
        </div>
        <div className="stack">
          <PasswordForm />
          <DangerZone />
        </div>
      </div>
    </AppLayout>
  );
}
