import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';

@Directive({
  selector: '[cannotAccess]',
  standalone: true
})
export class CannotAccessDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private forbiddenRole: UserRole | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  @Input() set cannotAccess(role: UserRole) {
    this.forbiddenRole = role;
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
    
    // Afficher l'élément seulement si l'utilisateur N'A PAS le rôle interdit
    if (this.forbiddenRole && !this.roleService.hasRole(this.forbiddenRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
