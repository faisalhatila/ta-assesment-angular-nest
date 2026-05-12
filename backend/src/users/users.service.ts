import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile } from './user.types';

/** How long to keep supported currency codes in memory (avoids Supabase on every request). */
const SUPPORTED_CODES_CACHE_MS = 5 * 60 * 1000;

@Injectable()
export class UsersService {
  private readonly adminClient: SupabaseClient;
  private supportedCodesCache: { codes: Set<string>; expiresAt: number } | null =
    null;

  constructor(private readonly configService: ConfigService) {
    this.adminClient = createClient(
      this.configService.getOrThrow<string>('supabase.url'),
      this.configService.getOrThrow<string>('supabase.serviceRoleKey'),
      { auth: { persistSession: false } },
    );
  }

  async upsertProfile(input: Pick<Profile, 'id' | 'email'>): Promise<Profile> {
    const { data, error } = await this.adminClient
      .from('profiles')
      .upsert(
        {
          id: input.id,
          email: input.email,
          role: 'user',
        },
        { onConflict: 'id' },
      )
      .select('id,email,role')
      .single();
    if (error) throw error;
    return data;
  }

  async findProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await this.adminClient
      .from('profiles')
      .select('id,email,role')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  /**
   * True if both codes exist in supported_currencies.
   * Uses an in-memory cache of all codes (refreshed every few minutes) so repeat
   * requests avoid repeated Supabase latency (~100–400ms per call).
   */
  async areCurrenciesSupported(from: string, to: string): Promise<boolean> {
    const codes = await this.getSupportedCodesCached();
    return codes.has(from.toUpperCase()) && codes.has(to.toUpperCase());
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const codes = await this.getSupportedCodesCached();
    return Array.from(codes).sort();
  }

  private async getSupportedCodesCached(): Promise<Set<string>> {
    const now = Date.now();
    if (
      this.supportedCodesCache &&
      now < this.supportedCodesCache.expiresAt
    ) {
      return this.supportedCodesCache.codes;
    }

    const { data, error } = await this.adminClient
      .from('supported_currencies')
      .select('code');
    if (error) throw error;

    const codes = new Set(
      (data ?? []).map((row: { code: string }) => row.code.toUpperCase()),
    );
    this.supportedCodesCache = {
      codes,
      expiresAt: now + SUPPORTED_CODES_CACHE_MS,
    };
    return codes;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }
}
