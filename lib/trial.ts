export type BillingMode = "demo" | "paid";

function getTrialStorageKey(companyId: string) {
  return `postmeister_trial_usage_${companyId}`;
}

export function getTrialUsage(companyId: string): number {
  if (typeof window === "undefined") return 0;

  const raw = window.localStorage.getItem(getTrialStorageKey(companyId));
  const value = raw ? Number(raw) : 0;

  return Number.isFinite(value) ? value : 0;
}

export function incrementTrialUsage(companyId: string): number {
  if (typeof window === "undefined") return 0;

  const next = getTrialUsage(companyId) + 1;
  window.localStorage.setItem(getTrialStorageKey(companyId), String(next));
  return next;
}

export function resetTrialUsage(companyId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getTrialStorageKey(companyId));
}

export function getRemainingTrialGenerations(
  companyId: string,
  trialLimit: number
): number {
  return Math.max(0, trialLimit - getTrialUsage(companyId));
}
