import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getApiBaseUrl } from '../config/runtime-netlify-env';

export interface ConvertResponse {
  id?: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate: string;
  convertedAmount?: number;
  createdAt?: string;
}

export interface ConversionHistoryApiRow {
  id: number;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  rateDate: string;
  fingerprint: string;
  createdAt: string;
}

export interface ConversionHistoryQuery {
  fromCurrency?: string;
  toCurrency?: string;
  /** Exact rate_date (YYYY-MM-DD). */
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface ConvertRequest {
  from: string;
  to: string;
  amount: number;
  /** ISO8601 date (YYYY-MM-DD) for historical rates; omit for latest. */
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class CurrencyApiService {
  private readonly http = inject(HttpClient);

  getSymbols(): Observable<unknown> {
    return this.http.get<unknown>(`${this.base()}/currency/symbols`);
  }

  /** Auth required (JWT + fingerprint via interceptor). */
  getSupportedCurrencies(): Observable<unknown> {
    return this.http.get<unknown>(`${this.base()}/currency/supported`);
  }

  getLatest(base: string): Observable<unknown> {
    const params = new HttpParams().set('base', base);
    return this.http.get<unknown>(`${this.base()}/currency/latest`, {
      params,
    });
  }

  getHistorical(base: string, date: string): Observable<unknown> {
    const params = new HttpParams().set('base', base).set('date', date);
    return this.http.get<unknown>(`${this.base()}/currency/historical`, {
      params,
    });
  }

  convert(body: ConvertRequest): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(
      `${this.base()}/conversions/convert`,
      body,
    );
  }

  /** Auth required. Optional filters for currency codes and rate date. */
  getHistory(query?: ConversionHistoryQuery): Observable<ConversionHistoryApiRow[]> {
    let params = new HttpParams();
    if (query?.fromCurrency) {
      params = params.set('fromCurrency', query.fromCurrency);
    }
    if (query?.toCurrency) {
      params = params.set('toCurrency', query.toCurrency);
    }
    if (query?.date) {
      params = params.set('date', query.date);
    }
    if (query?.dateFrom) {
      params = params.set('dateFrom', query.dateFrom);
    }
    if (query?.dateTo) {
      params = params.set('dateTo', query.dateTo);
    }
    if (query?.limit != null) {
      params = params.set('limit', String(query.limit));
    }
    if (query?.offset != null) {
      params = params.set('offset', String(query.offset));
    }
    return this.http.get<ConversionHistoryApiRow[]>(
      `${this.base()}/conversions/history`,
      { params },
    );
  }

  health(): Observable<unknown> {
    return this.http.get<unknown>(`${this.base()}/health`);
  }

  /** Absolute or root-relative API prefix; always normalized for HttpClient. */
  private base(): string {
    const b = getApiBaseUrl().trim().replace(/\/$/, '');
    // Never return "/" alone: `${"/"}/currency/...}` becomes "//currency/..." which the browser
    // treats as protocol-relative (host "currency"), not same-origin + path.
    if (!b) return '';
    if (b.startsWith('http')) return b;
    return b.startsWith('/') ? b : `/${b}`;
  }
}
