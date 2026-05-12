import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { backendHttpInterceptor } from './core/interceptors/backend-http.interceptor';
import { SupabaseAuthService } from './core/services/supabase-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptors([backendHttpInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: SupabaseAuthService) => () => auth.initialize(),
      deps: [SupabaseAuthService],
      multi: true,
    },
  ],
};
