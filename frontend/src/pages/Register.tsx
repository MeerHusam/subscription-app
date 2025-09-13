import { useState } from "react";
import { register as signup } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await signup({ email, username, password });
      nav("/login");
    } catch {
      setErr("Registration failed");
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
        style={{ width: "100%", maxWidth: 420, display: "grid", gap: 12 }}
      >
        <h1>Create account</h1>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Username"
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
        <button>Create account</button>
        <small>
          Already have an account? <Link to="/login">Sign in</Link>
        </small>
      </form>
    </div>
  );
}
