export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  freeCurrencyApi: {
    baseUrl:
      process.env.FREE_CURRENCY_API_BASE_URL ??
      'https://api.freecurrencyapi.com/v1',
    apiKey: process.env.FREE_CURRENCY_API_KEY ?? '',
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    jwtIssuer: process.env.SUPABASE_JWT_ISSUER ?? '',
    jwtAudience: process.env.SUPABASE_JWT_AUDIENCE ?? 'authenticated',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    ratesCacheTtlSeconds: parseInt(
      process.env.RATES_CACHE_TTL_SECONDS ?? '600',
      10,
    ),
  },
});
