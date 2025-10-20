import { api } from "./fetch";
import type { AuthTokens, User } from "../types/api";

export const login = (data: {
  username: string;
  password: string;
}): Promise<AuthTokens> =>
  api("/auth/jwt/create/", { method: "POST", body: JSON.stringify(data) });

export const register = (data: {
  email: string;
  username: string;
  password: string;
}): Promise<User> =>
  api("/auth/register/", { method: "POST", body: JSON.stringify(data) });

export const me = (): Promise<User> => api("/auth/me/");
