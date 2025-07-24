import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseComponent } from '../../../../shared/components/base/base.component';
import { PaginateData } from '../../../../models/paginate-data.model';
import { searchOption, search, searchby } from '../../../../models/search-element.model';
import { SaleDetail } from '../../../models/sale-detail.model';
import { ReformeService } from '../../../services/reforme.service';
import { CreateReformeSaleComponent } from '../create-reforme-sale/create-reforme-sale.component';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';

@Component({
  selector: 'app-list-reforme-sale',
  standalone: false,
  templateUrl: './list-reforme-sale.component.html',
  styleUrl: './list-reforme-sale.component.css'
})
export class ListReformeSaleComponent extends BaseComponent implements OnInit {

  searchCtrl = new FormControl('');
  dateFromCtrl = new FormControl('');
  dateToCtrl = new FormControl('');
  sales: SaleDetail[] = [];
  searchOptions: searchOption[] = [];
  displayedColumns: string[] = ['id', 'immobilisation', 'buyer', 'amount', 'created_at', 'actions'];
  paginationDetail: PaginateData = {
    current_page: 1,
    per_page: 10
  };
  loading = false;

  // Barcode Scanner properties
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan = false;

  constructor(
    private reformeService: ReformeService,
    private modalService: NgbModal,
    private router: Router
  ) { 
    super();
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupSearchControls();
  }

  initializeData() {
    this.reformeService.sales$.subscribe(sales => {
      this.sales = sales as SaleDetail[];
      
      // Setup barcode scanner logic
      if (this.isActiveScan && this.sales.length == 1) {
        this.isActiveScan = false;
        this.barcodeScanner.stop();
        this.reformeService.setSnackMesage('Vente trouvée : ' + this.sales[0].id);
      }
    });

    this.reformeService.paginateData$.subscribe((paginationDetail: any) => {
      this.paginationDetail = paginationDetail;
    });

    this.reformeService.loading$.subscribe(loading => {
      this.loading = loading as boolean;
    });

    this.getReformeSaleFromServer();
  }

  setupSearchControls() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.onSearch(searchTerm as string);
    });

    this.dateFromCtrl.valueChanges.subscribe(() => {
      this.onDateFilter();
    });

    this.dateToCtrl.valueChanges.subscribe(() => {
      this.onDateFilter();
    });
  }

  onSearch(searchTerm: string | null) {
    this.searchOptions = [];
    if (searchTerm && searchTerm.trim()) {
      this.searchOptions.push(search(searchTerm.trim()));
    }
    this.getReformeSaleFromServer();
  }

  onDateFilter() {
    const dateFrom = this.dateFromCtrl.value;
    const dateTo = this.dateToCtrl.value;
    
    this.searchOptions = this.searchOptions.filter(option => 
      option.name !== 'date_from' && option.name !== 'date_to'
    );

    if (dateFrom) {
      this.searchOptions.push(searchby('date_from', dateFrom));
    }

    if (dateTo) {
      this.searchOptions.push(searchby('date_to', dateTo));
    }

    this.getReformeSaleFromServer();
  }

  onSortChange(sort: { active: string; direction: string }) {
    this.searchOptions = this.searchOptions.filter(option => 
      option.name !== 'sort_by' && option.name !== 'sort_direction'
    );

    if (sort.active && sort.direction) {
      this.searchOptions.push(
        searchby('sort_by', sort.active),
        searchby('sort_direction', sort.direction)
      );
    }

    this.getReformeSaleFromServer();
  }

  onPageChange(event: any) {
    this.paginationDetail.current_page = event.pageIndex + 1;
    this.paginationDetail.per_page = event.pageSize;
    this.getReformeSaleFromServer();
  }

  getReformeSaleFromServer() {
    const paginateData = {
      current_page: this.paginationDetail.current_page,
      per_page: this.paginationDetail.per_page
    };
    this.reformeService.getReformeSaleFromServer(paginateData, this.searchOptions);
  }

  openCreateModal() {
    const modalRef = this.modalService.open(CreateReformeSaleComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result === 'created') {
        this.getReformeSaleFromServer();
      }
    }).catch(() => {
      // Modal dismissed
    });
  }

  viewDetail(sale: SaleDetail) {
    this.router.navigate(['/admin/reformes/sales/detail', sale.id]);
  }

  viewImmobilisationDetails(immobilisationId: string) {
    this.router.navigate(['/admin/immobilisations', immobilisationId]);
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.dateFromCtrl.setValue('');
    this.dateToCtrl.setValue('');
    this.searchOptions = [];
    this.getReformeSaleFromServer();
  }

  // Barcode Scanner methods
  onValueChanges(result: any) {
    console.log('valueChanges :', result.codeResult.code);
    if (result.codeResult.code.length > 8) {
      console.log('valueChanges 2 : ', result.codeResult.code);
      this.searchCtrl.setValue(result.codeResult.code);
      this.getReformeSaleFromServer();
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
