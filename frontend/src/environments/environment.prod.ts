import { prodSecrets } from './environment.prod.secrets';

/**
 * Production bundle reads values from `environment.prod.secrets.ts`.
 * On Netlify/CI, run `node scripts/write-prod-secrets.mjs` before `ng build` to fill that file from env.
 */
export const environment = {
  production: true,
  apiBaseUrl: prodSecrets.apiBaseUrl.trim(),
  supabaseUrl: prodSecrets.supabaseUrl.trim(),
  supabaseAnonKey: prodSecrets.supabaseAnonKey.trim(),
};
