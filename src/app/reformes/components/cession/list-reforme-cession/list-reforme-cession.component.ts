import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginateData } from '../../../../models/paginate-data.model';
import { searchOption, search, searchby } from '../../../../models/search-element.model';
import { LanguageService } from '../../../../services/language/language.service';
import { CessionDetail } from '../../../models/cession-detail';
import { ReformeService } from '../../../services/reforme.service';
import { CreateReformeCessionComponent } from '../create-reforme-cession/create-reforme-cession.component';
import { BaseComponent } from '../../../../shared/components/base/base.component';

@Component({
  selector: 'app-list-reforme-cession',
  standalone: false,
  templateUrl: './list-reforme-cession.component.html',
  styleUrl: './list-reforme-cession.component.css'
})
export class ListReformeCessionComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  pageArray: number[] = [];
  searchCtrl!: FormControl;
  reformeCessions$!: Observable<CessionDetail[]>;
  Math = Math; // Expose Math to template

  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Date filter
  startDate: string = '';
  endDate: string = '';

  constructor(
    private languageService: LanguageService,
    private reformService: ReformeService,
    private modalService: NgbModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('init');
    this.loading$ = this.reformService.loading$;
    this.searchCtrl = this.formBuilder.control('');
    // TODO: Implement reformeCessions$ in service
     this.reformeCessions$ = this.reformService.cessions$;
    this.paginateData$ = this.reformService.paginateData$;
    this.paginateData$.subscribe(
      data => {
        this.paginateData = data;
        this.totaElement = data.total ?? 0;
        // TODO: Implement changeChoiceItemPage method
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

  pageChange(event: PageEvent): PageEvent {
    this.paginateData.current_page = event.pageIndex + 1;
    this.paginateData.per_page = event.pageSize;
    this.applyFilters();
    return event;
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
    
    // TODO: Implement getReformeCessionFromServer method in service
     this.reformService.getCessionFromServer(this.paginateData, searchOptions);
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

  createReformeCession(): void {
    const modalRef = this.modalService.open(CreateReformeCessionComponent, {
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
    this.router.navigate(['/admin/reformes/cessions/detail', id]);
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
}
