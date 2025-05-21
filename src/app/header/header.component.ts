import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { exhaustAll, Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../Model/User';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  auth = inject(AuthService);
  user: Observable<User | null> = this.auth.user;
  userSubscription;
  fullName: string;
  isLogin: boolean;
  searchText: string;
  router: Router = inject(Router);
  ngOnInit() {
    this.userSubscription = this.user.subscribe((data) => {
      this.fullName = data ? data.fullName : '';
      this.isLogin = !!data;
    });
  }
  logout() {
    this.auth.logout();
  }
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  search() {
    this.router.navigate(['/dashboard'], {
      queryParams: { search: this.searchText },
    });
  }
}
