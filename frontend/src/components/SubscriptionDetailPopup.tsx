// src/components/SubscriptionDetailPopup.tsx
import React from "react";
import type { Subscription } from "../api/subscriptions";

type Props = {
  subscription: Subscription;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void; // delete from popup
  onToggleActive: () => void; // cancel/reactivate from popup
  getCategoryStyle: (category: string) => string;
  getCategoryLabel: (
    category: string | null,
    customCategory?: string | null
  ) => string;
};

const SubscriptionDetailPopup: React.FC<Props> = ({
  subscription,
  onClose,
  onEdit,
  onDelete,
  onToggleActive,
  getCategoryStyle,
  getCategoryLabel,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!subscription) return null;

  // NEW: confirm before toggle
  const handleConfirmToggle = () => {
    const action = subscription.is_active ? "cancel (pause)" : "reactivate";
    const msg = subscription.is_active
      ? `Cancel “${subscription.service_name}”? You can reactivate it anytime.`
      : `Reactivate “${subscription.service_name}”?`;

    if (!confirm(msg)) return;
    onToggleActive();
  };

  const monthlyEquivalent = (() => {
    const cost = Number(subscription.cost);
    if (subscription.billing_cycle === "yearly") return (cost / 12).toFixed(2);
    if (subscription.billing_cycle === "custom") {
      const intervalValue = Number((subscription as any).custom_interval_value);
      const unit = (subscription as any).custom_interval_unit;
      if (unit === "months") return (cost / intervalValue).toFixed(2);
      if (unit === "days") return ((cost / intervalValue) * 30.44).toFixed(2);
    }
    return cost.toFixed(2); // monthly
  })();

  const daysUntilRenewal = subscription.renewal_date
    ? Math.ceil(
        (new Date(subscription.renewal_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {subscription.service_name}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(
                subscription.category
              )}`}
            >
              {getCategoryLabel(
                subscription.category,
                subscription.custom_category
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close popup"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {subscription.billing_cycle === "custom"
                  ? `Cost per ${(subscription as any).custom_interval_value} ${
                      (subscription as any).custom_interval_unit
                    }`
                  : subscription.billing_cycle === "yearly"
                  ? "Yearly Cost"
                  : "Monthly Cost"}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                SR{Number(subscription.cost).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Monthly Equivalent
              </h3>
              <p className="text-2xl font-bold text-green-600">
                SR{monthlyEquivalent}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Billing Cycle
              </h4>
              <p className="text-gray-800 capitalize">
                {subscription.billing_cycle === "custom"
                  ? `Every ${(subscription as any).custom_interval_value} ${
                      (subscription as any).custom_interval_unit
                    }`
                  : subscription.billing_cycle}
              </p>
            </div>

            {subscription.renewal_date && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Next Renewal Date
                </h4>
                <p className="text-gray-800">
                  {new Date(subscription.renewal_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {subscription.start_date && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Start Date
                </h4>
                <p className="text-gray-800">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  subscription.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {subscription.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {subscription.has_free_trial && subscription.trial_end_date && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Free Trial
              </h4>
              <p className="text-yellow-700">
                Trial ends on{" "}
                {new Date(subscription.trial_end_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {subscription.billing_cycle === "custom" && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Custom Billing Details
              </h4>
              <p className="text-gray-700">
                Billed every {(subscription as any).custom_interval_value}{" "}
                {(subscription as any).custom_interval_unit}
              </p>
            </div>
          )}

          {subscription.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
              <p className="text-gray-700 leading-relaxed">
                {subscription.notes}
              </p>
            </div>
          )}

          {subscription.is_active && subscription.renewal_date && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Renewal Information
              </h4>
              <p className="text-blue-700">
                {daysUntilRenewal && daysUntilRenewal > 0
                  ? `Renews in ${daysUntilRenewal} day${
                      daysUntilRenewal !== 1 ? "s" : ""
                    }`
                  : "Renewal is overdue"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmToggle} // ← use the confirm wrapper
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                subscription.is_active
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                  : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              }`}
            >
              {subscription.is_active ? (
                <>
                  {/* pause icon */}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  {/* activate icon */}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Activate
                </>
              )}
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailPopup;
