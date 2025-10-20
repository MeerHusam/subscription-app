const BASE = import.meta.env.VITE_API_BASE_URL;

// Custom error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid or expired
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return null;
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return null;
  }
}

export async function api(path: string, opts: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem("access_token");
  const headers = new Headers(opts.headers);

  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${BASE}${path}`, { ...opts, headers });

  // Handle 401 Unauthorized - try to refresh token
  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry original request with new token
        headers.set("Authorization", `Bearer ${newToken}`);
        res = await fetch(`${BASE}${path}`, { ...opts, headers });
      }
    } else {
      // Wait for token refresh to complete
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${BASE}${path}`, { ...opts, headers });
    }
  }

  // Handle errors
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    let errorData: unknown = undefined;

    try {
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorData = await res.json();
        errorMessage =
          (errorData as any)?.detail ||
          (errorData as any)?.message ||
          errorMessage;
      } else {
        errorMessage = await res.text();
      }
    } catch {
      // If parsing fails, use default error message
    }

    throw new ApiError(errorMessage, res.status, errorData);
  }

  // Handle empty responses (like DELETE)
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return null;
}
