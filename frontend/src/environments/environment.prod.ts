import { prodSecrets } from './environment.prod.secrets';

/** When `API_BASE_URL` is unset at build (e.g. deploy previews), call Render directly. */
const DEFAULT_PROD_API_BASE_URL =
  'https://ta-assesment-angular-nest.onrender.com/api';

/**
 * Production bundle reads values from `environment.prod.secrets.ts`.
 * On Netlify/CI, run `node scripts/write-prod-secrets.mjs` before `ng build` to fill that file from env.
 */
export const environment = {
  production: true,
  apiBaseUrl:
    prodSecrets.apiBaseUrl.trim() || DEFAULT_PROD_API_BASE_URL,
  supabaseUrl: prodSecrets.supabaseUrl.trim(),
  supabaseAnonKey: prodSecrets.supabaseAnonKey.trim(),
};
