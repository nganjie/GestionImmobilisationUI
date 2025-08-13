import { Component, OnInit } from '@angular/core';
import { BuildingDetail } from '../../models/building-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { LanguageService } from '../../../services/language/language.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { CreateBuildingComponent } from '../create-building/create-building.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ExportFormat } from '../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-building',
  standalone: false,
  templateUrl: './list-building.component.html',
  styleUrl: './list-building.component.css'
})
export class ListBuildingComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!:Observable<PaginateData>;
  paginateData!:PaginateData;
  totaElement=0;
  pageEvent!: PageEvent;
  pageArray:number[]=[]
  itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
  page$ =new BehaviorSubject<number>(1);
  buildings$!:Observable<BuildingDetail[]>
  
  // Contrôles de recherche et filtres
  searchCtrl!: FormControl;
  countryCtrl!: FormControl;
  cityCtrl!: FormControl;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Listes pour les filtres
  availableCountries: string[] = [];
  availableCities: string[] = [];
  
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
    this.buildings$=this.employeeService.buildings$;
    this.paginateData$=this.employeeService.paginateData$
    
    // Initialiser les contrôles de formulaire
    this.searchCtrl = this.formBuilder.control('');
    this.countryCtrl = this.formBuilder.control('');
    this.cityCtrl = this.formBuilder.control('');
    
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
      }
    );
    
    this.employeeService.getBuildingsFromServer({current_page:1,per_page:this.itemsPerPage});
    
    // Initialiser les filtres
    this.initSearchFilter();
    
    // Charger les données pour les listes déroulantes
    this.loadFilterData();
  }
  
  getBuildingSearchOptions(searchOptions: searchOption[] = []) {
    this.employeeService.getBuildingsFromServer(this.paginateData, searchOptions);
  }
  
  initSearchFilter() {
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres par pays et ville (changement immédiat)
    this.countryCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
      this.updateCitiesForCountry();
    });

    this.cityCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadFilterData() {
    // Charger les données initiales pour extraire les pays et villes uniques
    this.buildings$.subscribe(buildings => {
      if (buildings) {
        this.availableCountries = [...new Set(buildings.map(b => b.country))].filter(Boolean);
        this.availableCities = [...new Set(buildings.map(b => b.city))].filter(Boolean);
      }
    });
  }
  
  updateCitiesForCountry() {
    const selectedCountry = this.countryCtrl.value;
    if (selectedCountry) {
      this.buildings$.subscribe(buildings => {
        if (buildings) {
          this.availableCities = [...new Set(
            buildings
              .filter(b => b.country === selectedCountry)
              .map(b => b.city)
          )].filter(Boolean);
        }
      });
    } else {
      this.loadFilterData(); // Recharger toutes les villes
    }
  }
  
  createBuilding() {
    const modalRef =this.modalService.open(CreateBuildingComponent,{
      centered:true,
      backdrop:'static',
    });
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getBuildingsFromServer(this.paginateData);
        }
      }
    )
  }
  
  updateBuilding(id:string) {
    const modalRef =this.modalService.open(CreateBuildingComponent,{
      centered:true,
      backdrop:'static',
    });
    modalRef.componentInstance.buildingId=id;
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getBuildingsFromServer(this.paginateData);
        }
      }
    )
  }

  // Méthodes de filtrage et recherche
  onSearch(searchTerm: string): void {
    // La recherche est gérée automatiquement par le FormControl
  }

  onFilterByCountry(country: string): void {
    // Le filtrage est géré automatiquement par le FormControl
  }

  onFilterByCity(city: string): void {
    // Le filtrage est géré automatiquement par le FormControl
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.countryCtrl.setValue('');
    this.cityCtrl.setValue('');
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  viewDetails(buildingId: string): void {
    console.log('Voir détails du building:', buildingId);
  }

  deleteBuilding(buildingId: string): void {
    this.employeeService.deleteBuilding(buildingId);
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
    
    // Filtre par pays
    if (this.countryCtrl.value) {
      searchOptions.push(searchby('country', this.countryCtrl.value));
    }
    
    // Filtre par ville
    if (this.cityCtrl.value) {
      searchOptions.push(searchby('city', this.cityCtrl.value));
    }
    
    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));
    
    this.getBuildingSearchOptions(searchOptions);
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
    { key: 'country', label: 'Pays', translateKey: 'export.country' },
    { key: 'city', label: 'Ville', translateKey: 'export.city' },
    { key: 'nb_etage', label: 'Nombre d\'Étages', translateKey: 'export.nbFloors' },
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
