import React from "react";
import { ArrowLeft, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define the props interface
interface HeaderProps {
  showBackButton?: boolean;
  showHomeButton?: boolean;
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  showHomeButton = true,
  title = "Subscription Manager",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  const handleBack = (): void => {
    navigate(-1); // Go back to previous page
  };

  const handleHome = (): void => {
    navigate("/");
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back/Home button */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                type="button"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {showHomeButton && !showBackButton && (
              <button
                onClick={handleHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                type="button"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}

            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                {title}
              </h1>
            </div>
          </div>

          {/* Right side - Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            type="button"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
