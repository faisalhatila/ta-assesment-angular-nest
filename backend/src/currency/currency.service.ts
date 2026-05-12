import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CurrencyService {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.apiBaseUrl = this.configService.getOrThrow<string>(
      'freeCurrencyApi.baseUrl',
    );
    this.apiKey = this.configService.getOrThrow<string>(
      'freeCurrencyApi.apiKey',
    );
  }

  async getSymbols() {
    return this.getCachedOrFetch(
      'symbols',
      `${this.apiBaseUrl}/currencies?apikey=${this.apiKey}`,
    );
  }

  async getLatest(base: string) {
    const key = `latest:${base.toUpperCase()}`;
    return this.getCachedOrFetch(
      key,
      `${this.apiBaseUrl}/latest?apikey=${this.apiKey}&base_currency=${base.toUpperCase()}`,
    );
  }

  async getLatestPair(base: string, target: string) {
    const normalizedBase = base.toUpperCase();
    const normalizedTarget = target.toUpperCase();
    const key = `latest:${normalizedBase}:${normalizedTarget}`;
    return this.getCachedOrFetch(
      key,
      `${this.apiBaseUrl}/latest?apikey=${this.apiKey}&base_currency=${normalizedBase}&currencies=${normalizedTarget}`,
    );
  }

  async getHistorical(base: string, date: string) {
    const key = `historical:${base.toUpperCase()}:${date}`;
    return this.getCachedOrFetch(
      key,
      `${this.apiBaseUrl}/historical?apikey=${this.apiKey}&base_currency=${base.toUpperCase()}&date=${date}`,
    );
  }

  async getHistoricalPair(base: string, target: string, date: string) {
    const normalizedBase = base.toUpperCase();
    const normalizedTarget = target.toUpperCase();
    const key = `historical:${normalizedBase}:${normalizedTarget}:${date}`;
    return this.getCachedOrFetch(
      key,
      `${this.apiBaseUrl}/historical?apikey=${this.apiKey}&base_currency=${normalizedBase}&currencies=${normalizedTarget}&date=${date}`,
    );
  }

  private async getCachedOrFetch(key: string, url: string) {
    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadGatewayException('Currency provider is unavailable');
    }
    const payload = (await response.json()) as unknown;

    await this.redisService.set(
      key,
      JSON.stringify(payload),
      this.redisService.ratesCacheTtlSeconds,
    );
    return payload;
  }
}
