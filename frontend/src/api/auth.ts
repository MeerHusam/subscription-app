import { api } from "./fetch";

export const login = (data: { username: string; password: string }) =>
  api("/auth/jwt/create/", { method: "POST", body: JSON.stringify(data) });

export const register = (data: {
  email: string;
  username: string;
  password: string;
}) => api("/auth/register/", { method: "POST", body: JSON.stringify(data) });

export const me = () => api("/auth/me/");
