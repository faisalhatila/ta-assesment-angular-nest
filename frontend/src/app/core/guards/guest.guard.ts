import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SupabaseAuthService } from '../services/supabase-auth.service';

export const guestGuard: CanMatchFn = () => {
  const auth = inject(SupabaseAuthService);
  const router = inject(Router);
  if (auth.session()?.user) {
    return router.parseUrl('/converter');
  }
  return true;
};
