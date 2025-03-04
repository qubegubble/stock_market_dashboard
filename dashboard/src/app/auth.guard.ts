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

  return authService.authInitialized$.pipe(
    filter(initialized => initialized),
    take(1),
    map(() => {
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

  return authService.authInitialized$.pipe(
    filter(initialized => initialized),
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
