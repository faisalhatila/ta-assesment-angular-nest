import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from '../config/runtime-netlify-env';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly client: SupabaseClient | null = this.createClientSafe();

  /** Mirrors Supabase session; updated on init and every auth event (incl. refresh). */
  readonly session = signal<Session | null>(null);

  readonly user = signal<User | null>(null);

  async initialize(): Promise<void> {
    if (!this.client) return;
    const {
      data: { session },
    } = await this.client.auth.getSession();
    this.applySession(session);

    this.client.auth.onAuthStateChange((event, session) => {
      this.applySession(session);
      this.routeAfterAuthEvent(event, session);
    });
  }

  get supabase(): SupabaseClient | null {
    return this.client;
  }

  accessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async signUp(email: string, password: string): Promise<void> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
    await this.router.navigateByUrl('/auth');
  }

  /**
   * Refresh access token (RS256 JWT verified by Nest). Used after HTTP 401 before retry.
   */
  async refreshAccessToken(): Promise<string | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.auth.refreshSession();
    if (error || !data.session) return null;
    this.applySession(data.session);
    return data.session.access_token;
  }

  private createClientSafe(): SupabaseClient | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Supabase URL or anon key missing. Dev: environment.development.ts. ' +
          'Production (Netlify): set SUPABASE_URL and SUPABASE_ANON_KEY (Functions or All scope) ' +
          'or bake them at build via write-prod-secrets.',
      );
      return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
      },
    });
  }

  private applySession(session: Session | null): void {
    this.session.set(session);
    this.user.set(session?.user ?? null);
  }

  private routeAfterAuthEvent(
    event: AuthChangeEvent,
    session: Session | null,
  ): void {
    if (
      (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
      session?.user
    ) {
      const onAuth = this.router.url.startsWith('/auth');
      if (onAuth) void this.router.navigateByUrl('/converter');
    }
  }
}
