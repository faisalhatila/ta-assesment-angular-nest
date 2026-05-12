import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SupabaseAuthService } from '../../core/services/supabase-auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page">
      <mat-card class="card">
        <mat-card-header>
          <mat-card-title>Currency converter</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (!auth.supabase) {
            <p class="warn">
              Supabase is not configured. Set
              <code>supabaseUrl</code> and <code>supabaseAnonKey</code> in
              <code>src/environments/environment.development.ts</code>
              (same values as backend <code>.env</code>).
            </p>
          } @else {
            <mat-tab-group>
              <mat-tab label="Log in">
                <form class="form" [formGroup]="loginForm" (ngSubmit)="onLogin()">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Password</mat-label>
                    <input
                      matInput
                      type="password"
                      formControlName="password"
                      autocomplete="current-password"
                    />
                  </mat-form-field>
                  <button
                    mat-flat-button
                    color="primary"
                    type="submit"
                    class="full"
                    [disabled]="loginForm.invalid || busy()"
                  >
                    @if (busy()) {
                      <span class="btn-inner">Signing in…</span>
                    } @else {
                      Log in
                    }
                  </button>
                </form>
              </mat-tab>
              <mat-tab label="Sign up">
                <form class="form" [formGroup]="signupForm" (ngSubmit)="onSignup()">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Password</mat-label>
                    <input
                      matInput
                      type="password"
                      formControlName="password"
                      autocomplete="new-password"
                    />
                  </mat-form-field>
                  <button
                    mat-flat-button
                    color="primary"
                    type="submit"
                    class="full"
                    [disabled]="signupForm.invalid || busy()"
                  >
                    @if (busy()) {
                      <span class="btn-inner">Creating account…</span>
                    } @else {
                      Create account
                    }
                  </button>
                </form>
              </mat-tab>
            </mat-tab-group>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .page {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      background: linear-gradient(160deg, #e8eef9 0%, #f5f5f5 45%, #fafafa 100%);
    }
    .card {
      width: 100%;
      max-width: 420px;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    mat-form-field {
      width: 100%;
    }
    .full {
      width: 100%;
      margin-top: 0.5rem;
      min-height: 48px;
    }
    .warn {
      color: var(--mat-sys-error);
      font-size: 0.9rem;
      line-height: 1.4;
    }
    .btn-inner {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    code {
      font-size: 0.8rem;
      word-break: break-all;
    }
  `,
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  readonly auth = inject(SupabaseAuthService);

  readonly busy = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.busy.set(true);
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.signIn(email, password);
    } catch (e: unknown) {
      this.snack.open(this.message(e), 'Dismiss', { duration: 6000 });
    } finally {
      this.busy.set(false);
    }
  }

  async onSignup(): Promise<void> {
    if (this.signupForm.invalid) return;
    this.busy.set(true);
    try {
      const { email, password } = this.signupForm.getRawValue();
      await this.auth.signUp(email, password);
      this.snack.open(
        'If email confirmation is enabled, check your inbox to finish sign-up.',
        'OK',
        { duration: 8000 },
      );
    } catch (e: unknown) {
      this.snack.open(this.message(e), 'Dismiss', { duration: 6000 });
    } finally {
      this.busy.set(false);
    }
  }

  private message(err: unknown): string {
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message?: unknown }).message);
    }
    return 'Something went wrong';
  }
}
