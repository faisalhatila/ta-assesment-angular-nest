import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';
import { UsersService } from '../users/users.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { ConversionHistoryQueryDto } from './dto/conversion-history-query.dto';
import type { AuthUser } from '../auth/auth.types';

export interface ConversionHistoryRow {
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

@Injectable()
export class ConversionsService {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly usersService: UsersService,
  ) {}

  async convert(
    dto: ConvertCurrencyDto,
    user: AuthUser,
    fingerprint: string,
  ) {
    const from = dto.from.toUpperCase();
    const to = dto.to.toUpperCase();

    const supported = await this.usersService.areCurrenciesSupported(from, to);
    if (!supported) {
      throw new BadRequestException(
        'Unsupported currency code. Use one of the supported currencies.',
      );
    }

    const ratePayload = dto.date
      ? await this.currencyService.getHistoricalPair(from, to, dto.date)
      : await this.currencyService.getLatestPair(from, to);
    const rates = (ratePayload as { data?: Record<string, number> }).data ?? {};
    const targetRate = rates[to];
    if (!targetRate) {
      throw new BadRequestException(`Rate not found for ${to}`);
    }

    const rateDate = dto.date ?? new Date().toISOString().slice(0, 10);
    const result = dto.amount * targetRate;

    const { data, error } = await this.usersService
      .getAdminClient()
      .from('conversion_history')
      .insert({
        user_id: user.id,
        from_currency: from,
        to_currency: to,
        amount: dto.amount,
        rate: targetRate,
        result,
        rate_date: rateDate,
        fingerprint,
      })
      .select('id,created_at')
      .single();

    if (error) throw error;

    return {
      id: data.id as number,
      fromCurrency: from,
      toCurrency: to,
      rate: targetRate,
      rateDate,
      convertedAmount: result,
      createdAt: data.created_at as string,
    };
  }

  async history(userId: string, query: ConversionHistoryQueryDto) {
    const limit = Math.min(query.limit ?? 50, 100);
    const offset = query.offset ?? 0;

    let q = this.usersService
      .getAdminClient()
      .from('conversion_history')
      .select(
        'id,user_id,from_currency,to_currency,amount,rate,result,rate_date,fingerprint,created_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (query.fromCurrency) {
      q = q.eq('from_currency', query.fromCurrency.toUpperCase());
    }
    if (query.toCurrency) {
      q = q.eq('to_currency', query.toCurrency.toUpperCase());
    }
    if (query.date) {
      q = q.eq('rate_date', query.date);
    } else {
      if (query.dateFrom) {
        q = q.gte('rate_date', query.dateFrom);
      }
      if (query.dateTo) {
        q = q.lte('rate_date', query.dateTo);
      }
    }

    const { data, error } = await q.range(offset, offset + limit - 1);
    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) =>
      this.mapHistoryRow(row),
    );
  }

  private mapHistoryRow(row: Record<string, unknown>): ConversionHistoryRow {
    return {
      id: Number(row.id),
      userId: String(row.user_id),
      fromCurrency: String(row.from_currency),
      toCurrency: String(row.to_currency),
      amount: Number(row.amount),
      rate: Number(row.rate),
      convertedAmount: Number(row.result),
      rateDate: String(row.rate_date),
      fingerprint: String(row.fingerprint),
      createdAt: String(row.created_at),
    };
  }
}
