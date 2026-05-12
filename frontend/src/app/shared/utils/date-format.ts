/** Local calendar date as YYYY-MM-DD (matches Nest `@IsISO8601({ strict: true })` date-only). */
export function toIsoDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameLocalCalendarDate(a: Date, b: Date): boolean {
  return toIsoDateOnly(a) === toIsoDateOnly(b);
}
