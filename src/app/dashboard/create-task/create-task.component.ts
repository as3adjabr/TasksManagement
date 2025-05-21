import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../Model/Task';
import { TaskService } from '../../Services/tasks.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css'],
})
export class CreateTaskComponent {
  @Output() closeWindow = new EventEmitter<boolean>();
  @Input() isCreateMode: boolean = true;
  @Output() taskCreated = new EventEmitter<void>();
  selectedTask: Task;
  private tasksSer = inject(TaskService);

  form: FormGroup;

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl('', Validators.required),
      desc: new FormControl('', Validators.required),
      assignedTo: new FormControl(''),
      createdAt: new FormControl(''),
      priorety: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
    });

    if (!this.isCreateMode) {
      this.tasksSer.selectedTask.pipe(take(1)).subscribe((task) => {
        if (task) {
          this.selectedTask = task;
          this.form.patchValue(task);
        }
      });
    }
  }

  closeWindowFn() {
    this.closeWindow.emit(false);
  }

  createOrUpdateTask() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const taskData: Task = {
      ...this.selectedTask,
      ...this.form.value,
    };

    if (this.isCreateMode) {
      this.tasksSer.createNewTask(taskData).subscribe({
        next: () => {
          console.log('Task created');
          this.taskCreated.emit();
          this.closeWindow.emit(false);
        },
        error: (err) => console.error('Error creating task:', err),
      });
    } else {
      this.tasksSer.updateTask(taskData).subscribe({
        next: () => {
          console.log('Task updated');
          this.taskCreated.emit();
          this.closeWindow.emit(false);
        },
        error: (err) => console.error('Error updating task:', err),
      });
    }
  }
}
