export interface CurrencyOption {
  code: string;
  label: string;
}

/** Response from `GET /api/currency/supported`: `{ data: string[] }`. */
export function parseSupportedCurrenciesResponse(
  payload: unknown,
): CurrencyOption[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data
    .filter((c): c is string => typeof c === 'string' && c.length >= 3)
    .map((code) => {
      const upper = code.toUpperCase();
      return { code: upper, label: upper };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function parseCurrencyOptions(payload: unknown): CurrencyOption[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: Record<string, unknown> }).data;
  if (!data || typeof data !== 'object') return [];

  return Object.entries(data)
    .map(([code, meta]) => {
      let name = code;
      if (typeof meta === 'string') {
        name = meta;
      } else if (meta && typeof meta === 'object' && 'name' in meta) {
        const n = (meta as { name?: unknown }).name;
        if (typeof n === 'string') name = n;
      }
      return { code, label: `${code} — ${name}` };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}
