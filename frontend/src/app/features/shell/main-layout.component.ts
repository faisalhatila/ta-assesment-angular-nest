import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseAuthService } from '../../core/services/supabase-auth.service';

/** Authenticated shell: side nav + toolbar + routed content (mobile-first). */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  readonly auth = inject(SupabaseAuthService);

  /** Narrow screens: overlay drawer; wide: persistent side rail. */
  readonly isHandset = toSignal(
    this.breakpoint.observe('(max-width: 959px)').pipe(map((r) => r.matches)),
    { initialValue: true },
  );

  readonly sidenavMode = computed(() =>
    this.isHandset() ? 'over' : 'side',
  );

  /** Drawer visibility: closed on phone after nav; open on desktop. */
  readonly drawerOpened = signal(false);

  constructor() {
    effect(() => {
      const handset = this.isHandset();
      untracked(() => {
        this.drawerOpened.set(!handset);
      });
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.isHandset()) {
          this.drawerOpened.set(false);
        }
      });
  }

  toggleDrawer(): void {
    this.drawerOpened.update((v) => !v);
  }

  logout(): void {
    void this.auth.signOut();
  }
}
