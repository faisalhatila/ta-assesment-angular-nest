type EnvMap = Record<string, string | undefined>;

function requireEnv(env: EnvMap, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function validateEnv(env: EnvMap): EnvMap {
  if (env.NODE_ENV === 'test') {
    return {
      ...env,
      FREE_CURRENCY_API_KEY: env.FREE_CURRENCY_API_KEY ?? 'test-key',
      SUPABASE_URL: env.SUPABASE_URL ?? 'https://example.supabase.co',
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ?? 'test-anon',
      SUPABASE_SERVICE_ROLE_KEY:
        env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role',
      SUPABASE_JWT_ISSUER:
        env.SUPABASE_JWT_ISSUER ?? 'https://example.supabase.co/auth/v1',
    };
  }

  requireEnv(env, 'FREE_CURRENCY_API_KEY');
  requireEnv(env, 'SUPABASE_URL');
  requireEnv(env, 'SUPABASE_ANON_KEY');
  requireEnv(env, 'SUPABASE_SERVICE_ROLE_KEY');
  requireEnv(env, 'SUPABASE_JWT_ISSUER');
  return env;
}
