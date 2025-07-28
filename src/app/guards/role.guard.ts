import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private roleService: RoleService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Vérifier d'abord si l'utilisateur est authentifié
    const token = localStorage.getItem('tokenApp');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Récupérer les rôles requis depuis les données de la route
    const requiredRoles = route.data['roles'] as UserRole[];
    
    // Si aucun rôle spécifique n'est requis, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const hasRequiredRole = this.roleService.hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      // Afficher un message d'erreur avec le snack bar
      const currentRole = this.roleService.getHighestRole();
      const roleNames = requiredRoles.map(role => this.roleService.getRoleDisplayName(role)).join(', ');
      
      let message = '';
      if (requiredRoles.includes(UserRole.SUPER_ADMIN) && requiredRoles.length === 1) {
        message = this.translateService.instant('SuperAdminOnlyMessage');
      } else if (requiredRoles.includes(UserRole.SUPER_ADMIN) && requiredRoles.includes(UserRole.ADMIN)) {
        message = this.translateService.instant('AdminOnlyMessage');
      } else {
        message = this.translateService.instant('InsufficientPermissions') + 
                 ` (${this.translateService.instant('RequiredRoles')}: ${roleNames})`;
      }
      
      this.snackBar.open(message, this.translateService.instant('Close'), {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      
      // Retourner à la page précédente ou au dashboard
      this.router.navigate(['/admin']);
      return false;
    }

    return true;
  }
}
