// scripts/utils.js
// ES module helpers for shared, pure utilities.
// Keep functions small and predictable.

// ----------------------------
// Date Helpers
// ----------------------------
// formatDate(date): formats a Date or parseable value as YYYY-MM-DD.
// Returns an empty string if the input is invalid.
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

