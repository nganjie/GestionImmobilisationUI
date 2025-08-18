import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { PaginateData } from '../../../models/paginate-data.model';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { Employeeimmo } from '../../models/employee-immo-detail.model';
import { EmployeeDetail } from '../../models/employee-detail.model';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ExportFormat } from '../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-transfer-immo-employee',
  standalone: false,
  templateUrl: './list-transfer-immo-employee.component.html',
  styleUrl: './list-transfer-immo-employee.component.css'
})
export class ListTransferImmoEmployeeComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  pageArray:number[]=[];
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  transfers$!: Observable<Employeeimmo[]>
  employees$!: Observable<EmployeeDetail[]>

  // Form controls pour les filtres
  searchCtrl!: FormControl;
  fromEmployeeCtrl!: FormControl;
  toEmployeeCtrl!: FormControl;
  statusCtrl!: FormControl;

  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Barcode scanner
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan = false;
  currentCodeBare='';

  constructor(
    public languageService: LanguageService,
    private employeeService: EmployeeService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    public router: Router,
    private exportService: ExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.employeeService.loading$;
    this.paginateData$ = this.employeeService.paginateData$;
    this.transfers$ = this.employeeService.transfers$;
    this.transfers$.subscribe(data => {
      if(this.isActiveScan&&data.length==1){
          this.isActiveScan=false;
          this.barcodeScanner.stop();
          this.employeeService.setSnackMesage('Immobilisation trouvée : ' + data[0].immobilisation.name);
        }else if(this.isActiveScan&&this.currentCodeBare.length==11){
          this.isActiveScan=false;
          this.barcodeScanner.stop();
          this.employeeService.setSnackMesage('Aucune immobilisation trouvée pour le code barre : ' + this.currentCodeBare);
        }
    });
    this.employees$ = this.employeeService.employees$;

    // Initialisation des contrôles
    this.searchCtrl = this.formBuilder.control('');
    this.fromEmployeeCtrl = this.formBuilder.control('');
    this.toEmployeeCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');

    // Abonnements pour la recherche
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onSearch();
    });

    this.fromEmployeeCtrl.valueChanges.subscribe(() => {
      this.onSearch();
    });

    this.toEmployeeCtrl.valueChanges.subscribe(() => {
      this.onSearch();
    });

    this.statusCtrl.valueChanges.subscribe(() => {
      this.onSearch();
    });

    this.paginateData$.subscribe(data => {
      this.paginateData = data;
      this.totaElement = data.total ?? 0;
      this.changeChoiceItemPage();
    });

    // Chargement initial
    this.employeeService.getEmployeeFromServer();
    this.onSearch();
  }
  onStarted(event:boolean) {
    console.log('started :',event);
  }

  getSearchOptions(): searchOption[] {
    let searchOptions: searchOption[] = [];

    if (this.searchCtrl.value) {
      searchOptions.push(searchby('search', this.searchCtrl.value));
    }

    if (this.fromEmployeeCtrl.value) {
      searchOptions.push(searchby('last_employee_id', this.fromEmployeeCtrl.value));
    }

    if (this.toEmployeeCtrl.value) {
      searchOptions.push(searchby('employee_id', this.toEmployeeCtrl.value));
    }

    if (this.statusCtrl.value !== '') {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }

    return searchOptions;
  }

  onSearch(): void {
    // Réinitialiser à la première page lors d'une nouvelle recherche
    this.paginateData.current_page = 1;
    this.employeeService.getTransfersFromServer(this.paginateData, this.getSearchOptions());
  }

  sortBy(column: string): void {
    if (this.currentSortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.sortDirection = 'asc';
    }
    this.onSearch();
  }

  getSortIcon(column: string): string {
    if (this.currentSortBy === column) {
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    return 'fas fa-sort';
  }

  goToDetail(transfer: Employeeimmo): void {
    this.router.navigate(['/admin/employees/transfers/detail', transfer.id]);
  }

  // Barcode scanner methods
  onValueChanges(result: any): void {
    console.log('valueChanges :', result.codeResult.code);
    if (result.codeResult.code.length ==11) {
      this.currentCodeBare = result.codeResult.code;
      console.log('valueChanges 2 : ', result.codeResult.code);
      this.searchCtrl.setValue(result.codeResult.code);
      this.onSearch();
    }
   
  }

  scanCodeBarre(): void {
    console.log('Barcode scanner started');
    if (this.barcodeScanner && typeof this.barcodeScanner.start === 'function') {
      this.barcodeScanner.start();
      this.isActiveScan = true;
    }
  }

  closeScan(): void {
    this.isActiveScan = false;
    if (this.barcodeScanner) {
      this.barcodeScanner.stop();
    }
  }

  trackByTransferId(index: number, transfer: Employeeimmo): string {
    return transfer.id;
  }

  pageChange(event: PageEvent): PageEvent {
    this.paginateData.current_page = event.pageIndex + 1;
    this.paginateData.per_page = event.pageSize;
    this.itemsPerPage = event.pageSize;
    
    // Appliquer les filtres avec la nouvelle pagination
    this.employeeService.getTransfersFromServer(this.paginateData, this.getSearchOptions());
    
    return event;
  }

  // Propriétés et méthodes d'exportation
  exportColumns: ExportColumn[] = [
    { key: 'immobilisation.name', label: 'Immobilisation', translateKey: 'export.immobilisationName' },
    { key: 'immobilisation.code_barre', label: 'Code Barre', translateKey: 'export.barcode' },
    { key: 'fromEmployee.first_name', label: 'Employé Expéditeur (Prénom)', translateKey: 'export.fromEmployeeFirstName' },
    { key: 'fromEmployee.last_name', label: 'Employé Expéditeur (Nom)', translateKey: 'export.fromEmployeeLastName' },
    { key: 'toEmployee.first_name', label: 'Employé Destinataire (Prénom)', translateKey: 'export.toEmployeeFirstName' },
    { key: 'toEmployee.last_name', label: 'Employé Destinataire (Nom)', translateKey: 'export.toEmployeeLastName' },
    { key: 'status', label: 'Statut', translateKey: 'export.status' },
    { key: 'transferred_at', label: 'Date de Transfert', translateKey: 'export.transferredAt' },
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
   changeChoiceItemPage(){
    let arr:number[]=[];
    console.log(this.pageArray)
    if(this.totaElement<=2)
    {
      console.log('total',this.totaElement)
      arr.push(this.totaElement)
  
    }else{
      for(let i=1;i<this.totaElement/2;i++)
        {
          arr.push(i*2)
        }
        if(this.totaElement%2>0){
          arr.push(this.totaElement)
        }
    }
    console.log(arr);
    this.pageArray=arr;
  }
}
