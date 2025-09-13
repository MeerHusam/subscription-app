const BASE = import.meta.env.VITE_API_BASE_URL;

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("access_token"); // grab token if logged in
  const headers = new Headers(opts.headers);

  headers.set("Content-Type", "application/json"); // always send JSON
  if (token) headers.set("Authorization", `Bearer ${token}`); // attach token

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (!res.ok) throw new Error(await res.text()); // throw error if status isnt 2xx
  return res.json(); // parse and return JSON
}
