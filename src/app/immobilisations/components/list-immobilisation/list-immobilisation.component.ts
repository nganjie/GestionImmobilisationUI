import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ImmoService } from '../../services/immo.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { BehaviorSubject, Observable, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { Categorie, Fournisseur, ImmobilisationDetail, Structure } from '../../models/immobilisation-detail.model';
import { PaginateData } from '../../../models/paginate-data.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../../services/language/language.service';
import { CreateImmobilisationComponent } from '../create-immobilisation/create-immobilisation.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { ListImmobilisationStatusEnum } from '../../../enums/immobilisation-status.enum';
import { BarcodeScannerLivestreamComponent } from 'ngx-barcode-scanner';


@Component({
  selector: 'app-list-immobilisation',
  standalone: false,
  templateUrl: './list-immobilisation.component.html',
  styleUrl: './list-immobilisation.component.css'
})
export class ListImmobilisationComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    searchCtrl!:FormControl;
    categoriesCtrl!:FormControl;
    statusCtrl!:FormControl
    fournisseCtrl!:FormControl;
    structureCtrl!:FormControl;
    categories$!:Observable<Categorie[]>;
    fournisseurs$!:Observable<Fournisseur[]>;
    structures$!:Observable<Structure[]>;
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    listImmobilisationStatusEnum=ListImmobilisationStatusEnum;
    page$ =new BehaviorSubject<number>(1);
    employeeId?:string;
  immobilisations$!:Observable<ImmobilisationDetail[]>
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner!: BarcodeScannerLivestreamComponent;
  isActiveScan=false;
  // Nouvelles propriétés

  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';
  constructor(private languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal, private router: Router,private formBuilder: FormBuilder,private route:ActivatedRoute){
    super();

  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.immoService.loading$;
    this.searchCtrl=this.formBuilder.control('');
    this.categoriesCtrl=this.formBuilder.control('');
    this.statusCtrl=this.formBuilder.control('');
    this.fournisseCtrl=this.formBuilder.control('');
    this.structureCtrl=this.formBuilder.control('');
    this.categories$=this.immoService.categories$;
    this.fournisseurs$=this.immoService.fournisseurs$;
    this.structures$=this.immoService.structures$;
    this.immoService.getCategoriesFullFromServer();
    this.immoService.getStructuresFullFromServer();
    this.immoService.getFournisseursFullFromServer();
    this.employeeId = this.route.snapshot.queryParamMap.get('employee_id') || undefined;

    this.immobilisations$=this.immoService.immobilisations$;
    this.immobilisations$.subscribe(
      (data)=>{
        if(this.isActiveScan&&data.length==1){
          this.isActiveScan=false;
          this.barcodeScanner.stop();
          this.immoService.setSnackMesage('Immobilisation trouvée : ' + data[0].name);
        }
      }
    );
    if(this.employeeId){
      this.immoService.getImmoFromServer({current_page:1,per_page:this.itemsPerPage},[searchby('employee_id',this.employeeId)]);
    }else{
      this.immoService.getImmoFromServer({current_page:1,per_page:this.itemsPerPage});
    }
    
    
    // Initialiser les filtres
    this.initSearchFilter();
    // Démarrer le scanner après l'initialisation de la vue
    // (déplacé dans ngAfterViewInit)

    //this.setnameMenu('Immobilisations');

  }

  /*ngAfterViewInit(): void {
    if (this.barcodeScanner && typeof this.barcodeScanner.start === 'function') {
      this.barcodeScanner.start();
    }
  }*/
  onValueChanges(result:any) {
    console.log('valueChanges :',result.codeResult.code);
    if(result.codeResult.code.length > 8) {
      console.log('valueChanges 2 : ',result.codeResult.code);
      this.searchCtrl.setValue(result.codeResult.code);
      this.applyFilters();
    }
  }
  scanCodeBarre() {
    if (this.barcodeScanner && typeof this.barcodeScanner.start === 'function') {
      this.barcodeScanner.start();
      this.isActiveScan=true;
    }
  }
  closeScan(){
    this.barcodeScanner.stop();
    this.isActiveScan=false;
  }

  onStarted(event:boolean) {
    console.log('started :',event);
  }

  getImmoSearchOptions(searchOptions:searchOption[]=[]){
    let options=searchOptions
    if(this.employeeId){
      options.push(searchby('employee_id', this.employeeId));
    }
    this.immoService.getImmoFromServer(this.paginateData, options);
  }
  initSearchFilter(){
    // Configuration des écouteurs pour tous les filtres
    
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtres par catégorie et statut (changement immédiat)
    this.categoriesCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.fournisseCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.structureCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  createImmobilisation(){
      const modalRef =this.modalService.open(CreateImmobilisationComponent,{
            centered:true,
            backdrop:'static',
            //backdrop: false
          });
          var reloadPgae:Observable<boolean>;
          reloadPgae=modalRef.componentInstance.realod;
          reloadPgae.subscribe(
            (b)=>{
              if(b){
                // Maintenir les filtres après création
                this.applyFilters();
              }
            }
          )
    }
    updateImmobilisation(id:string) {
        const modalRef =this.modalService.open(CreateImmobilisationComponent,{
          centered:true,
          backdrop:'static',
          //backdrop: false
        });
        modalRef.componentInstance.immobilisationId=id;
        var reloadPgae:Observable<boolean>;
        reloadPgae=modalRef.componentInstance.realod;
        reloadPgae.subscribe(
          (b)=>{
            if(b){
              // Maintenir les filtres après modification
              this.applyFilters();
            }
          }
        )
      }
  pageChange(event:PageEvent):PageEvent {
    //if(event.pageSize!=this.itemsPerPage){}
    //this.itemsPerPage=event.pageSize;
    //this.itemsPerPage$.next(this.itemsPerPage)
    this.paginateData.current_page=event.pageIndex+1
    this.paginateData.per_page=event.pageSize;
    
    // Maintenir les filtres lors du changement de page
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

  /**
   * Afficher les détails d'une immobilisation
   */
  viewDetails(id: string) {
    this.router.navigate(['/admin/immobilisations/detail', id]);
  }

  /**
   * Supprimer une immobilisation
   */
  deleteImmobilisation(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette immobilisation ?')) {
      // Logique de suppression
      console.log('Delete immobilisation:', id);
    }
  }

  /**
   * Rechercher dans la liste
   */
  onSearch() {
    // Logique de recherche
    console.log('Search term:', this.searchCtrl.value);
  }

  /**
   * Filtrer par catégorie
   */
  onCategoryFilter() {
    // Logique de filtrage
    console.log('Filter by category:', this.categoriesCtrl.value);
  }

  /**
   * Filtrer par statut
   */
  onStatusFilter() {
    // Logique de filtrage
    console.log('Filter by status:', this.statusCtrl.value);
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
   * Appliquer tous les filtres
   */
  applyFilters() {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }
    
    // Filtre par catégorie
    if (this.categoriesCtrl.value) {
      searchOptions.push(searchby('categorie_id', this.categoriesCtrl.value));
    }
    
    // Filtre par statut
    if (this.statusCtrl.value) {
      searchOptions.push(searchby('status', this.statusCtrl.value));
    }
    
    // Filtre par fournisseur
    if (this.fournisseCtrl.value) {
      searchOptions.push(searchby('fournisseur_id', this.fournisseCtrl.value));
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
    
    this.getImmoSearchOptions(searchOptions);
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    
    // Réinitialiser les contrôles de formulaire
    this.searchCtrl.setValue('');
    this.categoriesCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.fournisseCtrl.setValue('');
    this.structureCtrl.setValue('');
    
    this.applyFilters();
  }

}
