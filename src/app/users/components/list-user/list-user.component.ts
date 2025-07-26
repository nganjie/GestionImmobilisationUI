import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { User, Role } from '../../../models/user.model';
import { PaginateData } from '../../../models/paginate-data.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../../services/language/language.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { UserService } from '../../services/user.service';
import { CreateUserComponent } from '../create-user/create-user.component';

@Component({
  selector: 'app-list-user',
  standalone: false,
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!: Observable<PaginateData>;
  paginateData!: PaginateData;
  totaElement = 0;
  pageEvent!: PageEvent;
  
  // Form controls pour les filtres
  searchCtrl!: FormControl;
  roleCtrl!: FormControl;
  statusCtrl!: FormControl;
  
  // Observables pour les données
  users$!: Observable<User[]>;
  roles$!: Observable<Role[]>;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private languageService: LanguageService,
    private userService: UserService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.userService.loading$;
    this.users$ = this.userService.users$;
    this.roles$ = this.userService.roles$;
    this.paginateData$ = this.userService.paginateData$;

    this.initFormControls();
    this.setupFilterSubscriptions();
    this.loadInitialData();
  }

  initFormControls(): void {
    this.searchCtrl = this.formBuilder.control('');
    this.roleCtrl = this.formBuilder.control('');
    this.statusCtrl = this.formBuilder.control('');
  }

  setupFilterSubscriptions(): void {
    // Abonnement pour la recherche avec debounce
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    this.roleCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.statusCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.paginateData$.subscribe(data => {
      this.paginateData = data;
      this.totaElement = data.total ?? 0;
    });
  }

  loadInitialData(): void {
    this.userService.getUserFromServer();
    this.applyFilters();
  }

  getSearchOptions(): searchOption[] {
    let searchOptions: searchOption[] = [];

    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }

    if (this.roleCtrl.value) {
      searchOptions.push(searchby('role_id', this.roleCtrl.value));
    }

    if (this.statusCtrl.value !== '') {
      searchOptions.push(searchby('is_admin', this.statusCtrl.value));
    }

    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));

    return searchOptions;
  }

  applyFilters(): void {
    this.paginateData.current_page = 1;
    this.userService.getUserFromServer(this.paginateData, this.getSearchOptions());
  }

  pageChange(event: PageEvent): PageEvent {
    this.paginateData.current_page = event.pageIndex + 1;
    this.paginateData.per_page = event.pageSize;
    this.userService.getUserFromServer(this.paginateData, this.getSearchOptions());
    return event;
  }

  sortBy(column: string): void {
    if (this.currentSortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) {
      return 'fas fa-sort text-secondary';
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  openCreateModal(): void {
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then(() => {
      this.applyFilters();
    }).catch(() => {
      // Modal fermée sans action
    });
  }

  openEditModal(user: User): void {
    const modalRef = this.modalService.open(CreateUserComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    // Passer l'utilisateur à éditer au composant modal
    modalRef.componentInstance.userToEdit = user;

    modalRef.result.then(() => {
      this.applyFilters();
    }).catch(() => {
      // Modal fermée sans action
    });
  }

  goToDetail(user: User): void {
    this.router.navigate(['/admin/users/detail', user.id]);
  }

  goToEdit(user: User): void {
    this.openEditModal(user);
  }

  resetFilters(): void {
    this.searchCtrl.setValue('');
    this.roleCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.applyFilters();
  }
}
