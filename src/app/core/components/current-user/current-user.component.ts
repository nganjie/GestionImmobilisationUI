import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { RoleService } from '../../../services/role.service';
import { UserRole } from '../../../enums/roles.enum';
import { BaseComponent } from '../../../shared/components/base/base.component';

@Component({
  selector: 'app-current-user',
  standalone: false,
  templateUrl: './current-user.component.html',
  styleUrl: './current-user.component.css'
})
export class CurrentUserComponent extends BaseComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading = false;
  error: string | null = null;
  userRoles: UserRole[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    public roleService: RoleService // Public pour utilisation dans le template
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les informations de l'utilisateur actuel depuis le serveur
   */
  loadCurrentUser(): void {
    this.isLoading = true;
    this.error = null;

    this.authService.currentUserFromServer()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user: User) => {
          this.currentUser = user;
        },
        error: (error) => {
          this.error = 'ErrorLoadingUserData';
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      });
  }

  /**
   * Charger les rôles de l'utilisateur depuis le RoleService
   */
  loadUserRoles(): void {
    this.roleService.currentUserRoles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => {
        this.userRoles = roles;
      });
  }

  /**
   * Rafraîchir les données utilisateur
   */
  refreshUserData(): void {
    this.loadCurrentUser();
  }

  /**
   * Formater la date de création du compte
   */
  getFormattedCreationDate(): string {
    if (!this.currentUser?.created_at) return '';
    return new Date(this.currentUser.created_at).toLocaleDateString();
  }

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`.trim();
  }

  /**
   * Vérifier si l'email est vérifié
   */
  isEmailVerified(): boolean {
    return !!this.currentUser?.email_verified_at;
  }

  /**
   * Obtenir le statut d'administrateur
   */
  isAdmin(): boolean {
    return this.currentUser?.is_admin === 1;
  }

  /**
   * Obtenir la liste des noms de rôles
   */
  getRoleNames(): string[] {
    return this.currentUser?.roles?.map(role => role.name) || [];
  }
}
