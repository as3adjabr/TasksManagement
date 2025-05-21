import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { switchMap, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return authService.user.pipe(
    take(1),
    switchMap((user) => {
      if (!user?.idToken) {
        return next(req);
      }

      const modifiedReq = req.clone({
        setParams: { auth: user.idToken },
      });

      return next(modifiedReq);
    })
  );
};
