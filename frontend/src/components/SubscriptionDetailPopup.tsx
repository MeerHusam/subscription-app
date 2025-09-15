// src/components/SubscriptionDetailPopup.jsx
import React from "react";

const SubscriptionDetailPopup = ({
  subscription,
  onClose,
  getCategoryStyle,
  getCategoryLabel,
}) => {
  // Handle backdrop click to close
  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!subscription) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {subscription.name}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(
                subscription.category
              )}`}
            >
              {getCategoryLabel(subscription.category)}
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
          {/* Cost Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Monthly Cost
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                SR{subscription.cost?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Annual Cost
              </h3>
              <p className="text-2xl font-bold text-green-600">
                SR{((subscription.cost || 0) * 12).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscription.billingCycle && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Billing Cycle
                </h4>
                <p className="text-gray-800 capitalize">
                  {subscription.billingCycle}
                </p>
              </div>
            )}

            {subscription.nextBillingDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Next Billing Date
                </h4>
                <p className="text-gray-800">
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {subscription.startDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Start Date
                </h4>
                <p className="text-gray-800">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  subscription.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {subscription.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Description */}
          {subscription.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Description
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {subscription.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          {subscription.website && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Website
              </h4>
              <a
                href={subscription.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {subscription.website}
              </a>
            </div>
          )}

          {/* Payment Method */}
          {subscription.paymentMethod && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Payment Method
              </h4>
              <p className="text-gray-700">{subscription.paymentMethod}</p>
            </div>
          )}

          {/* Notes */}
          {subscription.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
              <p className="text-gray-700 leading-relaxed">
                {subscription.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // You can add edit functionality here
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailPopup;
