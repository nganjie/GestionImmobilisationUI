import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { LanguageService } from '../../../services/language/language.service';
import { OfficeDetail } from '../../models/office-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { CreateOfficeComponent } from '../create-office/create-office.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ExportFormat } from '../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-office',
  standalone: false,
  templateUrl: './list-office.component.html',
  styleUrl: './list-office.component.css'
})
export class ListOfficeComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!:Observable<PaginateData>;
  paginateData!:PaginateData;
  totaElement=0;
  pageEvent!: PageEvent;
  pageArray:number[]=[]
  itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
  page$ =new BehaviorSubject<number>(1);
  offices$!:Observable<OfficeDetail[]>
  
  // Contrôles de recherche et filtres
  searchCtrl!: FormControl;
  buildingCtrl!: FormControl;
  floorCtrl!: FormControl;
  statusCtrl!: FormControl;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Listes pour les filtres
  availableBuildings: any[] = [];
  availableFloors: number[] = [];
  
  constructor(
    public languageService:LanguageService,
    private employeeService:EmployeeService,
    private modalService:NgbModal,
    private formBuilder: FormBuilder,
    private exportService: ExportService
  ){
    super();
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.employeeService.loading$
    this.offices$=this.employeeService.offices$;
    this.paginateData$=this.employeeService.paginateData$
    
    // Initialiser les contrôles de formulaire
    this.searchCtrl = this.formBuilder.control('');
    this.buildingCtrl = this.formBuilder.control('');
    this.floorCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
    
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
      }
    );
    
    this.employeeService.getOfficesFromServer({current_page:1,per_page:this.itemsPerPage});
    
    // Initialiser les filtres
    this.initSearchFilter();
    
    // Charger les données pour les listes déroulantes
    this.loadFilterData();
  }
  
  getOfficeSearchOptions(searchOptions: searchOption[] = []) {
    this.employeeService.getOfficesFromServer(this.paginateData, searchOptions);
  }
  
  initSearchFilter() {
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres (changement immédiat)
    this.buildingCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
      this.updateFloorsForBuilding();
    });

    this.floorCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadFilterData() {
    // Charger les données initiales pour extraire les bâtiments et étages uniques
    this.offices$.subscribe(offices => {
      if (offices) {
        this.availableBuildings = [...new Set(offices.map(o => o.building))].filter(Boolean);
        this.availableFloors = [...new Set(offices.map(o => o.num_etage))].filter(Boolean).sort((a, b) => a - b);
      }
    });
  }
  
  updateFloorsForBuilding() {
    const selectedBuilding = this.buildingCtrl.value;
    if (selectedBuilding) {
      this.offices$.subscribe(offices => {
        if (offices) {
          this.availableFloors = [...new Set(
            offices
              .filter(o => o.building.id === selectedBuilding)
              .map(o => o.num_etage)
          )].filter(Boolean).sort((a, b) => a - b);
        }
      });
    } else {
      this.loadFilterData(); // Recharger tous les étages
    }
  }
  
  createOffice() {
    const modalRef =this.modalService.open(CreateOfficeComponent,{
      centered:true,
      backdrop:'static',
    });
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getOfficesFromServer(this.paginateData);
        }
      }
    )
  }
  
  updateOffice(id:string) {
    const modalRef =this.modalService.open(CreateOfficeComponent,{
      centered:true,
      backdrop:'static',
    });
    modalRef.componentInstance.officeId=id;
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getOfficesFromServer(this.paginateData);
        }
      }
    )
  }

  // Méthodes de filtrage et recherche
  onSearch(searchTerm: string): void {
    // La recherche est gérée automatiquement par le FormControl
  }

  onFilterByBuilding(buildingId: string): void {
    // Le filtrage est géré automatiquement par le FormControl
  }

  onFilterByFloor(floor: string): void {
    // Le filtrage est géré automatiquement par le FormControl
  }

  onFilterByStatus(status: string): void {
    // Le filtrage est géré automatiquement par le FormControl
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.buildingCtrl.setValue('');
    this.floorCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  viewDetails(officeId: string): void {
    console.log('Voir détails du bureau:', officeId);
  }

  deleteOffice(officeId: string): void {
    this.employeeService.deleteOffice(officeId);
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
   * Appliquer tous les filtres
   */
  applyFilters() {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }
    
    // Filtre par bâtiment
    if (this.buildingCtrl.value) {
      searchOptions.push(searchby('building_id', this.buildingCtrl.value));
    }
    
    // Filtre par étage
    if (this.floorCtrl.value) {
      searchOptions.push(searchby('num_etage', this.floorCtrl.value));
    }
    
    // Filtre par statut
    if (this.statusCtrl.value) {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }
    
    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));
    
    this.getOfficeSearchOptions(searchOptions);
  }

  pageChange(event:PageEvent):PageEvent {
    this.paginateData.current_page=event.pageIndex+1
    this.paginateData.per_page=event.pageSize;
    this.applyFilters();
    console.log(this.paginateData)
    return event;
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

  // Propriétés et méthodes d'exportation
  exportColumns: ExportColumn[] = [
    { key: 'name', label: 'Nom', translateKey: 'export.name' },
    { key: 'num_office', label: 'Numéro Bureau', translateKey: 'export.officeNumber' },
    { key: 'num_etage', label: 'Numéro Étage', translateKey: 'export.floorNumber' },
    { key: 'status', label: 'Statut', translateKey: 'export.status' },
    { key: 'is_inventory', label: 'Inventorié', translateKey: 'export.isInventoried' },
    { key: 'building.name', label: 'Bâtiment', translateKey: 'export.building' },
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
