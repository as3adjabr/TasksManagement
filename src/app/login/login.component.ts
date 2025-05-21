import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../Services/auth.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoginMode: boolean = true;
  error;
  form: FormGroup;
  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  constructor() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
      fullName: new FormControl(null),
      phoneNumber: new FormControl(null),
      address: new FormControl(null),
    });
    this.auth.errorMessage.subscribe((err) => {
      this.error = err;
    });
  }
  convertMode() {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.form.get('fullName')?.clearValidators();
      this.form.get('fullName')?.updateValueAndValidity();
      this.form.get('phoneNumber')?.clearValidators();
      this.form.get('phoneNumber')?.updateValueAndValidity();
      this.form.get('address')?.clearValidators();
      this.form.get('address')?.updateValueAndValidity();
    } else {
      this.form.get('fullName')?.setValidators(Validators.required);
      this.form.get('fullName')?.updateValueAndValidity();
      this.form.get('phoneNumber')?.setValidators(Validators.required);
      this.form.get('phoneNumber')?.updateValueAndValidity();
      this.form.get('address')?.setValidators(Validators.required);
      this.form.get('address')?.updateValueAndValidity();
    }
  }
  signUpOrIn() {
    if (this.isLoginMode) {
      this.auth.signIn(
        this.form.controls['email'].value,
        this.form.controls['password'].value
      );
    } else {
      this.auth.signUp(
        this.form.controls['email'].value,
        this.form.controls['password'].value,
        this.form.controls['fullName'].value,
        this.form.controls['phoneNumber'].value,
        this.form.controls['address'].value
      );
    }
  }
}
