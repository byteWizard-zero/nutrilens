/**
 * Date Utility Functions
 * 
 * Provides timezone-safe date operations to prevent server-client hydration mismatches
 * and timezone errors where user timezone offset differs from server UTC.
 */

/**
 * Returns YYYY-MM-DD representation of the local date (or custom date)
 * in the user's local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}
