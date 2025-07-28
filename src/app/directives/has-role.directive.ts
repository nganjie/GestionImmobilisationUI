import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRole: UserRole | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  @Input() set hasRole(role: UserRole) {
    this.requiredRole = role;
    this.updateView();
  }

  ngOnInit() {
    // Écouter les changements de rôles
    this.roleService.currentUserRoles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    this.viewContainer.clear();
    
    if (this.requiredRole && this.roleService.hasRole(this.requiredRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
