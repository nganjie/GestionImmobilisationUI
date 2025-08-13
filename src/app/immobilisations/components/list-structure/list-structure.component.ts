import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { Structure } from '../../models/immobilisation-detail.model';
import { ImmoService } from '../../services/immo.service';
import { CreateStructureComponent } from '../create-structure/create-structure.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../../services/language/language.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ExportFormat } from '../../../shared/components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-list-structure',
  standalone: false,
  templateUrl: './list-structure.component.html',
  styleUrl: './list-structure.component.css'
})
export class ListStructureComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!:Observable<PaginateData>;
  paginateData!:PaginateData;
  totaElement=0;
  pageEvent!: PageEvent;
  pageArray:number[]=[]
  itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
  page$ =new BehaviorSubject<number>(1);
  structures$!:Observable<Structure[]>
  
  // Propriétés pour les filtres et le tri
  searchCtrl!: FormControl;
  startDate: string = '';
  endDate: string = '';
  currentSortBy: string = 'created_at';
  sortDirection: string = 'desc';
  
  constructor(public languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal, private formBuilder: FormBuilder, private exportService: ExportService){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.immoService.loading$;
    this.searchCtrl=this.formBuilder.control('');
    this.structures$=this.immoService.structures$;
    this.paginateData$=this.immoService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
      }
    );
    this.immoService.getStructuresFromServer({current_page:1,per_page:this.itemsPerPage});
    
    // Initialiser les filtres
    this.initSearchFilter();

    //this.setnameMenu('structures');

  }
   createStructure(){
      const modalRef =this.modalService.open(CreateStructureComponent,{
            centered:true,
            backdrop:'static',
            //backdrop: false
          });
          var reloadPgae:Observable<boolean>;
          reloadPgae=modalRef.componentInstance.realod;
          reloadPgae.subscribe(
            (b)=>{
              if(b){
                this.immoService.getStructuresFromServer(this.paginateData);
              }
            }
          )
    }
    updateStructure(id:string) {
        const modalRef =this.modalService.open(CreateStructureComponent,{
          centered:true,
          backdrop:'static',
          //backdrop: false
        });
        modalRef.componentInstance.structureId=id;
        var reloadPgae:Observable<boolean>;
        reloadPgae=modalRef.componentInstance.realod;
        reloadPgae.subscribe(
          (b)=>{
            if(b){
              this.immoService.getStructuresFromServer(this.paginateData);
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
   * Initialiser les filtres de recherche
   */
  initSearchFilter(){
    // Débounce pour la recherche textuelle
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  /**
   * Obtenir les structures avec options de recherche
   */
  getStructuresSearchOptions(searchOptions:searchOption[]=[]){
    this.immoService.getStructuresFromServer(this.paginateData, searchOptions);
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
    
    this.getStructuresSearchOptions(searchOptions);
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
    
    this.applyFilters();
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
   * Obtenir l'icône de tri pour une colonne
   */
  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) {
      return 'fas fa-sort text-muted';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  }

  /**
   * Supprimer une structure
   */
  deleteStructure(id: string) {
    this.immoService.deleteStructure(id);
  }

  // Propriétés et méthodes d'exportation
  exportColumns: ExportColumn[] = [
    { key: 'short_name', label: 'Nom Court', translateKey: 'export.shortName' },
    { key: 'name', label: 'Nom', translateKey: 'export.name' },
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
