import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { inject } from '@angular/core';
import { Observable, of, switchMap, take } from 'rxjs';
import { TaskService } from '../Services/tasks.service';
import { Task } from '../Model/Task';

export const canActive: CanActivateFn = (): Observable<boolean> => {
  const auth: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  return auth.user.pipe(
    take(1),
    switchMap((user) => {
      if (user) {
        return of(true);
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};
export const resolve: ResolveFn<Observable<Task[]>> = () => {
  const tasksServ: TaskService = inject(TaskService);
  return tasksServ.getTasks();
};
