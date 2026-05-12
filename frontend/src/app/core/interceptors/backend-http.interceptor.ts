import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { getApiBaseUrl } from '../config/runtime-netlify-env';
import { DeviceFingerprintService } from '../services/device-fingerprint.service';
import { SupabaseAuthService } from '../services/supabase-auth.service';

const RETRY_HEADER = 'x-cc-auth-retry';

function requestMatchesApiBase(reqUrl: string): boolean {
  const apiPrefix = getApiBaseUrl().trim().replace(/\/$/, '');
  if (!apiPrefix) return false;

  // 1) Match using the configured prefix directly (covers both absolute and root-relative calls)
  if (reqUrl === apiPrefix || reqUrl.startsWith(`${apiPrefix}/`)) {
    return true;
  }

  // 2) If the request URL has been resolved to an absolute URL by Angular,
  //    compare against `window.location.origin + apiPrefix` for root-relative prefixes like "/api".
  if (!apiPrefix.startsWith('http') && typeof window !== 'undefined') {
    const origin = window.location.origin;
    const resolved = `${origin}${apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`}`;
    return reqUrl === resolved || reqUrl.startsWith(`${resolved}/`);
  }

  return false;
}

export const backendHttpInterceptor: HttpInterceptorFn = (req, next) => {
  if (!requestMatchesApiBase(req.url)) {
    return next(req);
  }

  const fingerprint = inject(DeviceFingerprintService).getFingerprint();
  const auth = inject(SupabaseAuthService);
  const retryCount = req.headers.get(RETRY_HEADER) ?? '0';

  const headers = req.headers
    .set('x-device-fingerprint', fingerprint)
    .set(RETRY_HEADER, retryCount);

  const token = auth.accessToken();
  const withToken =
    token && !req.headers.has('Authorization')
      ? headers.set('Authorization', `Bearer ${token}`)
      : headers;

  const outgoing = req.clone({ headers: withToken });

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (retryCount === '1') {
        return throwError(() => err);
      }
      return from(auth.refreshAccessToken()).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            return throwError(() => err);
          }
          const retryHeaders = req.headers
            .set('x-device-fingerprint', fingerprint)
            .set('Authorization', `Bearer ${newToken}`)
            .set(RETRY_HEADER, '1');
          return next(req.clone({ headers: retryHeaders }));
        }),
      );
    }),
  );
};
