import React from "react";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  title?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showBackButton = false,
  showHomeButton = true,
  title = "Subscription Manager",
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}
    >
      <Header
        showBackButton={showBackButton}
        showHomeButton={showHomeButton}
        title={title}
      />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
