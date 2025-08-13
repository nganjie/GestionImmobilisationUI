import { Component, OnInit } from '@angular/core';
import { Categorie } from '../../models/immobilisation-detail.model';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { ImmoService } from '../../services/immo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCategorieComponent } from '../create-categorie/create-categorie.component';
import { LanguageService } from '../../../services/language/language.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';

@Component({
  selector: 'app-list-categorie',
  standalone: false,
  templateUrl: './list-categorie.component.html',
  styleUrl: './list-categorie.component.css'
})
export class ListCategorieComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!:Observable<PaginateData>;
  paginateData!:PaginateData;
  totaElement=0;
  pageEvent!: PageEvent;
  pageArray:number[]=[]
  itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
  page$ =new BehaviorSubject<number>(1);
  categories$!:Observable<Categorie[]>
  
  // Propriétés pour les filtres et le tri
  searchCtrl!: FormControl;
  startDate: string = '';
  endDate: string = '';
  currentSortBy: string = 'created_at';
  sortDirection: string = 'desc';
  
  constructor(private languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal, private formBuilder: FormBuilder){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.immoService.loading$
    this.searchCtrl=this.formBuilder.control('');
    this.categories$=this.immoService.categories$;
    this.paginateData$=this.immoService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
        //this.itemsPerPage=data.per_page;
      }
    );
    this.immoService.getCategoriesFromServer({current_page:1,per_page:this.itemsPerPage});
    
    // Initialiser les filtres
    this.initSearchFilter();

    //this.setnameMenu('categories');

  }
  
  createCategorie() {
    const modalRef =this.modalService.open(CreateCategorieComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.immoService.getCategoriesFromServer(this.paginateData);
        }
      }
    )
  }
  updateCategorie(id:string) {
    const modalRef =this.modalService.open(CreateCategorieComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    modalRef.componentInstance.categorieId=id;
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.immoService.getCategoriesFromServer(this.paginateData);
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
   * Obtenir les catégories avec options de recherche
   */
  getCategoriesSearchOptions(searchOptions:searchOption[]=[]){
    this.immoService.getCategoriesFromServer(this.paginateData, searchOptions);
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
    
    this.getCategoriesSearchOptions(searchOptions);
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
   * Supprimer une catégorie
   */
  deleteCategorie(id: string) {
    this.immoService.deleteCategorie(id);
  }

}
