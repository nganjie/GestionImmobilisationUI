import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export type SidebarMode = 'side' | 'over' | 'push';
export type SidebarState = 'open' | 'closed';

export interface SidebarConfig {
  mode: SidebarMode;
  opened: boolean;
  hasBackdrop: boolean;
  disableClose: boolean;
  position: 'start' | 'end';
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private breakpointObserver = inject(BreakpointObserver);
  
  // État interne du sidebar
  private _isOpen = new BehaviorSubject<boolean>(true);
  private _userToggled = new BehaviorSubject<boolean>(false);
  
  // Observables pour les breakpoints
  public readonly isMobile$ = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small
  ]).pipe(map(result => result.matches));
  
  public readonly isTablet$ = this.breakpointObserver.observe([
    Breakpoints.Medium
  ]).pipe(map(result => result.matches));
  
  public readonly isDesktop$ = this.breakpointObserver.observe([
    Breakpoints.Large,
    Breakpoints.XLarge
  ]).pipe(map(result => result.matches));
  
  // Configuration dynamique du sidebar basée sur la taille d'écran
  public readonly sidebarConfig$: Observable<SidebarConfig> = combineLatest([
    this.isMobile$,
    this.isTablet$,
    this.isDesktop$,
    this._isOpen.asObservable(),
    this._userToggled.asObservable()
  ]).pipe(
    map(([isMobile, isTablet, isDesktop, isOpen, userToggled]) => {
      // Sur mobile : mode overlay, fermé par défaut
      if (isMobile) {
        return {
          mode: 'over' as SidebarMode,
          opened: userToggled ? isOpen : false,
          hasBackdrop: true,
          disableClose: false,
          position: 'start' as const
        };
      }
      
      // Sur tablette : mode push, peut être ouvert/fermé
      if (isTablet) {
        return {
          mode: 'push' as SidebarMode,
          opened: isOpen,
          hasBackdrop: false,
          disableClose: false,
          position: 'start' as const
        };
      }
      
      // Sur desktop : mode side, ouvert par défaut
      return {
        mode: 'side' as SidebarMode,
        opened: isOpen,
        hasBackdrop: false,
        disableClose: true,
        position: 'start' as const
      };
    }),
    distinctUntilChanged((prev, curr) => 
      prev.mode === curr.mode && 
      prev.opened === curr.opened && 
      prev.hasBackdrop === curr.hasBackdrop
    )
  );
  
  // Observables publics
  public readonly isOpen$ = this._isOpen.asObservable();
  
  // États calculés
  public readonly shouldShowContent$ = combineLatest([
    this.sidebarConfig$,
    this.isMobile$
  ]).pipe(
    map(([config, isMobile]) => {
      // shouldShowContent$ doit indiquer si le contenu textuel du sidebar doit être masqué
      // Sur mobile : toujours afficher le contenu quand ouvert
      if (isMobile) {
        return false; // On ne cache jamais le contenu sur mobile
      }
      // Sur desktop/tablet : cacher le contenu seulement si fermé/collapsed
      return !config.opened; // true = cacher le contenu, false = afficher le contenu
    })
  );
  
  // Nouvelle logique pour la hauteur du sidebar
  public readonly sidebarHeight$ = combineLatest([
    this.sidebarConfig$,
    this.isMobile$,
    this.isTablet$
  ]).pipe(
    map(([config, isMobile, isTablet]) => {
      if (isMobile) {
        return '100vh'; // Pleine hauteur sur mobile
      }
      
      // Sur desktop/tablet : hauteur réduite quand collapsed
      if (!config.opened) {
        return '200px'; // Hauteur réduite quand collapsed (zone entourée)
      }
      
      return '100vh'; // Pleine hauteur quand ouvert
    })
  );

  // Logique pour la position top du sidebar
  public readonly sidebarTop$ = combineLatest([
    this.sidebarConfig$,
    this.isMobile$
  ]).pipe(
    map(([config, isMobile]) => {
      if (isMobile) {
        return 0; // Top 0 sur mobile
      }
      
      // Sur desktop : position ajustée quand collapsed
      if (!config.opened) {
        return 20; // Légèrement décalé du haut quand collapsed
      }
      
      return 0; // Top 0 quand ouvert
    })
  );
  
  public readonly sidebarClasses$ = combineLatest([
    this.sidebarConfig$,
    this.isMobile$,
    this.isTablet$
  ]).pipe(
    map(([config, isMobile, isTablet]) => {
      const classes: string[] = ['sidenav'];
      
      if (!config.opened) {
        classes.push('sidenav-collapsed');
      }
      
      if (isMobile) {
        classes.push('sidenav-mobile');
      } else if (isTablet) {
        classes.push('sidenav-tablet');
      } else {
        classes.push('sidenav-desktop');
      }
      
      return classes.join(' ');
    })
  );

  // Nouvelle logique pour le margin du contenu principal
  public readonly contentMargin$ = combineLatest([
    this.sidebarConfig$,
    this.isMobile$,
    this.isTablet$
  ]).pipe(
    map(([config, isMobile, isTablet]) => {
      if (isMobile) {
        return 0; // Pas de margin sur mobile
      }
      
      if (isTablet) {
        return config.opened ? 280 : 80; // 280px ouvert, 80px collapsed sur tablette
      }
      
      // Desktop
      return config.opened ? 280 : 80; // 280px ouvert, 80px collapsed sur desktop
    })
  );

  constructor() {
    // Auto-fermeture sur mobile lors du changement de breakpoint
    this.isMobile$.subscribe(isMobile => {
      if (isMobile && this._isOpen.value) {
        this.close();
      }
    });
  }
  
  // Méthodes publiques
  public toggle(): void {
    this._userToggled.next(true);
    this._isOpen.next(!this._isOpen.value);
  }
  
  public open(): void {
    this._userToggled.next(true);
    this._isOpen.next(true);
  }
  
  public close(): void {
    this._userToggled.next(true);
    this._isOpen.next(false);
  }
  
  public reset(): void {
    this._userToggled.next(false);
    this._isOpen.next(true);
  }
  
  // Getters pour l'état actuel
  public get isOpen(): boolean {
    return this._isOpen.value;
  }
  
  public get hasUserToggled(): boolean {
    return this._userToggled.value;
  }
}
