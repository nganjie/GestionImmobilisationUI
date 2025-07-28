import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserRole } from '../../enums/roles.enum';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span [class]="getBadgeClass()" *ngIf="role">
      <i [class]="getIconClass()" class="me-1"></i>
      {{getRoleDisplayName() | translate}}
    </span>
  `,
  styles: [`
    .badge {
      font-size: 0.75rem;
      padding: 0.5em 0.75em;
      border-radius: 0.5rem;
      font-weight: 600;
    }
  `]
})
export class RoleBadgeComponent {
  @Input() role: UserRole | null = null;
  @Input() showIcon: boolean = true;

  constructor(private roleService: RoleService) {}

  getBadgeClass(): string {
    if (!this.role) return 'badge bg-secondary';
    return this.roleService.getRoleBadgeClass(this.role);
  }

  getRoleDisplayName(): string {
    if (!this.role) return 'Unknown';
    return this.roleService.getRoleDisplayName(this.role);
  }

  getIconClass(): string {
    if (!this.showIcon || !this.role) return '';
    
    switch (this.role) {
      case UserRole.SUPER_ADMIN:
        return 'fas fa-crown';
      case UserRole.ADMIN:
        return 'fas fa-user-shield';
      case UserRole.VISITOR:
        return 'fas fa-eye';
      default:
        return 'fas fa-user';
    }
  }
}
