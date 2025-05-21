import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '../Model/Task';
import { AuthService } from './auth.service';
import {
  BehaviorSubject,
  exhaustAll,
  map,
  Subject,
  switchMap,
  take,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  http: HttpClient = inject(HttpClient);
  auth: AuthService = inject(AuthService);
  selectedTask = new BehaviorSubject<Task>(null);
  apiUrlTask: string =
    'https://taskmanagementangularfirebase-default-rtdb.firebaseio.com/users';
  createNewTask(task: Task) {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        const userId = user.localId;
        return this.http.post(`${this.apiUrlTask}/${userId}/tasks.json`, task);
      })
    );
  }
  getTasks() {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        const userId = user.localId;
        return this.http
          .get<{ [key: string]: Task }>(
            `${this.apiUrlTask}/${userId}/tasks.json`
          )
          .pipe(
            map((tasksObj) => {
              const tasks: Task[] = [];
              for (let key in tasksObj) {
                tasks.push({ ...tasksObj[key], id: key });
              }
              return tasks;
            })
          );
      })
    );
  }
  deleteAllTasks() {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        const userId = user.localId;
        return this.http.delete(`${this.apiUrlTask}/${userId}/tasks.json`);
      })
    );
  }
  deleteTask(id: string) {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        const userId = user.localId;
        return this.http.delete(
          `${this.apiUrlTask}/${userId}/tasks/${id}.json`
        );
      })
    );
  }
  updateTask(task) {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        const userId = user.localId;
        return this.http.put(
          `${this.apiUrlTask}/${userId}/tasks/${task.id}.json`,
          task
        );
      })
    );
  }
  selectTask(task) {
    this.selectedTask.next(task);
  }
}
