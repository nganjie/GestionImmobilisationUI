import { Component, InjectionToken, NgZone, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { RoleService } from '../../../services/role.service';
import { UserRole } from '../../../enums/roles.enum';
import { LogOut } from '../../../models/data-server.model';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../services/language/language.service';
import { SidebarService, SidebarConfig } from '../../services/sidebar.service';
import { takeUntil } from 'rxjs/operators';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  external?: boolean;
  href?: string;
  requiredRoles?: UserRole[]; // Ajout pour la gestion des rôles
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy{
  nameMenu$!: Observable<string>;
  private destroy$ = new Subject<void>();
  
  // Propriétés du sidebar avec le nouveau service
  sidebarConfig$!: Observable<SidebarConfig>;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  isDesktop$!: Observable<boolean>;
  sidebarClasses$!: Observable<string>;
  shouldShowContent$!: Observable<boolean>;
  contentMargin$!: Observable<number>;
  sidebarHeight$!: Observable<string>;
  sidebarTop$!: Observable<number>;
  
  // Propriétés de compatibilité (pour ne pas casser le template existant)
  isSidebarCollapsed = false;
  activeSubmenu: string | null = null;
  filteredMenuSections: MenuSection[] = []; // Menu filtré selon les rôles
  appName !:string

  // Configuration du menu
  menuSections: MenuSection[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'ni ni-tv-2',
          route: '/admin/dashboard',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
        }
      ]
    },
    {
      items: [
        {
          id:'usesrs',
          label: 'Users',
          icon: 'ni ni-single-02',
          route: '/admin/users',
          requiredRoles: [UserRole.SUPER_ADMIN], // Seul SuperAdmin peut gérer les utilisateurs
          children: [
            {
              id: 'users-list',
              label: 'Users',
              icon: 'ni ni-bullet-list-67',
              route: '/admin/users',
              requiredRoles: [UserRole.SUPER_ADMIN]
            }
          ]
        },
        {
          id: 'immobilisations',
          label: 'Immobilisations',
          icon: 'ni ni-archive-2',
          route: '/admin/immobilisations',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR], // Tous peuvent voir
          children: [
            {
              id: 'immobilisations-list',
              label: 'AllImmobilisations',
              icon: 'ni ni-bullet-list-67',
              route: '/admin/immobilisations',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
            },
            {
              id: 'categories',
              label: 'Categories',
              icon: 'ni ni-tag',
              route: '/admin/immobilisations/categories',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
            },
            {
              id: 'suppliers',
              label: 'Suppliers',
              icon: 'ni ni-delivery-fast',
              route: '/admin/immobilisations/fournisseurs',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
            },
            {
              id: 'structures',
              label: 'Structures',
              icon: 'ni ni-collection',
              route: '/admin/immobilisations/structures',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
            }
          ]
        },
        {
          id: 'employees',
          label: 'Employees',
          icon: 'ni ni-circle-08',
          route: '/admin/employees',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN], // Admin et SuperAdmin seulement
          children: [
            {
              id: 'employees',
              label: 'employees',
              icon: 'ni ni-circle-08',
              route: '/admin/employees',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'buildings',
              label: 'Building',
              icon: 'ni ni-building',
              route: '/admin/employees/buildings',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'offices',
              label: 'Offices',
              icon: 'ni ni-shop',
              route: '/admin/employees/offices',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'transfers',
              label: 'Transfers',
              icon: 'ni ni-shop',
              route: '/admin/employees/transfers',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            }
          ]
        },
        {
          id: 'reformes',
          label: 'Reformes',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/reformes',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN], // Admin et SuperAdmin seulement
          children: [
            {
              id: 'entreprises',
              label: 'Entreprises',
              icon: 'ni ni-building',
              route: '/admin/reformes/entreprises',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'buyers',
              label: 'buyers',
              icon: 'ni ni-basket',
              route: '/admin/reformes/buyers',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'brokens',
              label: 'brokens',
              icon: 'ni ni-notification-70',
              route: '/admin/reformes/brokens',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'cessions',
              label: 'cessions',
              icon: 'ni ni-delivery-fast',
              route: '/admin/reformes/cessions',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
            {
              id: 'sales',
              label: 'sales',
              icon: 'ni ni-money-coins',
              route: '/admin/reformes/sales',
              requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
            },
          ]
        },
        {
      id: 'inventories',
      label: 'Inventories',
      icon: 'ni ni-settings-gear-65',
      route: '/admin/inventories',
      requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR], // Tous peuvent voir les inventaires
      children: [
        {
          id: 'inventories',
          label: 'all inventories',
          icon: 'ni ni-chart-pie-35',
          route: '/admin/inventories',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
        },
        {
          id: 'missing-inventories',
          label: 'missing inventories',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/inventories/missing-inventory',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
        },
         {
          id: 'broken-inventories',
          label: 'broken inventories',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/inventories/broken-inventory',
          requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VISITOR]
        }
      ]
    },
      ]
    }
  ];

  constructor(
    languageService: LanguageService,
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router,
    private roleService: RoleService,
    private sidebarService: SidebarService // Injection du nouveau service
  ) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'nameMenu') {
        this.ngZone.run(() => {
          console.log('Nouvelle valeur:', event.newValue);
        });
      }
    });
    localStorage.setItem('nameMenu', 'Dashboard');
  }

  ngOnInit(): void {
    this.appName=environment.appName;
    this.nameMenu$ = this.authService.nameMenu$;
    this.filterMenuByRole(); // Filtrer le menu selon les rôles
    this.authService.setNameMenue('Dashboard');
    
    // Auto-expand le menu actuel basé sur la route
    this.expandActiveMenu();
    
    // S'abonner aux changements de rôles pour refilter le menu
    this.roleService.currentUserRoles$.subscribe(() => {
      this.filterMenuByRole();
    });
    
    // Initialisation du nouveau service sidebar
    this.sidebarConfig$ = this.sidebarService.sidebarConfig$;
    this.isMobile$ = this.sidebarService.isMobile$;
    this.isTablet$ = this.sidebarService.isTablet$;
    this.isDesktop$ = this.sidebarService.isDesktop$;
    this.sidebarClasses$ = this.sidebarService.sidebarClasses$;
    this.shouldShowContent$ = this.sidebarService.shouldShowContent$;
    this.contentMargin$ = this.sidebarService.contentMargin$;
    this.sidebarHeight$ = this.sidebarService.sidebarHeight$;
    this.sidebarTop$ = this.sidebarService.sidebarTop$;
    
    // Maintenir la compatibilité avec l'ancien système
    this.sidebarService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isSidebarCollapsed = !isOpen;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Filtrer le menu selon les rôles de l'utilisateur
   */
  private filterMenuByRole(): void {
    this.filteredMenuSections = this.menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => this.hasRequiredRole(item))
        .map(item => ({
          ...item,
          children: item.children ? item.children.filter(child => this.hasRequiredRole(child)) : undefined
        }))
    })).filter(section => section.items.length > 0);
  }

  /**
   * Vérifier si l'utilisateur a les rôles requis pour un élément de menu
   */
  private hasRequiredRole(item: MenuItem): boolean {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true; // Si aucun rôle requis, accessible à tous
    }
    
    return this.roleService.hasAnyRole(item.requiredRoles);
  }

  // Gestion des sous-menus
  toggleSubmenu(menuId: string): void {
    this.activeSubmenu = this.activeSubmenu === menuId ? null : menuId;
  }

  isSubmenuActive(menuId: string): boolean {
    return this.activeSubmenu === menuId;
  }

  // Gestion du sidebar - Nouvelle implémentation avec le service
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // Navigation
  navigateTo(item: MenuItem): void {
    if (item.external && item.href) {
      window.open(item.href, '_blank');
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  // Auto-expand le menu actuel
  private expandActiveMenu(): void {
    const currentRoute = this.router.url;
    
    this.menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            child.route && currentRoute.includes(child.route)
          );
          if (hasActiveChild) {
            this.activeSubmenu = item.id;
          }
        }
      });
    });
  }

  // Vérifier si un menu est actif
  isMenuActive(item: MenuItem): boolean {
    if (!item.route) return false;
    
    const currentRoute = this.router.url;
    return currentRoute === item.route || 
           (item.children ? item.children.some(child => 
             child.route ? currentRoute.includes(child.route) : false
           ) : false);
  }
  logOut(){
    LogOut();
    this.router.navigate(['/login']);
  }
}
