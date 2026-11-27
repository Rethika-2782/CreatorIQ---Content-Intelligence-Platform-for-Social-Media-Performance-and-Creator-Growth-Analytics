import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { useAuth } from "../AuthContext.jsx";
import { errorMessage } from "../api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Quick checks for fast feedback. The backend validates again.
  function validate() {
    if (form.name.trim().length < 2) return "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return "Password must contain at least one letter and one number.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    setError("");
    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "creator",
      });
      navigate("/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1>Create your creator account</h1>
      <p className="sub">Start tracking your content in a few minutes.</p>

      <form onSubmit={onSubmit} noValidate>
        <label>
          Full name
          <input value={form.name} onChange={set("name")} placeholder="Your full name" autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set("password")} placeholder="8+ characters, letters and numbers" autoComplete="new-password" />
        </label>
        <label>
          Confirm password
          <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" autoComplete="new-password" />
        </label>

        {error && <div className="error" role="alert">{error}</div>}

        <button className="btn" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
