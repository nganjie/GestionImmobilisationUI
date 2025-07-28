import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';

@Directive({
  selector: '[canAccess]',
  standalone: true
})
export class CanAccessDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRoles: UserRole[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  @Input() set canAccess(roles: UserRole[]) {
    this.requiredRoles = roles;
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
    
    if (this.requiredRoles.length > 0 && this.roleService.hasAnyRole(this.requiredRoles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
