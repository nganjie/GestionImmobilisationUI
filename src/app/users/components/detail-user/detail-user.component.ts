import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../shared/components/base/base.component';

@Component({
  selector: 'app-detail-user',
  standalone: false,
  templateUrl: './detail-user.component.html',
  styleUrl: './detail-user.component.css'
})
export class DetailUserComponent extends BaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private translateService: TranslateService
  ) {
    super();
    this.loading$ = this.userService.loading$;
    this.error$ = this.userService.error$;
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserDetail(): void {
    if (this.userId) {
      // Note: You might need to add a getUserDetail method to UserService
      // For now, we'll use the users$ observable and find the user
      this.userService.users$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(users => {
        this.user = users.find(u => u.id === this.userId) || null;
      });
      
      // Load users if not already loaded
      this.userService.getUserFromServer();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  goToEdit(): void {
    if (this.userId) {
      this.router.navigate(['/admin/users/edit', this.userId]);
    }
  }

  getStatusLabel(): string {
    if (!this.user) return '';
    return this.user.is_admin ? 'Administrator' : 'Regular User';
  }

  getStatusClass(): string {
    if (!this.user) return '';
    return this.user.is_admin ? 'badge bg-gradient-success' : 'badge bg-gradient-info';
  }

  getVerificationStatus(): string {
    if (!this.user) return '';
    return this.user.email_verified_at ? 'Verified' : 'Not Verified';
  }

  getVerificationClass(): string {
    if (!this.user) return '';
    return this.user.email_verified_at ? 'text-success' : 'text-warning';
  }
}
