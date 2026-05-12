/**
 * Runtime public config for the Angular app (no secrets beyond the public anon key).
 * Netlify: set SUPABASE_URL, SUPABASE_ANON_KEY, optional API_BASE_URL.
 * Scope can be "Functions", "Runtime", or "All" — not required at build time.
 */
exports.handler = async () => {
  const body = JSON.stringify({
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? '',
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body,
  };
};
