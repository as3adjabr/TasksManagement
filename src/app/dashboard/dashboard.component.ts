import { Component, inject } from '@angular/core';
import { ShowTaskComponent } from './show-task/show-task.component';
import { CommonModule } from '@angular/common';
import { CreateTaskComponent } from './create-task/create-task.component';
import { Task } from '../Model/Task';
import { TaskService } from '../Services/tasks.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [ShowTaskComponent, CommonModule, CreateTaskComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  showDetails: boolean = false;
  showCreateWindow: boolean;
  isCreateMode: boolean;
  tasksSer = inject(TaskService);
  tasks: Task[] = [];
  tasksAll: Task[] = [];
  route: ActivatedRoute = inject(ActivatedRoute);
  searchText: string = '';

  ngOnInit() {
    this.showCreateWindow = false;
    this.isCreateMode = true;

    this.loadTasks();

    this.route.queryParams.subscribe((params) => {
      this.searchText = params['search'] || '';
      this.filterTasks();
    });
  }

  filterTasks() {
    if (!this.searchText.trim()) {
      this.tasks = [...this.tasksAll];
    } else {
      this.tasks = this.tasksAll.filter((task) =>
        task.title
          .toLocaleLowerCase()
          .includes(this.searchText.toLocaleLowerCase())
      );
    }
  }

  showDetail() {
    this.showDetails = true;
  }

  closeDetails($event: boolean) {
    this.showDetails = $event;
  }

  createTask() {
    this.showCreateWindow = true;
    this.isCreateMode = true;
  }

  closeWindowCreateTask($event: boolean) {
    this.showCreateWindow = $event;
  }

  convertToEditMode() {
    this.isCreateMode = false;
    this.showCreateWindow = true;
  }

  loadTasks() {
    this.tasksAll = this.route.snapshot.data['tasks'] || [];
    this.tasks = [...this.tasksAll];
  }

  deleteTask(taskId: string) {
    this.tasksSer.deleteTask(taskId).subscribe(() => {
      this.loadTasks();
      this.filterTasks();
    });
  }

  clearTasks() {
    this.tasksSer.deleteAllTasks().subscribe(() => {
      this.loadTasks();
      this.filterTasks();
    });
  }

  selectedTask(task: Task) {
    this.tasksSer.selectTask(task);
  }
}
