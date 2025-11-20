import { useEffect, useMemo, useState } from "react";
import { Plus, DollarSign, Calendar, TrendingUp, X } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
  getSubscriptionDetails,
  type Subscription,
  type BillingCycle,
  type IntervalUnit,
} from "../api/subscriptions";
import type { SubscriptionStats } from "../types/api";
import { ApiError } from "../api/fetch";

import Layout from "../components/Layout";
import SubscriptionDetailPopup from "../components/SubscriptionDetailPopup";

type FormState = {
  service_name: string;
  cost: string; // keep as string for input
  billing_cycle: BillingCycle;
  custom_interval_unit: IntervalUnit | "";
  custom_interval_value: string;
  start_date: string; // YYYY-MM-DD
  is_active: boolean;
  category: string;
  custom_category: string;
  has_free_trial: boolean;
  trial_end_date: string; // YYYY-MM-DD
  notes: string;
};

const emptyForm: FormState = {
  service_name: "",
  cost: "",
  billing_cycle: "monthly",
  custom_interval_unit: "",
  custom_interval_value: "",
  start_date: "",
  is_active: true,
  category: "streaming",
  custom_category: "",
  has_free_trial: false,
  trial_end_date: "",
  notes: "",
};

const categories = [
  {
    value: "streaming",
    label: "🎬 Streaming",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "productivity",
    label: "💼 Productivity",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "gaming", label: "🎮 Gaming", color: "bg-green-100 text-green-800" },
  { value: "cloud", label: "☁️ Cloud/Dev", color: "bg-gray-100 text-gray-800" },
  {
    value: "education",
    label: "📚 Education",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "fitness", label: "💪 Fitness", color: "bg-red-100 text-red-800" },
  {
    value: "finance",
    label: "💰 Finance",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "custom",
    label: "⚙️ Custom",
    color: "bg-orange-100 text-orange-800",
  },
];

export default function Dashboard() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Detail popup state
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [_, setLoadingDetails] = useState(false);

  const activeSubscriptions = useMemo(
    () => items.filter((s) => s.is_active),
    [items]
  );
  const inactiveSubscriptions = useMemo(
    () => items.filter((s) => !s.is_active),
    [items]
  );

  // Calculate normalized monthly cost for a subscription
  const getNormalizedMonthlyCost = (subscription: Subscription) => {
    const cost = Number(subscription.cost);
    switch (subscription.billing_cycle) {
      case "monthly":
        return cost;
      case "yearly":
        return cost / 12;
      case "custom":
        const intervalValue = subscription.custom_interval_value || 1;
        const intervalUnit = subscription.custom_interval_unit || "months";
        if (intervalUnit === "months") {
          return cost / intervalValue;
        } else if (intervalUnit === "days") {
          return (cost / intervalValue) * 30.44; // Average days per month
        }
        return cost;
      default:
        return cost;
    }
  };

  // Calculate pie chart data for billing cycles
  const billingCycleData = useMemo(() => {
    const monthly = activeSubscriptions.filter(
      (s) => s.billing_cycle === "monthly"
    ).length;
    const yearly = activeSubscriptions.filter(
      (s) => s.billing_cycle === "yearly"
    ).length;
    const custom = activeSubscriptions.filter(
      (s) => s.billing_cycle === "custom"
    ).length;

    return [
      { name: "Monthly", value: monthly, color: "#3B82F6" },
      { name: "Yearly", value: yearly, color: "#10B981" },
      { name: "Custom", value: custom, color: "#F59E0B" },
    ].filter((item) => item.value > 0);
  }, [activeSubscriptions]);

  // Calculate category data for bar chart
  const categoryData = useMemo(() => {
    const categoryMap = new Map();

    activeSubscriptions.forEach((sub) => {
      const categoryKey =
        sub.category === "custom" && sub.custom_category
          ? sub.custom_category
          : sub.category;

      if (categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, categoryMap.get(categoryKey) + 1);
      } else {
        categoryMap.set(categoryKey, 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count,
        color: categories.find((c) => c.value === category)?.color || "#6B7280",
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeSubscriptions]);

  // Get most expensive subscriptions (normalized to monthly)
  const mostExpensiveSubscriptions = useMemo(() => {
    return activeSubscriptions
      .map((sub) => ({
        ...sub,
        normalizedMonthlyCost: getNormalizedMonthlyCost(sub),
      }))
      .sort((a, b) => b.normalizedMonthlyCost - a.normalizedMonthlyCost)
      .slice(0, 3);
  }, [activeSubscriptions]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([
        listSubscriptions({ include_inactive: true }),
        getSubscriptionStats({ include_inactive: false }),
      ]);
      setItems(list);
      setStats(s);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to load subscriptions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const cycleIsCustom = form.billing_cycle === "custom";
  const categoryIsCustom = form.category === "custom";

  const canSubmit = useMemo(() => {
    if (!form.service_name || !form.cost || !form.start_date) return false;
    if (
      cycleIsCustom &&
      (!form.custom_interval_unit || !form.custom_interval_value)
    )
      return false;
    if (form.has_free_trial && !form.trial_end_date) return false;
    if (categoryIsCustom && !form.custom_category.trim()) return false;
    return true;
  }, [form, cycleIsCustom, categoryIsCustom]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload: Partial<Subscription> = {
        service_name: form.service_name,
        cost: Number(form.cost),
        billing_cycle: form.billing_cycle,
        start_date: form.start_date,
        is_active: form.is_active,
        category: form.category,
        custom_category: categoryIsCustom ? form.custom_category : "",
        has_free_trial: form.has_free_trial,
        trial_end_date: form.has_free_trial ? form.trial_end_date : null,
        notes: form.notes || "",
        ...(cycleIsCustom && {
          custom_interval_unit: form.custom_interval_unit as IntervalUnit,
          custom_interval_value: Number(form.custom_interval_value),
        }),
      };

      if (editingId) await updateSubscription(editingId, payload);
      else await createSubscription(payload);

      setForm({ ...emptyForm });
      setShowForm(false);
      setEditingId(null);
      await refresh();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Operation failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Quick list actions
  async function cancelSubscriptionAction(subscription: Subscription) {
    try {
      await updateSubscription(subscription.id, { is_active: false });
      await refresh();
      // If popup is open for the same sub, mirror state change immediately
      if (selectedSubscription?.id === subscription.id) {
        setSelectedSubscription({ ...selectedSubscription, is_active: false });
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Failed to cancel subscription";
      setError(message);
    }
  }

  async function reactivateSubscriptionAction(subscription: Subscription) {
    try {
      await updateSubscription(subscription.id, { is_active: true });
      await refresh();
      if (selectedSubscription?.id === subscription.id) {
        setSelectedSubscription({ ...selectedSubscription, is_active: true });
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Failed to reactivate subscription";
      setError(message);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this subscription?")) return;
    try {
      await deleteSubscription(id);
      await refresh();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Delete failed";
      setError(message);
    }
  }

  // Form prefill for full edit
  function onEdit(subscription: Subscription) {
    setForm({
      service_name: subscription.service_name,
      cost: subscription.cost.toString(),
      billing_cycle: subscription.billing_cycle,
      custom_interval_unit: subscription.custom_interval_unit || "",
      custom_interval_value: subscription.custom_interval_value?.toString() || "",
      start_date: subscription.start_date,
      is_active: subscription.is_active,
      category: subscription.category,
      custom_category: subscription.custom_category || "",
      has_free_trial: subscription.has_free_trial,
      trial_end_date: subscription.trial_end_date || "",
      notes: subscription.notes || "",
    });
    setEditingId(subscription.id);
    setShowForm(true);
  }

  function getCategoryStyle(category: string) {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.color : "bg-gray-100 text-gray-800";
  }

  function getCategoryLabel(
    category: string | null,
    customCategory?: string | null
  ) {
    if (!category) return "Unknown";
    if (category === "custom" && customCategory) return `⚙️ ${customCategory}`;
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  }

  // DETAILS POPUP: open + fetch fresh details
  const handleShowDetails = async (subscription: Subscription) => {
    setLoadingDetails(true);
    setShowDetailPopup(true);
    setSelectedSubscription(subscription); // show basic immediately
    try {
      const detailed = await getSubscriptionDetails(subscription.id);
      setSelectedSubscription(detailed);
    } catch (error) {
      console.error("Failed to fetch subscription details:", error);
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to load subscription details";
      setError(message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailPopup(false);
    setSelectedSubscription(null);
  };

  // ✅ NEW: Toggle active from inside the popup
  const handleToggleActiveInPopup = async () => {
    if (!selectedSubscription) return;
    try {
      const newIsActive = !selectedSubscription.is_active;
      await updateSubscription(selectedSubscription.id, {
        is_active: newIsActive,
      });
      // reflect immediately in popup
      setSelectedSubscription({
        ...selectedSubscription,
        is_active: newIsActive,
      });
      // refresh lists/stats
      await refresh();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Update failed";
      setError(message);
    }
  };

  // ✅ NEW: Delete from inside the popup
  const handleDeleteInPopup = async () => {
    if (!selectedSubscription) return;
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await deleteSubscription(selectedSubscription.id);
      await refresh();
      handleCloseDetails();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Delete failed";
      setError(message);
    }
  };

  const nextRenewals = activeSubscriptions
    .slice()
    .sort(
      (a, b) =>
        new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
    )
    .slice(0, 3);

  return (
    <Layout title="Subscriptions">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, manage your subscriptions and finances
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm({ ...emptyForm });
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={16} />
              Add Subscription
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<DollarSign className="text-green-600" size={24} />}
              label="Monthly Total"
              value={`SR${stats.normalized_monthly_total}`}
              trend="+-% vs last month"
              gradient="from-green-400 to-emerald-500"
            />
            <StatCard
              icon={<TrendingUp className="text-blue-600" size={24} />}
              label="Active Subscriptions"
              value={stats.total_subscriptions}
              trend={`${stats.monthly_subscriptions} monthly, ${
                stats.yearly_subscriptions
              } yearly, ${
                stats.total_subscriptions -
                (stats.monthly_subscriptions + stats.yearly_subscriptions)
              } custom`}
              gradient="from-blue-400 to-cyan-500"
            />
            <StatCard
              icon={<Calendar className="text-purple-600" size={24} />}
              label="Next Renewal"
              value={
                nextRenewals[0]
                  ? new Date(nextRenewals[0].renewal_date).toLocaleDateString()
                  : "None"
              }
              trend={nextRenewals[0]?.service_name || "No active subscriptions"}
              gradient="from-purple-400 to-pink-500"
            />
            <StatCard
              icon={<DollarSign className="text-orange-600" size={24} />}
              label="Yearly Savings"
              value="SR-"
              trend="vs monthly billing"
              gradient="from-orange-400 to-red-500"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Billing Cycle Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Billing Cycle Distribution
            </h3>
            {billingCycleData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={billingCycleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value, percent }: any) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {billingCycleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No active subscriptions
              </div>
            )}
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Subscriptions by Category
            </h3>
            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No active subscriptions
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Subscriptions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Subscriptions ({activeSubscriptions.length})
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : activeSubscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">📊</div>
                    <p className="text-gray-500">
                      No active subscriptions found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSubscriptions.map((item) => (
                      <SubscriptionCard
                        key={item.id}
                        subscription={item}
                        onShowDetails={() => handleShowDetails(item)}
                        onCancel={() => cancelSubscriptionAction(item)}
                        onReactivate={() => reactivateSubscriptionAction(item)}
                        onDelete={() => onDelete(item.id)}
                        onEdit={() => onEdit(item)}
                        getCategoryStyle={getCategoryStyle}
                        getCategoryLabel={getCategoryLabel}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Popup Component */}
          {showDetailPopup && selectedSubscription && (
            <SubscriptionDetailPopup
              subscription={selectedSubscription}
              onClose={handleCloseDetails}
              getCategoryStyle={getCategoryStyle}
              getCategoryLabel={getCategoryLabel}
              onEdit={() => onEdit(selectedSubscription)}
              onToggleActive={handleToggleActiveInPopup}
              onDelete={handleDeleteInPopup}
            />
          )}

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Most Expensive Subscriptions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Most Expensive (Monthly)
                </h3>
              </div>
              <div className="p-6">
                {mostExpensiveSubscriptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No active subscriptions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mostExpensiveSubscriptions.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-sm">
                              {item.service_name}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {item.billing_cycle}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            SR{item.normalizedMonthlyCost.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">/month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Upcoming Renewals
                </h3>
              </div>
              <div className="p-6">
                {nextRenewals.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming renewals</p>
                ) : (
                  <div className="space-y-3">
                    {nextRenewals.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {item.service_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.renewal_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          SR{Number(item.cost).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Categories
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {categories.slice(0, 5).map((cat) => {
                    const count = activeSubscriptions.filter(
                      (i) => i.category === cat.value
                    ).length;
                    if (count === 0) return null;
                    return (
                      <div
                        key={cat.value}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {cat.label}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${cat.color}`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Subscriptions Section */}
        {inactiveSubscriptions.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Past Subscriptions ({inactiveSubscriptions.length})
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {inactiveSubscriptions.map((item) => (
                    <SubscriptionCard
                      key={item.id}
                      subscription={item}
                      onShowDetails={() => handleShowDetails(item)}
                      onCancel={() => cancelSubscriptionAction(item)}
                      onReactivate={() => reactivateSubscriptionAction(item)}
                      onDelete={() => onDelete(item.id)}
                      onEdit={() => onEdit(item)}
                      getCategoryStyle={getCategoryStyle}
                      getCategoryLabel={getCategoryLabel}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Edit Subscription" : "Add Subscription"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({ ...emptyForm });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={form.service_name}
                  onChange={(e) =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Netflix, Spotify..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    value={form.billing_cycle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        billing_cycle: e.target.value as BillingCycle,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {cycleIsCustom && (
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={(form.custom_interval_unit || "months") as IntervalUnit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        custom_interval_unit: e.target.value as IntervalUnit,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Interval"
                    value={form.custom_interval_value}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        custom_interval_value: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {categoryIsCustom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Category
                  </label>
                  <input
                    type="text"
                    value={form.custom_category}
                    onChange={(e) =>
                      setForm({ ...form, custom_category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter custom category"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_free_trial}
                  onChange={(e) =>
                    setForm({ ...form, has_free_trial: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Has free trial</label>
              </div>

              {form.has_free_trial && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trial End Date
                  </label>
                  <input
                    type="date"
                    value={form.trial_end_date}
                    onChange={(e) =>
                      setForm({ ...form, trial_end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({ ...emptyForm });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  gradient?: string;
};

function StatCard({ icon, label, value, trend, gradient = "" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}
        >
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
        {trend && <div className="text-xs text-gray-400">{trend}</div>}
      </div>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  onShowDetails,
  getCategoryStyle,
  getCategoryLabel,
}: {
  subscription: Subscription;
  onShowDetails: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  getCategoryStyle: (category: string) => string;
  getCategoryLabel: (
    category: string | null,
    customCategory?: string | null
  ) => string;
}) {
  const isActive = subscription.is_active;
  const renewalDate = new Date(subscription.renewal_date);
  const daysUntilRenewal = Math.ceil(
    (renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
        isActive
          ? "bg-white border-gray-200"
          : "bg-gray-50 border-gray-100 opacity-75"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3
                className={`font-semibold ${
                  isActive ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {subscription.service_name}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getCategoryStyle(
                  subscription.category
                )}`}
              >
                {getCategoryLabel(
                  subscription.category,
                  subscription.custom_category
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                SR{Number(subscription.cost).toFixed(2)}
              </span>
              <span>•</span>
              <span className="capitalize">
                {subscription.billing_cycle === "custom"
                  ? "Custom"
                  : subscription.billing_cycle}
              </span>
              {isActive && (
                <>
                  <span>•</span>
                  <span
                    className={
                      daysUntilRenewal <= 7 ? "text-orange-600 font-medium" : ""
                    }
                  >
                    {daysUntilRenewal > 0
                      ? `${daysUntilRenewal} days until renewal`
                      : "Renewal overdue"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowDetails}
            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}
