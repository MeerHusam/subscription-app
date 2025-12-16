

export default function EnvironmentBadge() {
  const envName = import.meta.env.VITE_ENV_NAME;

  // If no environment name is set, or it's "Production" (optional), don't show the badge
  // Adjust logic if you WANT to show Production badge
  if (!envName) return null;

  let bgColor = "bg-gray-800"; // Default
  if (envName === "Development") bgColor = "bg-blue-600";
  if (envName === "QA") bgColor = "bg-orange-600";
  if (envName === "Production") bgColor = "bg-red-600"; // Or green

  return (
    <div
      className={`fixed top-0 left-0 w-full ${bgColor} text-white text-xs font-bold text-center py-1 z-50 shadow-md`}
    >
      ENVIRONMENT: {envName.toUpperCase()}
    </div>
  );
}
