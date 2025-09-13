import { useEffect, useState } from "react";
import { me } from "../api/auth";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setProfile(data);
      } catch {
        setErr("Failed to load profile");
      }
    })();
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  if (err) return <div style={{ padding: 16 }}>{err}</div>;
  if (!profile) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <b>{profile?.username || profile?.email}</b>
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
