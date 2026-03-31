"use client";

// Lightweight analytics - logs events for future integration
// Can be replaced with Plausible, Umami, or custom endpoint

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
}

export function trackEvent({ event, properties }: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, properties);
  }

  // Future: send to analytics endpoint
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, properties, timestamp: Date.now() }) });
}

// Predefined events
export const analytics = {
  pageView: (page: string) =>
    trackEvent({ event: "page_view", properties: { page } }),
  citySelect: (cityName: string) =>
    trackEvent({ event: "city_select", properties: { city: cityName } }),
  filterApply: (filters: Record<string, string | number | boolean>) =>
    trackEvent({ event: "filter_apply", properties: filters }),
  listingClick: (listingId: string) =>
    trackEvent({ event: "listing_click", properties: { listing_id: listingId } }),
  reviewSubmit: (address: string) =>
    trackEvent({ event: "review_submit", properties: { address } }),
  publishStart: () =>
    trackEvent({ event: "publish_start" }),
  publishComplete: () =>
    trackEvent({ event: "publish_complete" }),
  loginSuccess: () =>
    trackEvent({ event: "login_success" }),
  registerSuccess: () =>
    trackEvent({ event: "register_success" }),
};
