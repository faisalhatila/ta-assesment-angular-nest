import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlockUiDirective } from '../../shared/directives/block-ui.directive';
import { parseSupportedCurrenciesResponse } from '../../shared/utils/currency-symbols';
import {
  ConvertResponse,
  CurrencyApiService,
} from '../../core/services/currency-api.service';

@Component({
  selector: 'app-converter-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    DecimalPipe,
    BlockUiDirective,
  ],
  templateUrl: './converter-page.component.html',
  styleUrl: './converter-page.component.scss',
})
export class ConverterPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CurrencyApiService);
  private readonly snack = inject(MatSnackBar);

  readonly loadingCurrencies = signal(false);
  readonly converting = signal(false);

  readonly options = signal(parseSupportedCurrenciesResponse({}));

  readonly lastResult = signal<ConvertResponse | null>(null);
  readonly lastAmount = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    from: ['USD', Validators.required],
    to: ['EUR', Validators.required],
    amount: [1, [Validators.required, Validators.min(0.000001)]],
  });

  ngOnInit(): void {
    this.form.controls.from.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((from) => {
        if (from === this.form.controls.to.value) {
          this.ensureDistinctPair('from');
        }
      });
    this.form.controls.to.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((to) => {
        if (to === this.form.controls.from.value) {
          this.ensureDistinctPair('to');
        }
      });
    this.loadSupportedCurrencies();
  }

  swap(): void {
    const { from, to } = this.form.getRawValue();
    this.form.patchValue({ from: to, to: from });
  }

  /** Options for From: every supported code except the one selected as To. */
  fromDropdownOptions() {
    const exclude = this.form.controls.to.value;
    return this.options().filter((o) => o.code !== exclude);
  }

  /** Options for To: every supported code except the one selected as From. */
  toDropdownOptions() {
    const exclude = this.form.controls.from.value;
    return this.options().filter((o) => o.code !== exclude);
  }

  loadSupportedCurrencies(): void {
    this.loadingCurrencies.set(true);
    this.api
      .getSupportedCurrencies()
      .pipe(finalize(() => this.loadingCurrencies.set(false)))
      .subscribe({
        next: (payload) => {
          const parsed = parseSupportedCurrenciesResponse(payload);
          this.options.set(parsed);
          const codes = new Set(parsed.map((o) => o.code));
          const patch: Record<string, string | undefined> = {};
          if (!codes.has(this.form.controls.from.value)) {
            patch['from'] = parsed[0]?.code;
          }
          const effectiveFrom =
            patch['from'] ?? (this.form.controls.from.value as string);
          if (!codes.has(this.form.controls.to.value)) {
            patch['to'] = parsed.find((c) => c.code !== effectiveFrom)?.code;
          }
          if (Object.keys(patch).length) {
            this.form.patchValue(patch);
          }
          if (this.form.controls.from.value === this.form.controls.to.value) {
            this.ensureDistinctPair('from');
          }
        },
        error: (e: unknown) =>
          this.snack.open(this.errMessage(e), 'Dismiss', { duration: 7000 }),
      });
  }

  convert(): void {
    if (this.form.invalid) return;
    const { from, to, amount } = this.form.getRawValue();
    if (from === to) {
      this.snack.open('Choose two different currencies', 'OK', {
        duration: 4000,
      });
      return;
    }

    const body = { from, to, amount };

    this.converting.set(true);
    this.api
      .convert(body)
      .pipe(finalize(() => this.converting.set(false)))
      .subscribe({
        next: (res) => {
          this.lastResult.set(res);
          this.lastAmount.set(amount);
        },
        error: (e: unknown) =>
          this.snack.open(this.errMessage(e), 'Dismiss', { duration: 8000 }),
      });
  }

  /**
   * If From and To collide, set the other control to the first supported code
   * that differs from the conflicting value.
   */
  private ensureDistinctPair(changed: 'from' | 'to'): void {
    const opts = this.options();
    if (opts.length < 2) return;
    const from = this.form.controls.from.value;
    const to = this.form.controls.to.value;
    if (from !== to) return;

    if (changed === 'from') {
      const next = opts.find((o) => o.code !== from)?.code;
      if (next) this.form.patchValue({ to: next }, { emitEvent: false });
    } else {
      const next = opts.find((o) => o.code !== to)?.code;
      if (next) this.form.patchValue({ from: next }, { emitEvent: false });
    }
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
