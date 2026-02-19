/**
 * Format an amount in cents to a human-readable dollar string.
 * e.g. 15000 → "$150.00"
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
