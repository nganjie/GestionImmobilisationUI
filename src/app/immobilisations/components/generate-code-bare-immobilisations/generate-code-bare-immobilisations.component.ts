import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { LanguageService } from '../../../services/language/language.service';
import { ImmoService } from '../../services/immo.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeDetail } from '../../../employees/models/employee-detail.model';
import { ErrorServer } from '../../../models/error-server.model';
import { ImmobilisationDetail, Categorie, Structure, Fournisseur } from '../../models/immobilisation-detail.model';
import { EmployeeService } from '../../../employees/services/employee.service';
import { search, searchby, searchOption, limit } from '../../../models/search-element.model';
import { ListImmobilisationStatusEnum } from '../../../enums/immobilisation-status.enum';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-generate-code-bare-immobilisations',
  standalone: false,
  templateUrl: './generate-code-bare-immobilisations.component.html',
  styleUrl: './generate-code-bare-immobilisations.component.css'
})
export class GenerateCodeBareImmobilisationsComponent implements OnInit, AfterViewInit {
  @ViewChildren('barcodeCanvas') barcodeCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  loading$!: Observable<boolean>;
  error$!: Observable<ErrorServer>;
  immobilisations$!:Observable<ImmobilisationDetail[]>;
  categories$!:Observable<Categorie[]>;
  structures$!:Observable<Structure[]>;
  fournisseurs$!:Observable<Fournisseur[]>;
  employees$!:Observable<EmployeeDetail[]>;
  employeeId?: string;
  searchCtrl!:FormControl;
  statusCtrl!:FormControl;
  structureCtrl!:FormControl;
  categorieCtrl!:FormControl;
  employeeCtrl!:FormControl;
  fournisseurCtrl!:FormControl;
  
  // Enum pour les statuts
  listImmobilisationStatusEnum = ListImmobilisationStatusEnum;
  
  // Propriétés pour la génération de codes-barres
  selectedImmobilisations: ImmobilisationDetail[] = [];
  showPreview = false;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Options de format pour les étiquettes
  labelFormat: 'small' | 'medium' | 'large' = 'medium';
  labelsPerRow: number = 3;
  showName: boolean = true;
  showCode: boolean = true;
  showCategory: boolean = false;
  
  // Format du code-barre
  barcodeFormat: string = 'CODE128';
  
  constructor(private languageService:LanguageService,private immoService:ImmoService,private employeeService:EmployeeService,private formBuilder:FormBuilder) { }
  
  ngOnInit(): void {
    this.immobilisations$ = this.immoService.immobilisations$;
    this.categories$ = this.immoService.categories$;
    this.structures$ = this.immoService.structures$;
    this.fournisseurs$ = this.immoService.fournisseurs$;
    this.employees$ = this.employeeService.employees$;
    this.loading$ = this.immoService.loading$;
    this.error$ = this.immoService.error$;
    this.employeeService.getEmployeeFullFromServer();
    this.immoService.getImmoFullFromServer();
    this.immoService.getCategoriesFullFromServer();
    this.immoService.getStructuresFullFromServer();
    this.immoService.getFournisseursFullFromServer();
    this.initForm();
  }

  ngAfterViewInit(): void {
    // Les codes-barres seront générés dynamiquement quand nécessaire
    this.generateBarcodes();
  }
  initForm() {
    this.searchCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
    this.structureCtrl = this.formBuilder.control('');
    this.categorieCtrl = this.formBuilder.control('');
    this.fournisseurCtrl = this.formBuilder.control('');
    this.employeeCtrl = this.formBuilder.control('');
    
    // Configuration des écouteurs pour tous les filtres avec debounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres par dropdown (changement immédiat)
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

    this.employeeCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  applyFilters() {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }
    
    // Filtre par statut
    if (this.statusCtrl.value) {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }
    
    // Filtre par structure
    if (this.structureCtrl.value) {
      searchOptions.push(searchby('structure_id', this.structureCtrl.value));
    }
    
    // Filtre par catégorie
    if (this.categorieCtrl.value) {
      searchOptions.push(searchby('categorie_id', this.categorieCtrl.value));
    }
    
    // Filtre par fournisseur
    if (this.fournisseurCtrl.value) {
      searchOptions.push(searchby('fournisseur_id', this.fournisseurCtrl.value));
    }
    
    // Filtre par employé
    if (this.employeeCtrl.value) {
      searchOptions.push(searchby('employee_id', this.employeeCtrl.value));
    }
    
    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));
    
    // Limite pour éviter trop de résultats
    searchOptions.push(limit(200));
    
    this.immoService.getImmoFullFromServer(searchOptions);
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
   * Sélection des immobilisations pour génération de codes-barres
   */
  toggleImmobilisationSelection(immobilisation: ImmobilisationDetail): void {
    const index = this.selectedImmobilisations.findIndex(item => item.id === immobilisation.id);
    if (index > -1) {
      this.selectedImmobilisations.splice(index, 1);
    } else {
      this.selectedImmobilisations.push(immobilisation);
    }
    this.updateBarcodes();
  }

  /**
   * Vérifier si une immobilisation est sélectionnée
   */
  isImmobilisationSelected(immobilisation: ImmobilisationDetail): boolean {
    return this.selectedImmobilisations.some(item => item.id === immobilisation.id);
  }

  /**
   * Sélectionner toutes les immobilisations affichées
   */
  selectAllDisplayed(): void {
    this.immobilisations$.subscribe(immobilisations => {
      immobilisations.forEach(immo => {
        if (!this.isImmobilisationSelected(immo)) {
          this.selectedImmobilisations.push(immo);
        }
      });
      this.updateBarcodes();
    });
  }

  /**
   * Désélectionner toutes les immobilisations
   */
  clearSelection(): void {
    this.selectedImmobilisations = [];
    this.updateBarcodes();
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
   * Obtenir le texte traduit pour le statut
   */
  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'broken':
        return 'Broken';
      case 'stock':
        return 'InStock';
      case 'created':
        return 'StatusCreated';
      case 'cession':
        return 'Cession';
      case 'sale':
        return 'Sale';
      default:
        return status;
    }
  }

  /**
   * Afficher/masquer la prévisualisation
   */
  togglePreview(): void {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      setTimeout(() => {
        this.updateBarcodes();
      }, 200);
    }
  }

  /**
   * Lancer l'impression des codes-barres
   */
  printBarcodes(): void {
    if (this.selectedImmobilisations.length === 0) {
      alert('Veuillez sélectionner au moins une immobilisation.');
      return;
    }
    
    // Ouvrir la fenêtre d'impression du navigateur
    window.print();
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters(): void {
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    
    // Réinitialiser les contrôles de formulaire
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.structureCtrl.setValue('');
    this.categorieCtrl.setValue('');
    this.fournisseurCtrl.setValue('');
    this.employeeCtrl.setValue('');
    
    this.applyFilters();
  }

  /**
   * Obtenir la taille du code-barre selon le format
   */
  getBarcodeSize(): { width: number, height: number } {
    switch (this.labelFormat) {
      case 'small':
        return { width: 2, height: 40 }; // width = bc-width (épaisseur des barres)
      case 'medium':
        return { width: 2, height: 60 };
      case 'large':
        return { width: 3, height: 80 };
      default:
        return { width: 2, height: 60 };
    }
  }

  /**
   * Obtenir l'épaisseur des barres selon le format
   */
  getBarcodeWidth(): number {
    switch (this.labelFormat) {
      case 'small':
        return 1;
      case 'medium':
        return 2;
      case 'large':
        return 2;
      default:
        return 2;
    }
  }

  /**
   * Obtenir la hauteur du code-barre selon le format
   */
  getBarcodeHeight(): number {
    switch (this.labelFormat) {
      case 'small':
        return 50;
      case 'medium':
        return 70;
      case 'large':
        return 100;
      default:
        return 70;
    }
  }

  /**
   * Obtenir la classe CSS pour le format d'étiquette
   */
  getLabelClass(): string {
    const baseClass = 'barcode-label';
    return `${baseClass} ${baseClass}-${this.labelFormat} labels-per-row-${this.labelsPerRow}`;
  }

  /**
   * Obtenir les formats de codes-barres disponibles
   */
  getBarcodeFormats(): Array<{value: string, label: string}> {
    return [
      { value: 'CODE128', label: 'Code 128 (Recommandé)' },
      { value: 'CODE39', label: 'Code 39' },
      { value: 'EAN13', label: 'EAN-13' },
      { value: 'EAN8', label: 'EAN-8' },
      { value: 'UPC', label: 'UPC' },
      { value: 'CODE93', label: 'Code 93' },
      { value: 'CODABAR', label: 'Codabar' }
    ];
  }

  /**
   * Générer les codes-barres avec jsbarcode
   */
  generateBarcodes(): void {
    setTimeout(() => {
      this.barcodeCanvases.forEach((canvasRef, index) => {
        if (index < this.selectedImmobilisations.length) {
          const canvas = canvasRef.nativeElement;
          const immobilisation = this.selectedImmobilisations[index];
          this.generateSingleBarcode(canvas, immobilisation.code);
        }
      });
    }, 100);
  }

  /**
   * Générer un code-barre individuel
   */
  generateSingleBarcode(canvas: HTMLCanvasElement, code: string): void {
    try {
      JsBarcode(canvas, code, {
        format: this.barcodeFormat,
        width: this.getBarcodeWidth(),
        height: this.getBarcodeHeight(),
        displayValue: true,
        fontSize: 14,
        textAlign: "center",
        textPosition: "bottom",
        background: "#ffffff",
        lineColor: "#000000"
      });
    } catch (error) {
      console.error('Erreur lors de la génération du code-barre:', error);
    }
  }

  /**
   * Mettre à jour les codes-barres quand les sélections changent
   */
  updateBarcodes(): void {
    setTimeout(() => {
      this.generateBarcodes();
    }, 50);
  }

  // ...existing code...
}
