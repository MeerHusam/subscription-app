import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login({ username, password });
      localStorage.setItem("access_token", res.access);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{ width: "100%", maxWidth: 380, display: "grid", gap: 12 }}
      >
        <h1>Sign in</h1>
        <input
          placeholder="Email/Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <small style={{ color: "crimson" }}>{err}</small>}
        <button disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <small>
          New here? <Link to="/register">Create account</Link>
        </small>
      </form>
    </div>
  );
}
