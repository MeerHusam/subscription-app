import { api } from "./fetch";

export type BillingCycle = "monthly" | "yearly" | "custom";
export type IntervalUnit = "days" | "months";

export type Subscription = {
  id: number;
  service_name: string;
  cost: string | number;
  billing_cycle: BillingCycle;
  custom_interval_unit?: IntervalUnit | null;
  custom_interval_value?: number | null;
  start_date: string; // YYYY-MM-DD
  renewal_date: string; // read-only from server
  is_active: boolean;
  category: string; // "streaming" | "productivity" | ... | "custom"
  custom_category?: string;
  has_free_trial: boolean;
  trial_end_date?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
};

// list
export const listSubscriptions = (opts?: { include_inactive?: boolean }) =>
  api(`/subscriptions/${opts?.include_inactive ? "?include_inactive=1" : ""}`);

// create
export const createSubscription = (payload: Partial<Subscription>) =>
  api("/subscriptions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// update (PATCH)
export const updateSubscription = (
  id: number,
  payload: Partial<Subscription>
) =>
  api(`/subscriptions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// subscription details
export const getSubscriptionDetails = (id: number) =>
  api(`/subscriptions/${id}/`, { method: "GET" });

// delete
export const deleteSubscription = (id: number) =>
  api(`/subscriptions/${id}/`, { method: "DELETE" });

// stats
export const getSubscriptionStats = (opts?: { include_inactive?: boolean }) =>
  api(
    `/subscriptions/stats/${
      opts?.include_inactive ? "?include_inactive=1" : ""
    }`
  );
