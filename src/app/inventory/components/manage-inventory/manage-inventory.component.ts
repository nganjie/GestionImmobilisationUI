import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

import { BaseComponent } from '../../../shared/components/base/base.component';
import { InventoryService } from '../../service/inventory.service';
import { ImmoService } from '../../../immobilisations/services/immo.service';
import { EmployeeService } from '../../../employees/services/employee.service';
import { ImmobilisationDetail } from '../../../immobilisations/models/immobilisation-detail.model';
import { BuildingDetail } from '../../../employees/models/building-detail.model';
import { OfficeDetail } from '../../../employees/models/office-detail.model';
import { EmployeeDetail } from '../../../employees/models/employee-detail.model';
import { PaginateData } from '../../../models/paginate-data.model';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { ImmobilisationStatusEnum } from '../../../enums/immobilisation-status.enum';
import { CreateMissingInventoryComponent } from '../missing-inventory/create-missing-inventory/create-missing-inventory.component';
import { CreateBrokenInventoryComponent } from '../broken-inventory/create-broken-inventory/create-broken-inventory.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-manage-inventory',
  standalone: false,
  templateUrl: './manage-inventory.component.html',
  styleUrl: './manage-inventory.component.css'
})
export class ManageInventoryComponent extends BaseComponent implements OnInit {
  
  @Input() inventoryId!: string; // ID de l'inventaire passé en entrée

  // Observables pour les données
  loading$!: Observable<boolean>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
  buildings$!: Observable<BuildingDetail[]>;
  offices$!: Observable<OfficeDetail[]>;
  employees$!: Observable<EmployeeDetail[]>;
  currentOffice?: OfficeDetail;
  dataOffices: OfficeDetail[] = [];

  // Pagination
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  pageArray: number[] = [];
  itemsPerPage: number = 10;
  itemsPerPage$ = new BehaviorSubject<number>(this.itemsPerPage);
  page$ = new BehaviorSubject<number>(1);

  // Contrôles de formulaires pour les filtres
  searchCtrl!: FormControl;
  buildingCtrl!: FormControl;
  floorCtrl!: FormControl;
  officeCtrl!: FormControl;
  employeeCtrl!: FormControl;
  statusCtrl!: FormControl;

  // Énumérations
  immobilisationStatusEnum = ImmobilisationStatusEnum;
  immobilisationStatusOptions = Object.values(ImmobilisationStatusEnum);
  Math = Math;

  // Options de sol (dynamique basé sur le bâtiment sélectionné)
  floorOptions: number[] = [];

  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private immoService: ImmoService,
    private employeeService: EmployeeService,
    private modalService: NgbModal
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupObservables();
    this.initFilters();
  }

  initializeForm(): void {
    this.searchCtrl = this.formBuilder.control('');
    this.buildingCtrl = this.formBuilder.control('');
    this.floorCtrl = this.formBuilder.control('');
    this.officeCtrl = this.formBuilder.control('');
    this.employeeCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
  }

  loadInitialData(): void {
    // Charger les données de base
    this.employeeService.getBuildingsFullFromServer();
    this.loadImmobilisations();
  }
  toggleOfficeSelection(event: any): void {
    event.preventDefault(); // Empêche la propagation de l'événement pour éviter les conflits avec d'autres événements
    console.log('Office selection toggled:', event.target.checked);
    if(this.currentOffice){
      let data=this.inventoryService.validateInventoryOffice(this.currentOffice.id, event.target.checked);
      data.subscribe(
        (response) => {
          console.log('Office validation response:', response);
          this.currentOffice=response // Mettre à jour l'état local
         // this.applyFilters(); // Recharger les données pour refléter le changement
        },
        (error) => {
          console.error('Error validating office:', error);
        }
      );
    }

  }

  setupObservables(): void {
    this.loading$ = this.immoService.loading$;
    this.immobilisations$ = this.immoService.immobilisations$;
    this.buildings$ = this.employeeService.buildings$;
    this.offices$ = this.employeeService.offices$;
    this.offices$.subscribe(offices => {
      this.dataOffices = offices;
    });
    this.employees$ = this.employeeService.employees$;
    this.paginateData$ = this.immoService.paginateData$;
    
    this.paginateData$.subscribe(data => {
      this.paginateData = data;
      this.totaElement = data.total ?? 0;
      this.generatePageArray();
    });
  }

  initFilters(): void {
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtre par bâtiment - charge les étages et réinitialise les filtres dépendants
    this.buildingCtrl.valueChanges.subscribe((buildingId: string) => {
      this.floorCtrl.setValue('', { emitEvent: false });
      this.officeCtrl.setValue('', { emitEvent: false });
      this.employeeCtrl.setValue('', { emitEvent: false });
      
      if (buildingId) {
        this.loadFloorsForBuilding(buildingId);
      } else {
        this.floorOptions = [];
        // Réinitialiser les observables en rechargeant des données vides
        this.employeeService.getOfficesFullFromServer([]);
        this.employeeService.getEmployeeFullFromServer([]);
      }
      this.applyFilters();
    });

    // Filtre par étage - charge les bureaux pour le bâtiment et l'étage sélectionnés
    this.floorCtrl.valueChanges.subscribe((floor: number) => {
      this.officeCtrl.setValue('', { emitEvent: false });
      this.employeeCtrl.setValue('', { emitEvent: false });
      
      const buildingId = this.buildingCtrl.value;
      if (buildingId && floor !== null && floor !== undefined) {
        console.log(`Loading offices for building ${buildingId} and floor ${floor}`);
        this.loadOfficesForBuildingAndFloor(buildingId, floor);
      } else {
        this.employeeService.getOfficesFullFromServer([]);
        this.employeeService.getEmployeeFullFromServer([]);
      }
      this.applyFilters();
    });

    // Filtre par bureau - charge les employés pour le bureau sélectionné
    this.officeCtrl.valueChanges.subscribe((officeId: string) => {
      this.employeeCtrl.setValue('', { emitEvent: false });
      
      if (officeId) {
        this.loadEmployeesForOffice(officeId);
      } else {
        this.employeeService.getEmployeeFullFromServer([]);
      }
      this.currentOffice = this.dataOffices.find(office => office.id === officeId);
      this.applyFilters();
    });

    // Filtre par employé et statut (changement immédiat)
    this.employeeCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadFloorsForBuilding(buildingId: string): void {
    this.employeeService.getBuildingDetailFromServer(buildingId).subscribe(building => {
      this.floorOptions = [];
      for (let i = 0; i <= building.nb_etage; i++) {
        this.floorOptions.push(i);
      }
    });
  }

  loadOfficesForBuildingAndFloor(buildingId: string, floor: number): void {
    const searchOptions: searchOption[] = [
      searchby('building_id', buildingId),
      searchby('num_etage', floor.toString())
    ];
    this.employeeService.getOfficesFullFromServer(searchOptions);
  }

  loadEmployeesForOffice(officeId: string): void {
    const searchOptions: searchOption[] = [
      searchby('office_id', officeId)
    ];
    this.employeeService.getEmployeeFullFromServer(searchOptions);
  }

  loadImmobilisations(): void {
    this.immoService.getImmoFromServer({ current_page: 1, per_page: this.itemsPerPage },[searchby('assigned_employee', 1)]);
  }

  applyFilters(): void {
    const searchOptions: searchOption[] = [];

    // Filtre de recherche textuelle
    if (this.searchCtrl.value?.trim()) {
      searchOptions.push(searchby('search', this.searchCtrl.value.trim()));
    }

    // Filtre par bâtiment (via office)
    if (this.buildingCtrl.value) {
      searchOptions.push(searchby('building_id', this.buildingCtrl.value));
    }

    // Filtre par étage (via office)
    if (this.floorCtrl.value !== null && this.floorCtrl.value !== '') {
      searchOptions.push(searchby('num_etage', this.floorCtrl.value.toString()));
    }

    // Filtre par bureau (via employee)
    if (this.officeCtrl.value) {
      searchOptions.push(searchby('office_id', this.officeCtrl.value));
    }

    // Filtre par employé
    if (this.employeeCtrl.value) {
      searchOptions.push(searchby('employee_id', this.employeeCtrl.value));
    }

    // Filtre par statut
    if (this.statusCtrl.value) {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }
    searchOptions.push(searchby('assigned_employee', 1));

    // Recharger les immobilisations avec les filtres
    this.immoService.getImmoFromServer(this.paginateData, searchOptions);
  }

  resetFilters(): void {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.buildingCtrl.setValue('', { emitEvent: false });
    this.floorCtrl.setValue('', { emitEvent: false });
    this.officeCtrl.setValue('', { emitEvent: false });
    this.employeeCtrl.setValue('', { emitEvent: false });
    this.statusCtrl.setValue('', { emitEvent: false });
    
    this.floorOptions = [];
    this.employeeService.getOfficesFullFromServer([]);
    this.employeeService.getEmployeeFullFromServer([]);
    
    this.loadImmobilisations();
  }

  // Actions pour déclarer absent ou cassé
  declareMissing(): void {
    const modalRef = this.modalService.open(CreateMissingInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    // Passer l'ID de l'inventaire et l'office si sélectionné
    modalRef.componentInstance.inventoryId = this.inventoryId;
    if (this.officeCtrl.value) {
      modalRef.componentInstance.preSelectedOfficeId = this.officeCtrl.value;
    }

    modalRef.componentInstance.reload.subscribe((reload: boolean) => {
      if (reload) {
        this.applyFilters();
      }
    });
  }

  declareBroken(): void {
    const modalRef = this.modalService.open(CreateBrokenInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    // Passer seulement l'ID de l'inventaire
    modalRef.componentInstance.inventoryId = this.inventoryId;

    modalRef.componentInstance.reload.subscribe((reload: boolean) => {
      if (reload) {
        this.applyFilters();
      }
    });
  }

  // Actions sur les éléments du tableau
  declareMissingForItem(immobilisation: ImmobilisationDetail): void {
    const modalRef = this.modalService.open(CreateMissingInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    modalRef.componentInstance.inventoryId = this.inventoryId;
    modalRef.componentInstance.preSelectedImmobilisationId = immobilisation.id;
    
    // Trouver l'office de l'immobilisation via son employé
    if (this.officeCtrl.value) {
      modalRef.componentInstance.preSelectedOfficeId = this.officeCtrl.value;
    }

    modalRef.componentInstance.reload.subscribe((reload: boolean) => {
      if (reload) {
        this.applyFilters();
      }
    });
  }

  declareBrokenForItem(immobilisation: ImmobilisationDetail): void {
    const modalRef = this.modalService.open(CreateBrokenInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    modalRef.componentInstance.inventoryId = this.inventoryId;
    modalRef.componentInstance.preSelectedImmobilisationId = immobilisation.id;

    modalRef.componentInstance.reload.subscribe((reload: boolean) => {
      if (reload) {
        this.applyFilters();
      }
    });
  }

  // Pagination
  pageChange(event: PageEvent): PageEvent {
    this.itemsPerPage = event.pageSize;
    this.paginateData = {
      current_page: event.pageIndex + 1,
      per_page: this.itemsPerPage,
      total: this.totaElement
    };
    this.applyFilters();
    return event;
  }

  generatePageArray(): void {
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

  // Tri
  sortBy(field: string): void {
    if (this.currentSortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.currentSortBy !== field) {
      return 'fas fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  // Formatage
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CFA'
    }).format(value);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case ImmobilisationStatusEnum.ACTIVE: return 'bg-gradient-success';
      case ImmobilisationStatusEnum.BROKEN: return 'bg-gradient-danger';
      case ImmobilisationStatusEnum.STOCK: return 'bg-gradient-warning';
      case ImmobilisationStatusEnum.CREATED: return 'bg-gradient-info';
      case ImmobilisationStatusEnum.CESSION: return 'bg-gradient-secondary';
      case ImmobilisationStatusEnum.SALE: return 'bg-gradient-dark';
      default: return 'bg-gradient-secondary';
    }
  }
}
