import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { me } from "../api/auth";

export default function Protected() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Validate token by calling /me endpoint
        await me();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
      }
    };

    validateToken();
  }, []);

  // Show loading state while validating
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
