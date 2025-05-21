import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../Model/Task';
import { TaskService } from '../../Services/tasks.service';
@Component({
  selector: 'app-show-task',
  imports: [CommonModule],
  templateUrl: './show-task.component.html',
  styleUrl: './show-task.component.css',
})
export class ShowTaskComponent {
  @Output() showWindow: EventEmitter<boolean> = new EventEmitter<boolean>();
  selectedTask: Task;
  tasksServ = inject(TaskService);
  ngOnInit() {
    this.tasksServ.selectedTask.subscribe((data) => {
      this.selectedTask = data;
    });
  }
  showWindowFn() {
    this.showWindow.emit(false);
  }
}
