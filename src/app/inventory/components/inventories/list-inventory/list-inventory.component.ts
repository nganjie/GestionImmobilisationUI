import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BaseComponent } from '../../../../shared/components/base/base.component';
import { InventoryService } from '../../../service/inventory.service';
import { InventoryDetail } from '../../../models/inventory-detail.model';
import { PaginateData } from '../../../../models/paginate-data.model';
import { LanguageService } from '../../../../services/language/language.service';
import { CreateInventoryComponent } from '../create-inventory/create-inventory.component';
import { searchby, searchOption } from '../../../../models/search-element.model';
import { InventoryTypeEnum, ListInventoryTypeEnum } from '../../../../enums/inventory-type.enum';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';

@Component({
  selector: 'app-list-inventory',
  standalone: false,
  templateUrl: './list-inventory.component.html',
  styleUrl: './list-inventory.component.css'
})
export class ListInventoryComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  pageArray: number[] = [];
  searchCtrl!: FormControl;
  typeCtrl!: FormControl;
  itemsPerPage$ = new BehaviorSubject<number>(this.itemsPerPage);
  page$ = new BehaviorSubject<number>(1);
  inventories$!: Observable<InventoryDetail[]>;

  // Barcode Scanner properties
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan = false;

  // Énumérations pour les types d'inventaire
  inventoryTypeEnum = InventoryTypeEnum;
  listInventoryTypeEnum = ListInventoryTypeEnum;

  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Date filter
  startDate: string = '';
  endDate: string = '';

  constructor(
    private languageService: LanguageService,
    private inventoryService: InventoryService,
    private modalService: NgbModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('init list-inventory');
    this.loading$ = this.inventoryService.loading$;
    this.searchCtrl = this.formBuilder.control('');
    this.typeCtrl = this.formBuilder.control('');
    
    this.inventories$ = this.inventoryService.inventories$;
    this.inventoryService.getInventoriesFromServer({ current_page: 1, per_page: this.itemsPerPage });

    // Setup barcode scanner logic
    this.inventories$.subscribe(
      (data) => {
        if (this.isActiveScan && data.length == 1) {
          this.isActiveScan = false;
          this.barcodeScanner.stop();
          this.inventoryService.setSnackMesage('Inventaire trouvé : ' + data[0].id);
        }
      }
    );

    // Initialiser les filtres
    this.initSearchFilter();

    this.paginateData$ = this.inventoryService.paginateData$;
    this.paginateData$.subscribe(data => {
      this.paginateData = data;
      this.totaElement = data.total ?? 0;
      this.generatePageArray();
    });
  }

  getInventorySearchOptions(searchOptions: searchOption[] = []) {
    this.inventoryService.getInventoriesFromServer(this.paginateData, searchOptions);
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

    // Filtre par type (changement immédiat)
    this.typeCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  createInventory() {
    const modalRef = this.modalService.open(CreateInventoryComponent, {
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

  updateInventory(id: string) {
    const modalRef = this.modalService.open(CreateInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.inventoryId = id;
    
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

  generateReport(id: string): void {
    this.router.navigate(['report-inventory', id], { relativeTo: this.route });
  }

  deleteInventory(id: string): void {
    if (confirm(this.languageService.instant('ConfirmDelete'))) {
      this.inventoryService.deleteInventory(id).subscribe(() => {
        this.applyFilters();
      });
    }
  }

  closeInventory(id: string): void {
    this.inventoryService.closeInventory(id);
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

    // Filtre par type
    if (this.typeCtrl.value && this.typeCtrl.value !== '') {
      searchOptions.push(searchby('type', this.typeCtrl.value));
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

    this.getInventorySearchOptions(searchOptions);
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.typeCtrl.setValue('');
    this.startDate = '';
    this.endDate = '';
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    this.paginateData.current_page = 1;
    this.getInventorySearchOptions();
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

  getTypeIcon(type: InventoryTypeEnum): string {
    switch (type) {
      case InventoryTypeEnum.ANNUAL:
        return 'fas fa-calendar-alt';
      case InventoryTypeEnum.HALFYEARLY:
        return 'fas fa-calendar';
      case InventoryTypeEnum.QUARTERLY:
        return 'fas fa-calendar-week';
      default:
        return 'fas fa-list';
    }
  }

  getTypeClass(type: InventoryTypeEnum): string {
    switch (type) {
      case InventoryTypeEnum.ANNUAL:
        return 'badge bg-gradient-primary';
      case InventoryTypeEnum.HALFYEARLY:
        return 'badge bg-gradient-info';
      case InventoryTypeEnum.QUARTERLY:
        return 'badge bg-gradient-warning';
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
}
