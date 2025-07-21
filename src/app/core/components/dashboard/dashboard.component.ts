import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  external?: boolean;
  href?: string;
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
export class DashboardComponent implements OnInit{
  nameMenu$!: Observable<string>;
  isSidebarCollapsed = false;
  activeSubmenu: string | null = null;

  // Configuration du menu
  menuSections: MenuSection[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'ni ni-tv-2',
          route: '/admin/dashboard'
        }
      ]
    },
    {
      items: [
        {
          id: 'immobilisations',
          label: 'Immobilisations',
          icon: 'ni ni-archive-2',
          route: '/admin/immobilisations',
          badge: 12, // Exemple de badge
          children: [
            {
              id: 'immobilisations-list',
              label: 'AllImmobilisations',
              icon: 'ni ni-bullet-list-67',
              route: '/admin/immobilisations'
            },
            {
              id: 'categories',
              label: 'Categories',
              icon: 'ni ni-tag',
              route: '/admin/immobilisations/categories'
            },
            {
              id: 'suppliers',
              label: 'Suppliers',
              icon: 'ni ni-delivery-fast',
              route: '/admin/immobilisations/fournisseurs'
            },
            {
              id: 'structures',
              label: 'Structures',
              icon: 'ni ni-collection',
              route: '/admin/immobilisations/structures'
            }
          ]
        },
        {
          id: 'employees',
          label: 'Employees',
          icon: 'ni ni-circle-08',
          route: '/admin/employees',
          children: [
            {
              id: 'employees',
              label: 'employees',
              icon: 'ni ni-circle-08',
              route: '/admin/employees'
            },
            {
              id: 'buildings',
              label: 'Building',
              icon: 'ni ni-building',
              route: '/admin/employees/buildings'
            },
            {
              id: 'offices',
              label: 'Offices',
              icon: 'ni ni-shop',
              route: '/admin/employees/offices'
            }
          ]
        },
        {
          id: 'reformes',
          label: 'Reformes',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/reformes',
          children: [
            {
              id: 'entreprises',
              label: 'Entreprises',
              icon: 'ni ni-building',
              route: '/admin/reformes/entreprises'
            },
            {
              id: 'buyers',
              label: 'buyers',
              icon: 'ni ni-basket',
              route: '/admin/reformes/buyers'
            },
            {
              id: 'brokens',
              label: 'brokens',
              icon: 'ni ni-notification-70',
              route: '/admin/reformes/brokens'
            },
            {
              id: 'cessions',
              label: 'cessions',
              icon: 'ni ni-delivery-fast',
              route: '/admin/reformes/cessions'
            },
            {
              id: 'sales',
              label: 'sales',
              icon: 'ni ni-money-coins',
              route: '/admin/reformes/sales'
            },
          ]
        },
        {
      id: 'inventories',
      label: 'Inventories',
      icon: 'ni ni-settings-gear-65',
      route: '/admin/inventories',
      children: [
        {
          id: 'inventories',
          label: 'all inventories',
          icon: 'ni ni-chart-pie-35',
          route: '/admin/inventories'
        },
        {
          id: 'missing-inventories',
          label: 'missing inventories',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/inventories/missing-inventory'
        },
         {
          id: 'broken-inventories',
          label: 'broken inventories',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/inventories/broken-inventory'
        }
      ]
    },
      ]
    },
    
    {
      title: 'QuickAccess',
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: 'ni ni-chart-pie-35',
          route: '/admin/reports'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'ni ni-settings-gear-65',
          route: '/admin/settings'
        }
      ]
    },
    {
      title: 'AccountPages',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: 'ni ni-single-02',
          route: '/admin/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'ni ni-bell-55',
          route: '/admin/notifications',
          badge: 3
        },
        {
          id: 'help',
          label: 'Help',
          icon: 'ni ni-support-16',
          external: true,
          href: 'https://help.gestionimmo.com'
        }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router
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
    this.nameMenu$ = this.authService.nameMenu$;
    this.authService.setNameMenue('Dashboard');
    
    // Auto-expand le menu actuel basé sur la route
    this.expandActiveMenu();
  }

  // Gestion des sous-menus
  toggleSubmenu(menuId: string): void {
    this.activeSubmenu = this.activeSubmenu === menuId ? null : menuId;
  }

  isSubmenuActive(menuId: string): boolean {
    return this.activeSubmenu === menuId;
  }

  // Gestion du sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
}
