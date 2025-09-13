import { Navigate, Outlet } from "react-router-dom";

export default function Protected() {
  return localStorage.getItem("access_token") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
