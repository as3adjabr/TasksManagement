import { BehaviorSubject, catchError, Subject, throwError } from 'rxjs';
import { User } from '../Model/User';
import { AuthResponse } from '../Model/AuthResponse';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  http: HttpClient = inject(HttpClient);
  user = new BehaviorSubject<User | null>(null);
  router = inject(Router);
  errorMessage = new Subject();
  tokenExpiredtimer: any;

  private apiUrlSignUp =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBQJwVAUsqica2iGcP87VN4xmX-RJV5SEk';
  private apiUrlSignIn =
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
          const expirationDate = new Date(
            new Date().getTime() + +response.expiresIn * 1000
          );
          const user = new User(
            email,
            fullName,
            phoneNumber,
            address,
            response.idToken,
            expirationDate.toISOString(),
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
                localStorage.setItem('user', JSON.stringify(user));
                this.autoLogout(+response.expiresIn * 1000);
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
                  const expirationDate = new Date(
                    new Date().getTime() + +response.expiresIn * 1000
                  );
                  const user = new User(
                    userData.email,
                    userData.fullName,
                    userData.PhoneNumber,
                    userData.address,
                    response.idToken,
                    expirationDate.toISOString(),
                    response.localId
                  );

                  this.user.next(user);
                  localStorage.setItem('user', JSON.stringify(user));
                  this.autoLogout(+response.expiresIn * 1000);
                  this.router.navigate(['/dashboard']);
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

  autoSignIn() {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    const expirationDate = new Date(parsedUser.expiresIn);

    if (expirationDate <= new Date()) {
      this.logout();
      return;
    }

    const loggedUser = new User(
      parsedUser.email,
      parsedUser.fullName,
      parsedUser.PhoneNumber,
      parsedUser.address,
      parsedUser.idToken,
      parsedUser.expiresIn,
      parsedUser.localId
    );

    this.user.next(loggedUser);

    const remainingTime = expirationDate.getTime() - new Date().getTime();
    this.autoLogout(remainingTime);
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('user');
    if (this.tokenExpiredtimer) {
      clearTimeout(this.tokenExpiredtimer);
    }
    this.tokenExpiredtimer = null;
    this.router.navigate(['/login']);
  }

  autoLogout(expireTime: number) {
    this.tokenExpiredtimer = setTimeout(() => {
      this.logout();
    }, expireTime);
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
