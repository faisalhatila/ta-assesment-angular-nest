/* Default for local `ng build` / repo checkout. CI overwrites via scripts/write-prod-secrets.mjs */
export const prodSecrets = {
  apiBaseUrl: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
} as const;
