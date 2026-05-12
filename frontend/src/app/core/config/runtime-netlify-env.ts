import { environment } from '../../../environments/environment';

type RuntimePublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
};

let runtime: RuntimePublicEnv | null = null;

function looksLikePlaceholderUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    !u ||
    u.includes('your_project') ||
    u.includes('placeholder') ||
    u.startsWith('https://example.')
  );
}

function looksLikePlaceholderKey(key: string): boolean {
  const k = key.trim();
  return !k || k.includes('YOUR_') || k === 'your-anon-key';
}

/**
 * Load public env from Netlify Function (runtime). Call once from main.ts before bootstrap.
 * Overrides missing or placeholder values from the production bundle.
 */
export async function loadNetlifyRuntimePublicEnv(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!environment.production) return;

  try {
    const res = await fetch('/.netlify/functions/supabase-runtime-config', {
      cache: 'no-store',
    });
    if (!res.ok) return;
    const j = (await res.json()) as Partial<RuntimePublicEnv>;
    const supabaseUrl = (j.supabaseUrl ?? '').trim();
    const supabaseAnonKey = (j.supabaseAnonKey ?? '').trim();
    const apiBaseUrl = (j.apiBaseUrl ?? '').trim();
    if (supabaseUrl && supabaseAnonKey) {
      runtime = { supabaseUrl, supabaseAnonKey, apiBaseUrl };
    }
  } catch {
    /* not on Netlify or function unavailable */
  }
}

export function getSupabaseUrl(): string {
  const r = runtime?.supabaseUrl?.trim();
  if (r) return r;
  const e = (environment.supabaseUrl ?? '').trim();
  return looksLikePlaceholderUrl(e) ? '' : e;
}

export function getSupabaseAnonKey(): string {
  const r = runtime?.supabaseAnonKey?.trim();
  if (r) return r;
  const e = (environment.supabaseAnonKey ?? '').trim();
  return looksLikePlaceholderKey(e) ? '' : e;
}

export function getApiBaseUrl(): string {
  const r = runtime?.apiBaseUrl?.trim();
  if (r) return r;
  const e = (environment.apiBaseUrl ?? '').trim();
  if (e.toLowerCase().includes('your_backend')) return '';
  return e;
}
