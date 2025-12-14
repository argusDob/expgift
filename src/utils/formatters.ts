/**
 * Formats price from cents to euros
 * @param priceCents - Price in cents
 * @returns Formatted price string (e.g., "€50")
 */
export function formatPrice(priceCents: number): string {
  return `€${(priceCents / 100).toFixed(0)}`
}

/**
 * Formats duration from minutes to hours
 * @param durationMin - Duration in minutes
 * @returns Formatted duration string (e.g., "2h")
 */
export function formatDuration(durationMin: number): string {
  return `${Math.round(durationMin / 60)}h`
}

