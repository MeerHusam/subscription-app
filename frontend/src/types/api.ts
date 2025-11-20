// API Response Types

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  monthly_subscriptions: number;
  yearly_subscriptions: number;
  custom_subscriptions: number;
  raw_monthly_total: string;
  raw_yearly_total: string;
  normalized_monthly_total: string;
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
