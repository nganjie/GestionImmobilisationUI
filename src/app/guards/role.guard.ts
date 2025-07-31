import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoleService } from '../services/role.service';
import { UserRole } from '../enums/roles.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageService } from '../services/language/language.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private roleService: RoleService,
    private router: Router,
    private snackBar: MatSnackBar,
    private LanguageService: LanguageService
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
        message = 'SuperAdminOnlyMessage';
      } else if (requiredRoles.includes(UserRole.SUPER_ADMIN) && requiredRoles.includes(UserRole.ADMIN)) {
        message = 'AdminOnlyMessage';
      } else {
        message = 'InsufficientPermissions' + 
                 ` (RequiredRoles: ${roleNames})`;
      }
      this.LanguageService.getTranslation(message).subscribe(translatedMessage => {
        this.snackBar.open(translatedMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      });
      
      // Retourner à la page précédente ou au dashboard
      this.router.navigate(['/admin']);
      return false;
    }

    return true;
  }
}
