import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BaseComponent } from '../../../../shared/components/base/base.component';
import { InventoryService } from '../../../service/inventory.service';
import { MissingInventoryDetail } from '../../../models/missing-inventory-detail.model';
import { EmployeeService } from '../../../../employees/services/employee.service';
import { OfficeDetail } from '../../../../employees/models/office-detail.model';
import { PaginateData } from '../../../../models/paginate-data.model';
import { LanguageService } from '../../../../services/language/language.service';
import { CreateMissingInventoryComponent } from '../create-missing-inventory/create-missing-inventory.component';
import { searchby, searchOption } from '../../../../models/search-element.model';
import { InventoryStatusEnum } from '../../../../enums/inventory-status.enum';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ExportFormat } from '../../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-missing-inventory',
  standalone: false,
  templateUrl: './list-missing-inventory.component.html',
  styleUrl: './list-missing-inventory.component.css'
})
export class ListMissingInventoryComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  pageArray: number[] = [];
  searchCtrl!: FormControl;
  statusCtrl!: FormControl;
  inventoryCtrl!: FormControl;
  officeCtrl!: FormControl;
  itemsPerPage$ = new BehaviorSubject<number>(this.itemsPerPage);
  page$ = new BehaviorSubject<number>(1);
  missingInventories$!: Observable<MissingInventoryDetail[]>;

  // Barcode Scanner properties
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan = false;

  // Observables pour les données de référence
  offices$!: Observable<OfficeDetail[]>;
  inventories$!: Observable<any[]>;

  // Énumérations pour les statuts
  inventoryStatusEnum = InventoryStatusEnum;

  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Date filter
  startDate: string = '';
  endDate: string = '';

  constructor(
    public languageService: LanguageService,
    private inventoryService: InventoryService,
    private modalService: NgbModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private exportService: ExportService
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('init list-missing-inventory');
    this.loading$ = this.inventoryService.loading$;
    this.searchCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
    this.inventoryCtrl = this.formBuilder.control('');
    this.officeCtrl = this.formBuilder.control('');
    
    this.missingInventories$ = this.inventoryService.missingInventories$;
    this.inventoryService.getMissingInventoriesFromServer({ current_page: 1, per_page: this.itemsPerPage });

    // Setup barcode scanner logic
    this.missingInventories$.subscribe(
      (data) => {
        if (this.isActiveScan && data.length == 1) {
          this.isActiveScan = false;
          this.barcodeScanner.stop();
          this.inventoryService.setSnackMesage('Inventaire manquant trouvé : ' + data[0].id);
        }
      }
    );

    // Initialiser les observables pour les données de référence
    this.offices$ = this.employeeService.offices$;
    this.employeeService.getOfficesFullFromServer();
    
    this.inventories$ = this.inventoryService.inventories$;
    this.inventoryService.getInventoriesFromServer();

    // Initialiser les filtres
    this.initSearchFilter();

    this.paginateData$ = this.inventoryService.paginateData$;
    this.paginateData$.subscribe(data => {
      this.paginateData = data;
      this.totaElement = data.total ?? 0;
      this.generatePageArray();
    });
  }

  getMissingInventorySearchOptions(searchOptions: searchOption[] = []) {
    this.inventoryService.getMissingInventoriesFromServer(this.paginateData, searchOptions);
  }

  initSearchFilter() {
    // Configuration des écouteurs pour tous les filtres
    
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres par statut et inventaire (changement immédiat)
    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.inventoryCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Filtre par office
    this.officeCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  createMissingInventory() {
    const modalRef = this.modalService.open(CreateMissingInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    
    var reloadPage: Observable<boolean>;
    reloadPage = modalRef.componentInstance.reload;
    reloadPage.subscribe((b) => {
      if (b) {
        // Maintenir les filtres après création
        this.applyFilters();
      }
    });
  }

  updateMissingInventory(id: string) {
    const modalRef = this.modalService.open(CreateMissingInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.missingInventoryId = id;
    
    var reloadPage: Observable<boolean>;
    reloadPage = modalRef.componentInstance.reload;
    reloadPage.subscribe((b) => {
      if (b) {
        this.applyFilters();
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['detail', id], { relativeTo: this.route });
  }

  deleteMissingInventory(id: string): void {
    if (confirm(this.languageService.instant('ConfirmDelete'))) {
      this.inventoryService.deleteMissingInventory(id).subscribe(() => {
        this.applyFilters();
      });
    }
  }

  pageChange(event: PageEvent): PageEvent {
    this.itemsPerPage = event.pageSize;
    this.paginateData.current_page = event.pageIndex + 1;
    this.paginateData.per_page = this.itemsPerPage;
    this.applyFilters();
    return event;
  }

  changeChoiceItemPage(): void {
    this.paginateData.per_page = this.itemsPerPage;
    this.paginateData.current_page = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value && this.searchCtrl.value.trim() !== '') {
      searchOptions.push(searchby('search', this.searchCtrl.value.trim()));
    }

    // Filtre par statut
    if (this.statusCtrl.value && this.statusCtrl.value !== '') {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }

    // Filtre par inventaire
    if (this.inventoryCtrl.value && this.inventoryCtrl.value !== '') {
      searchOptions.push(searchby('inventory_id', this.inventoryCtrl.value));
    }

    // Filtre par office
    if (this.officeCtrl.value && this.officeCtrl.value !== '') {
      searchOptions.push(searchby('office_id', this.officeCtrl.value));
    }

    // Filtres de date
    if (this.startDate) {
      searchOptions.push(searchby('start_date', this.startDate));
    }
    if (this.endDate) {
      searchOptions.push(searchby('end_date', this.endDate));
    }

    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));

    this.getMissingInventorySearchOptions(searchOptions);
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.inventoryCtrl.setValue('');
    this.officeCtrl.setValue('');
    this.startDate = '';
    this.endDate = '';
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    this.paginateData.current_page = 1;
    this.getMissingInventorySearchOptions();
  }

  sortBy(column: string): void {
    if (this.currentSortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) {
      return 'fas fa-sort text-muted';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getStatusIcon(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'fas fa-clock';
      case InventoryStatusEnum.TERMINATED:
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusClass(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'badge bg-gradient-warning';
      case InventoryStatusEnum.TERMINATED:
        return 'badge bg-gradient-success';
      default:
        return 'badge bg-gradient-secondary';
    }
  }

  generatePageArray(): void {
    this.pageArray = [];
    for (let i = 5; i <= 50; i += 5) {
      this.pageArray.push(i);
    }
  }

  trackByFn(index: number, item: MissingInventoryDetail): string {
    return item.id;
  }

  get Math() {
    return Math;
  }

  // Barcode Scanner methods
  onValueChanges(result: any) {
    console.log('valueChanges :', result.codeResult.code);
    if (result.codeResult.code.length > 8) {
      console.log('valueChanges 2 : ', result.codeResult.code);
      this.searchCtrl.setValue(result.codeResult.code);
      this.applyFilters();
    }
  }

  scanCodeBarre() {
    if (this.barcodeScanner && typeof this.barcodeScanner.start === 'function') {
      this.barcodeScanner.start();
      this.isActiveScan = true;
    }
  }

  closeScan() {
    this.barcodeScanner.stop();
    this.isActiveScan = false;
  }

  onStarted(event: boolean) {
    console.log('started :', event);
  }

  // Propriétés et méthodes d'exportation
  exportColumns: ExportColumn[] = [
    { key: 'immobilisation.name', label: 'Immobilisation', translateKey: 'export.immobilisationName' },
    { key: 'immobilisation.code_barre', label: 'Code Barre', translateKey: 'export.barcode' },
    { key: 'immobilisation.category.name', label: 'Catégorie', translateKey: 'export.category' },
    { key: 'office.name', label: 'Bureau', translateKey: 'export.office' },
    { key: 'office.building.name', label: 'Bâtiment', translateKey: 'export.building' },
    { key: 'status', label: 'Statut', translateKey: 'export.status' },
    { key: 'reported_at', label: 'Signalé le', translateKey: 'export.reportedAt' },
    { key: 'comment', label: 'Commentaire', translateKey: 'export.comment' },
    { key: 'user.first_name', label: 'Créé par (Prénom)', translateKey: 'export.createdByFirstName' },
    { key: 'user.last_name', label: 'Créé par (Nom)', translateKey: 'export.createdByLastName' },
    { key: 'created_at', label: 'Date de Création', translateKey: 'export.createdAt' }
  ];

  onBeforeExport(event: { format: ExportFormat, data: any[] }): void {
    console.log(`Début de l'export ${event.format} avec ${event.data.length} éléments`);
    console.log('Données à exporter:', event.data);
  }

  onAfterExport(event: { format: ExportFormat, success: boolean }): void {
    if (event.success) {
      console.log(`Export ${event.format} réussi`);
    } else {
      console.error(`Erreur lors de l'export ${event.format}`);
    }
  }
}
