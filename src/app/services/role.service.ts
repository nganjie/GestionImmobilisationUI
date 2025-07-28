import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserRole, ROLE_PERMISSIONS, UserPermissions } from '../enums/roles.enum';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private _currentUserRoles$ = new BehaviorSubject<UserRole[]>([]);
  
  constructor() {
    this.loadUserRoles();
  }

  get currentUserRoles$(): Observable<UserRole[]> {
    return this._currentUserRoles$.asObservable();
  }

  private loadUserRoles(): void {
    const userData = localStorage.getItem('userApp');
    if (userData) {
      try {
        const stringData = JSON.stringify(userData);
        const jsonDataPrimary = JSON.parse(stringData);
        const user = JSON.parse(jsonDataPrimary) as User;
        
        const roles = user.roles?.map(role => this.mapRoleNameToEnum(role.name)) || [];
        console.log('Current User Roles:', roles);
        this._currentUserRoles$.next(roles.filter(role => role !== null) as UserRole[]);
      } catch (error) {
        console.error('Error loading user roles:', error);
        this._currentUserRoles$.next([]);
      }
    }
  }

  private mapRoleNameToEnum(roleName: string): UserRole | null {
    switch (roleName.toLowerCase()) {
      case 'superadmin':
      case 'super_admin':
      case 'super admin':
        return UserRole.SUPER_ADMIN;
      case 'admin':
        return UserRole.ADMIN;
      case 'visitor':
        return UserRole.VISITOR;
      default:
        console.warn(`Unknown role: ${roleName}`);
        return null;
    }
  }

  getCurrentUserRoles(): UserRole[] {
    return this._currentUserRoles$.value;
  }

  hasRole(role: UserRole): boolean {
    return this._currentUserRoles$.value.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  // Méthodes de vérification spécifiques
  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isVisitor(): boolean {
    return this.hasRole(UserRole.VISITOR);
  }

  // Méthodes de permissions combinées
  canCreate(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canModify(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canDelete(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canManageUsers(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  canRead(): boolean {
    return this._currentUserRoles$.value.length > 0; // Tous les rôles connectés peuvent lire
  }

  // Méthodes pour des modules spécifiques
  canManageInventory(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  canManageMissingInventory(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canManageBrokenInventory(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canManageReforms(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canManageCessions(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  canManageSales(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  }

  // Obtenir les permissions de l'utilisateur actuel
  getCurrentUserPermissions(): UserPermissions {
    const roles = this.getCurrentUserRoles();
    
    // Si l'utilisateur a plusieurs rôles, on prend les permissions les plus élevées
    let permissions: UserPermissions = {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageUsers: false
    };

    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role];
      if (rolePermissions) {
        permissions.canRead = permissions.canRead || rolePermissions.canRead;
        permissions.canCreate = permissions.canCreate || rolePermissions.canCreate;
        permissions.canUpdate = permissions.canUpdate || rolePermissions.canUpdate;
        permissions.canDelete = permissions.canDelete || rolePermissions.canDelete;
        permissions.canManageUsers = permissions.canManageUsers || rolePermissions.canManageUsers;
      }
    });

    return permissions;
  }

  // Méthode pour rafraîchir les rôles (utile après mise à jour du profil)
  refreshUserRoles(): void {
    this.loadUserRoles();
  }

  // Obtenir le rôle le plus élevé
  getHighestRole(): UserRole | null {
    const roles = this.getCurrentUserRoles();
    
    if (roles.includes(UserRole.SUPER_ADMIN)) {
      return UserRole.SUPER_ADMIN;
    } else if (roles.includes(UserRole.ADMIN)) {
      return UserRole.ADMIN;
    } else if (roles.includes(UserRole.VISITOR)) {
      return UserRole.VISITOR;
    }
    
    return null;
  }

  // Obtenir le libellé du rôle pour l'affichage
  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrateur';
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.VISITOR:
        return 'Visiteur';
      default:
        return 'Inconnu';
    }
  }

  // Obtenir la classe CSS pour le badge du rôle
  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'badge bg-gradient-danger';
      case UserRole.ADMIN:
        return 'badge bg-gradient-warning';
      case UserRole.VISITOR:
        return 'badge bg-gradient-info';
      default:
        return 'badge bg-gradient-secondary';
    }
  }
}
