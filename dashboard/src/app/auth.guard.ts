// dashboard/src/app/auth.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be initialized, then check auth state
  return authService.authInitialized$.pipe(
    filter(initialized => initialized), // Wait until initialized
    take(1),
    map(() => {
      // Check if authenticated without creating cyclic dependencies
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};

export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be initialized, then check auth state
  return authService.authInitialized$.pipe(
    filter(initialized => initialized), // Wait until initialized
    take(1),
    map(() => {
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
  );
};
