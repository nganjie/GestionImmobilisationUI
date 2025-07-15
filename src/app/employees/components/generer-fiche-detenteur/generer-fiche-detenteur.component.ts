import { Component, OnInit } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { Categorie, Fournisseur, ImmobilisationDetail, Structure } from '../../../immobilisations/models/immobilisation-detail.model';
import { EmployeeDetail } from '../../models/employee-detail.model';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { ImmoService } from '../../../immobilisations/services/immo.service';
import { ActivatedRoute } from '@angular/router';
import { limit, search, searchby, searchOption } from '../../../models/search-element.model';
import { FormBuilder, FormControl } from '@angular/forms';
import { ListImmobilisationStatusEnum } from '../../../enums/immobilisation-status.enum';

@Component({
  selector: 'app-generer-fiche-detenteur',
  standalone: false,
  templateUrl: './generer-fiche-detenteur.component.html',
  styleUrl: './generer-fiche-detenteur.component.css'
})
export class GenererFicheDetenteurComponent implements OnInit {
  loading$!: Observable<boolean>;
  error$!: Observable<ErrorServer>;
  immobilisations$!:Observable<ImmobilisationDetail[]>;
  categories$!:Observable<Categorie[]>;
  structures$!:Observable<Structure[]>;
  fournisseurs$!:Observable<Fournisseur[]>;
  employees$!:Observable<EmployeeDetail[]>;
  employee$!:Observable<EmployeeDetail>;
  employeeId?: string;
  searchCtrl!:FormControl;
  statusCtrl!:FormControl;
  structureCtrl!:FormControl;
  categorieCtrl!:FormControl;
  fournisseurCtrl!:FormControl;
  
  // Enum pour les statuts
  listImmobilisationStatusEnum = ListImmobilisationStatusEnum;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';
  
  // Variables pour la fiche
  selectedImmobilisations: ImmobilisationDetail[] = [];
  currentDate = new Date();
  showPreview = false;
  
  // Statistiques pour la fiche
  totalValue = 0;
  totalQuantity = 0;
  constructor(private languageService:LanguageService,private employeeService:EmployeeService,private immoService:ImmoService,private route:ActivatedRoute,private formBuilder:FormBuilder) { }
  ngOnInit(): void {
    this.immobilisations$ = this.immoService.immobilisations$;
    this.categories$ = this.immoService.categories$;
    this.structures$ = this.immoService.structures$;
    this.fournisseurs$ = this.immoService.fournisseurs$;
    this.employees$ = this.employeeService.employees$;
    this.loading$ = this.employeeService.loading$;
    this.error$ = this.employeeService.error$;
    this.employeeId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.employeeId) {
      this.employee$ = this.employeeService.getEmployeeDetailFromServer(this.employeeId);
      this.employee$.subscribe()
    }
    this.immoService.getImmoFullFromServer([searchby('employee_id', this.employeeId), limit(50)]);
    this.immoService.getCategoriesFullFromServer();
    this.immoService.getStructuresFullFromServer();
    this.immoService.getFournisseursFullFromServer();
    this.initSearchForm();
    
    // Écouter les changements d'immobilisations pour mettre à jour les sélections
    this.immobilisations$.subscribe(immobilisations => {
      // Ne pas remplacer automatiquement les sélections, garder celles existantes
      this.calculateStatistics();
    });
  }
  initSearchForm(){
    this.searchCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
    this.structureCtrl = this.formBuilder.control('');
    this.categorieCtrl = this.formBuilder.control('');
    this.fournisseurCtrl = this.formBuilder.control('');
    
    // Configuration des écouteurs pour tous les filtres avec debounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres par catégorie, statut, structure et fournisseur (changement immédiat)
    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.structureCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.categorieCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.fournisseurCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Calculer les statistiques pour la fiche
  calculateStatistics(): void {
    this.totalValue = this.selectedImmobilisations.reduce((sum, immo) => 
      sum + (immo.unit_price * immo.quantity), 0
    );
    this.totalQuantity = this.selectedImmobilisations.reduce((sum, immo) => 
      sum + immo.quantity, 0
    );
  }

  // Basculer la sélection d'une immobilisation
  toggleImmobilisationSelection(immobilisation: ImmobilisationDetail): void {
    const index = this.selectedImmobilisations.findIndex(item => item.id === immobilisation.id);
    if (index > -1) {
      this.selectedImmobilisations.splice(index, 1);
    } else {
      this.selectedImmobilisations.push(immobilisation);
    }
    this.calculateStatistics();
  }

  // Vérifier si une immobilisation est sélectionnée
  isImmobilisationSelected(immobilisation: ImmobilisationDetail): boolean {
    return this.selectedImmobilisations.some(item => item.id === immobilisation.id);
  }

  // Sélectionner toutes les immobilisations
  selectAllImmobilisations(): void {
    // Charger toutes les immobilisations de l'employé sans filtre
    const baseOptions = [searchby('employee_id', this.employeeId), limit(1000)];
    this.immoService.getImmoFullFromServer(baseOptions);
    
    this.immobilisations$.subscribe(immobilisations => {
      this.selectedImmobilisations = [...immobilisations];
      this.calculateStatistics();
    });
  }

  // Désélectionner toutes les immobilisations
  clearSelection(): void {
    this.selectedImmobilisations = [];
    this.calculateStatistics();
  }

  // Afficher/masquer la prévisualisation
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // Lancer l'impression/PDF
  printOrDownloadPDF(): void {
    // Ouvrir la fenêtre d'impression du navigateur
    window.print();
  }

  // Méthode pour obtenir le numéro de la fiche (basé sur la date et l'employé)
  getFicheNumber(): string {
    const dateStr = this.currentDate.getFullYear().toString() + 
                   (this.currentDate.getMonth() + 1).toString().padStart(2, '0') + 
                   this.currentDate.getDate().toString().padStart(2, '0');
    return `FD-${dateStr}-${this.employeeId?.substring(0, 6).toUpperCase() || 'XXXX'}`;
  }

  // Obtenir le statut en français
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Actif',
      'broken': 'En panne',
      'stock': 'En stock',
      'created': 'Créé',
      'cession': 'Cession',
      'sale': 'Vendu'
    };
    return statusMap[status] || status;
  }

  // Réinitialiser les filtres et recharger toutes les immobilisations de l'employé
  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    
    // Réinitialiser les contrôles de formulaire
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.structureCtrl.setValue('');
    this.categorieCtrl.setValue('');
    this.fournisseurCtrl.setValue('');
    
    this.applyFilters();
  }

  /**
   * Sélectionner toutes les immobilisations actuellement affichées
   */
  selectAllDisplayedImmobilisations(): void {
    this.immobilisations$.subscribe(immobilisations => {
      // Ajouter toutes les immobilisations affichées qui ne sont pas déjà sélectionnées
      immobilisations.forEach(immo => {
        if (!this.isImmobilisationSelected(immo)) {
          this.selectedImmobilisations.push(immo);
        }
      });
      this.calculateStatistics();
    });
  }

  /**
   * Trier par colonne
   */
  sortBy(column: string) {
    if (this.currentSortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  /**
   * Obtenir la classe d'icône de tri pour une colonne
   */
  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) {
      return 'fas fa-sort text-muted';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  }

  /**
   * Obtenir la classe CSS pour le badge de statut
   */
  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-success';
      case 'broken':
        return 'bg-gradient-danger';
      case 'stock':
        return 'bg-gradient-info';
      case 'created':
        return 'bg-gradient-secondary';
      case 'cession':
        return 'bg-gradient-warning';
      case 'sale':
        return 'bg-gradient-primary';
      default:
        return 'bg-gradient-secondary';
    }
  }

  /**
   * Appliquer tous les filtres
   */
  applyFilters() {
    const searchOptions: searchOption[] = [];
    
    // Toujours filtrer par employé si défini
    if (this.employeeId) {
      searchOptions.push(searchby('employee_id', this.employeeId));
    }
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }
    
    // Filtre par catégorie
    if (this.categorieCtrl.value) {
      searchOptions.push(searchby('categorie_id', this.categorieCtrl.value));
    }
    
    // Filtre par statut
    if (this.statusCtrl.value) {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }
    
    // Filtre par fournisseur
    if (this.fournisseurCtrl.value) {
      searchOptions.push(searchby('fournisseur_id', this.fournisseurCtrl.value));
    }
    
    // Filtre par structure
    if (this.structureCtrl.value) {
      searchOptions.push(searchby('structure_id', this.structureCtrl.value));
    }
    
    // Filtre par date de début
    if (this.startDate) {
      searchOptions.push(searchby('start_date', this.startDate));
    }
    
    // Filtre par date de fin
    if (this.endDate) {
      searchOptions.push(searchby('end_date', this.endDate));
    }
    
    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));
    
    // Limite pour éviter trop de résultats
    searchOptions.push(limit(100));
    
    this.immoService.getImmoFullFromServer(searchOptions);
  }
}
