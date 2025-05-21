import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../Model/User';
import { BehaviorSubject, catchError, Subject, throwError } from 'rxjs';
import { AuthResponse } from '../Model/AuthResponse';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  http: HttpClient = inject(HttpClient);
  user = new BehaviorSubject<User | null>(null);
  router = inject(Router);
  errorMessage = new Subject();

  private apiUrlSignUp: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBQJwVAUsqica2iGcP87VN4xmX-RJV5SEk';

  private apiUrlSignIn: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBQJwVAUsqica2iGcP87VN4xmX-RJV5SEk';

  signUp(
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    address: string
  ) {
    const data = { email, password, returnSecureToken: true };

    this.http
      .post<AuthResponse>(this.apiUrlSignUp, data)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (response) => {
          const user = new User(
            email,
            fullName,
            phoneNumber,
            address,
            response.idToken,
            response.expiresIn,
            response.localId
          );

          this.http
            .put(
              `https://taskmanagementangularfirebase-default-rtdb.firebaseio.com/users/${response.localId}.json`,
              user
            )
            .subscribe({
              next: () => {
                this.user.next(user);
                this.router.navigate(['/dashboard']);
              },
              error: (error) => {
                console.error('Error saving user data:', error);
                this.errorMessage.next(error.message);
              },
            });
        },
        error: (err) => {
          console.error('Signup error:', err.message);
          this.errorMessage.next(err.message);
        },
      });
  }

  signIn(email: string, password: string) {
    const data = { email, password, returnSecureToken: true };
    this.http
      .post<AuthResponse>(this.apiUrlSignIn, data)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (response) => {
          this.http
            .get<User>(
              `https://taskmanagementangularfirebase-default-rtdb.firebaseio.com/users/${response.localId}.json`
            )
            .subscribe({
              next: (userData) => {
                if (userData) {
                  const user = new User(
                    userData.email,
                    userData.fullName,
                    userData.PhoneNumber,
                    userData.address,
                    response.idToken,
                    response.expiresIn,
                    response.localId
                  );
                  this.user.next(user);
                  this.router.navigate(['/dashboard']);
                  console.log(user);
                } else {
                  console.error('User data not found!');
                }
              },
              error: (error) => {
                console.error('Error fetching user data:', error);
                this.errorMessage.next(error.message);
              },
            });
        },
        error: (err) => {
          console.error('Sign-in error:', err.message);
          this.errorMessage.next(err.message);
        },
      });
  }
  logout() {
    this.user.next(null);
  }

  handleError(err: any) {
    let errorMessage = 'An unknown error occurred!';
    if (err.error && err.error.error && err.error.error.message) {
      switch (err.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'This email address is already in use.';
          break;
        case 'OPERATION_NOT_ALLOWED':
          errorMessage = 'Password sign-in is disabled.';
          break;
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
          errorMessage = 'Too many attempts, try again later.';
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'Email address not found.';
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'Invalid password.';
          break;
        case 'USER_DISABLED':
          errorMessage = 'This user account has been disabled.';
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
