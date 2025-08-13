import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../../models/paginate-data.model';
import { searchOption, search, searchby } from '../../../../models/search-element.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeBrokenDetail } from '../../../models/reforme-broken-detail';
import { ReformeService } from '../../../services/reforme.service';
import { CreateReformeBrokenComponent } from '../create-reforme-broken/create-reforme-broken.component';
import { BaseComponent } from '../../../../shared/components/base/base.component';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ExportFormat } from '../../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-reforme-broken',
  standalone: false,
  templateUrl: './list-reforme-broken.component.html',
  styleUrl: './list-reforme-broken.component.css'
})
export class ListReformeBrokenComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  pageArray: number[] = [];
  searchCtrl!: FormControl;
  reformeBrokens$!: Observable<ReformeBrokenDetail[]>;
  Math = Math; // Expose Math to template

  // Barcode Scanner properties
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan = false;

  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';

  constructor(
    public languageService: LanguageService,
    private reformService: ReformeService,
    private modalService: NgbModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private exportService: ExportService
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('init');
    this.loading$ = this.reformService.loading$;
    this.searchCtrl = this.formBuilder.control('');
    this.reformeBrokens$ = this.reformService.reformeBrokens$;
    this.paginateData$ = this.reformService.paginateData$;
    this.paginateData$.subscribe(
      data => {
        this.paginateData = data;
        this.totaElement = data.total ?? 0;
        this.changeChoiceItemPage();
      }
    );

    // Setup barcode scanner logic
    this.reformeBrokens$.subscribe(
      (data) => {
        if (this.isActiveScan && data.length == 1) {
          this.isActiveScan = false;
          this.barcodeScanner.stop();
          this.reformService.setSnackMesage('Article cassé trouvé : ' + data[0].id);
        }
      }
    );

    // Setup search with debounce
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Load initial data
    this.applyFilters();
  }

  pageChange(event: PageEvent): PageEvent {
    this.paginateData.current_page = event.pageIndex + 1;
    this.paginateData.per_page = event.pageSize;
    
    // Maintenir les filtres lors du changement de page
    this.applyFilters();
    
    return event;
  }

  changeChoiceItemPage(): void {
    let arr: number[] = [];
    if (this.totaElement <= 2) {
      arr.push(this.totaElement);
    } else {
      for (let i = 1; i < this.totaElement / 2; i++) {
        arr.push(i * 2);
      }
      if (this.totaElement % 2 > 0) {
        arr.push(this.totaElement);
      }
    }
    this.pageArray = arr;
  }

  applyFilters(): void {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
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
    
    this.reformService.getReformeBrokenFromServer(this.paginateData, searchOptions);
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.startDate = '';
    this.endDate = '';
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    this.applyFilters();
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

  createReformeBroken(): void {
    const modalRef = this.modalService.open(CreateReformeBrokenComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.reload.subscribe((reload: boolean) => {
      if (reload) {
        this.applyFilters();
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/admin/reformes/brokens/detail', id]);
  }

  viewImmobilisationDetails(immobilisationId: string): void {
    this.router.navigate(['/admin/immobilisations/detail', immobilisationId]);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchCtrl.setValue(target.value);
  }

  onStartDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.startDate = target.value;
    this.applyFilters();
  }

  onEndDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.endDate = target.value;
    this.applyFilters();
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
    { key: 'damage_description', label: 'Description des Dommages', translateKey: 'export.damageDescription' },
    { key: 'damage_level', label: 'Niveau de Dommage', translateKey: 'export.damageLevel' },
    { key: 'estimated_repair_cost', label: 'Coût de Réparation Estimé', translateKey: 'export.estimatedRepairCost' },
    { key: 'is_repairable', label: 'Réparable', translateKey: 'export.isRepairable' },
    { key: 'reported_at', label: 'Signalé le', translateKey: 'export.reportedAt' },
    { key: 'status', label: 'Statut', translateKey: 'export.status' },
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
