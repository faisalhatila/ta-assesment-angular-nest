import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { BlockUiDirective } from '../../shared/directives/block-ui.directive';
import {
  ConversionHistoryApiRow,
  ConversionHistoryQuery,
  CurrencyApiService,
} from '../../core/services/currency-api.service';
import { parseSupportedCurrenciesResponse } from '../../shared/utils/currency-symbols';
import type { CurrencyOption } from '../../shared/utils/currency-symbols';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    DecimalPipe,
    DatePipe,
    BlockUiDirective,
  ],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CurrencyApiService);
  private readonly snack = inject(MatSnackBar);

  readonly loadingFilters = signal(false);
  readonly loadingHistory = signal(false);
  readonly rows = signal<ConversionHistoryApiRow[]>([]);
  readonly currencyOptions = signal<CurrencyOption[]>([]);

  readonly ANY = '';

  readonly displayedColumns: string[] = [
    'createdAt',
    'fromCurrency',
    'toCurrency',
    'amount',
    'rate',
    'convertedAmount',
    'rateDate',
  ];

  readonly form = this.fb.nonNullable.group({
    fromCurrency: [''],
    toCurrency: [''],
    dateFrom: [''],
    dateTo: [''],
    limit: [
      50,
      [Validators.required, Validators.min(1), Validators.max(100)],
    ],
  });

  ngOnInit(): void {
    this.loadSupportedCurrencies();
    this.loadAllHistory();
  }

  loadSupportedCurrencies(): void {
    this.loadingFilters.set(true);
    this.api
      .getSupportedCurrencies()
      .pipe(finalize(() => this.loadingFilters.set(false)))
      .subscribe({
        next: (payload) =>
          this.currencyOptions.set(parseSupportedCurrenciesResponse(payload)),
        error: (e: unknown) =>
          this.snack.open(this.errMessage(e), 'Dismiss', { duration: 7000 }),
      });
  }

  /** Default: no query string — backend returns recent rows (default limit). */
  loadAllHistory(): void {
    this.loadingHistory.set(true);
    this.api
      .getHistory(undefined)
      .pipe(finalize(() => this.loadingHistory.set(false)))
      .subscribe({
        next: (list) => this.rows.set(list),
        error: (e: unknown) =>
          this.snack.open(this.errMessage(e), 'Dismiss', { duration: 8000 }),
      });
  }

  /** Clear filters in the UI and reload unfiltered list. */
  resetAndLoadAll(): void {
    this.form.patchValue({
      fromCurrency: '',
      toCurrency: '',
      dateFrom: '',
      dateTo: '',
      limit: 50,
    });
    this.loadAllHistory();
  }

  /** Apply current filter fields and optional limit. */
  search(): void {
    if (this.form.controls.limit.invalid) {
      this.snack.open('Limit must be between 1 and 100', 'OK', {
        duration: 4000,
      });
      return;
    }

    const { fromCurrency, toCurrency, dateFrom, dateTo, limit } =
      this.form.getRawValue();

    if (dateFrom && dateTo && dateFrom > dateTo) {
      this.snack.open('Date from must be on or before date to', 'OK', {
        duration: 5000,
      });
      return;
    }

    const query: ConversionHistoryQuery = { limit };
    if (fromCurrency) query.fromCurrency = fromCurrency;
    if (toCurrency) query.toCurrency = toCurrency;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;

    this.loadingHistory.set(true);
    this.api
      .getHistory(query)
      .pipe(finalize(() => this.loadingHistory.set(false)))
      .subscribe({
        next: (list) => this.rows.set(list),
        error: (e: unknown) =>
          this.snack.open(this.errMessage(e), 'Dismiss', { duration: 8000 }),
      });
  }

  private errMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'error' in e) {
      const err = (e as { error?: { message?: string } }).error;
      if (err?.message) return err.message;
    }
    if (e && typeof e === 'object' && 'message' in e) {
      return String((e as { message?: unknown }).message);
    }
    return 'Request failed';
  }
}
