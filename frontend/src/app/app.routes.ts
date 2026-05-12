import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';

export const routes: Routes = [
  {
    path: 'auth',
    canMatch: [guestGuard],
    component: AuthPageComponent,
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/shell/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'converter' },
      {
        path: 'converter',
        loadComponent: () =>
          import('./features/converter/converter-page.component').then(
            (m) => m.ConverterPageComponent,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history-page.component').then(
            (m) => m.HistoryPageComponent,
          ),
      },
    ],
  },
];
