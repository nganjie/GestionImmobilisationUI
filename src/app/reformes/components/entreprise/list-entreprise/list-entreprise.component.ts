import { Component } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base/base.component';
import { FormControl, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ImmoService } from '../../../../immobilisations/services/immo.service';
import { PaginateData } from '../../../../models/paginate-data.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeService } from '../../../services/reforme.service';
import { EntrepriseDetail } from '../../../models/entreprise-detail.model';
import { searchOption, search, searchby } from '../../../../models/search-element.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-list-entreprise',
  standalone: false,
  templateUrl: './list-entreprise.component.html',
  styleUrl: './list-entreprise.component.css'
})
export class ListEntrepriseComponent extends BaseComponent {
   loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    searchCtrl!:FormControl;
    entreprises$!:Observable<EntrepriseDetail[]>;
    Math = Math; // Expose Math to template

    currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';

     constructor(private languageService:LanguageService,private reformService:ReformeService,private modalService:NgbModal, private router: Router,private formBuilder: FormBuilder,private route:ActivatedRoute){
    super();
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.reformService.loading$;
    this.searchCtrl=this.formBuilder.control('');
    this.entreprises$=this.reformService.entreprises$;
    this.paginateData$=this.reformService.paginateData$;
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0;
        this.changeChoiceItemPage();
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

  applyFilters() {
      const searchOptions: searchOption[] = [];
      
      // Recherche textuelle
      if (this.searchCtrl.value) {
        searchOptions.push(search(this.searchCtrl.value));
      }
      
      
      // Filtre par statut
      
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
      
      this.reformService.getEntreprisesFromServer(this.paginateData,searchOptions);
    }

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
        return 'fas fa-sort text-muted';
      }
      return this.sortDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
    }

    resetFilters(): void {
      this.searchCtrl.reset();
      this.startDate = '';
      this.endDate = '';
      this.currentSortBy = 'created_at';
      this.sortDirection = 'desc';
      this.applyFilters();
    }

    getCompanyTypeLabel(isPhysic: number): string {
      return isPhysic === 1 ? 'PersonnePhysique' : 'PersonneMorale';
    }

    getCompanyTypeBadgeClass(isPhysic: number): string {
      return isPhysic === 1 ? 'bg-gradient-info' : 'bg-gradient-primary';
    }

    viewDetails(id: string): void {
      this.router.navigate(['/admin/reformes/entreprises/detail', id]);
    }

    editEntreprise(id: string): void {
      this.router.navigate(['/admin/reformes/entreprises/edit', id]);
    }

    deleteEntreprise(id: string): void {
      // Implement delete logic
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

    goToPage(page: number): void {
      this.paginateData.current_page = page;
      this.applyFilters();
    }

    previousPage(): void {
      if (this.paginateData.current_page > 1) {
        this.paginateData.current_page--;
        this.applyFilters();
      }
    }

    nextPage(): void {
      const lastPage = Math.ceil((this.paginateData.total || 0) / this.paginateData.per_page);
      if (this.paginateData.current_page < lastPage) {
        this.paginateData.current_page++;
        this.applyFilters();
      }
    }

    getLastPage(): number {
      return Math.ceil((this.paginateData.total || 0) / this.paginateData.per_page);
    }

    isLastPage(): boolean {
      return this.paginateData.current_page === this.getLastPage();
    }
}
