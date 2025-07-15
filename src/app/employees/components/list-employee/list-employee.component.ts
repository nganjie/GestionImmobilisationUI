import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { PaginateData } from '../../../models/paginate-data.model';
import { LanguageService } from '../../../services/language/language.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { EmployeeDetail } from '../../models/employee-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { CreateEmployeeComponent } from '../create-employee/create-employee.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { search, searchby, searchOption } from '../../../models/search-element.model';
import { OfficeDetail } from '../../models/office-detail.model';
import { AddImmobilisationToEmployeeComponent } from '../add-immobilisation-to-employee/add-immobilisation-to-employee.component';

@Component({
  selector: 'app-list-employee',
  standalone: false,
  templateUrl: './list-employee.component.html',
  styleUrl: './list-employee.component.css'
})
export class ListEmployeeComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
  itemsPerPage: number = 10;
  paginateData$!:Observable<PaginateData>;
  paginateData!:PaginateData;
  totaElement=0;
  pageEvent!: PageEvent;
  pageArray:number[]=[]
  itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
  page$ =new BehaviorSubject<number>(1);
  employees$!:Observable<EmployeeDetail[]>
  offices$!:Observable<OfficeDetail[]>
  
  // Form controls pour les filtres
  searchCtrl!: FormControl;
  departmentCtrl!: FormControl;
  functionCtrl!: FormControl;
  officeCtrl!: FormControl;
  
  // Propriétés de tri
  currentSortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Listes pour les filtres
  availableDepartments: string[] = [];
  availableFunctions: string[] = [];
  
  constructor(private languageService:LanguageService,private employeeService:EmployeeService,private modalService:NgbModal, private formBuilder: FormBuilder, private router: Router){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.employeeService.loading$
    this.employees$=this.employeeService.employees$;
    this.offices$=this.employeeService.offices$;
    this.paginateData$=this.employeeService.paginateData$
    
    // Initialiser les FormControls
    this.searchCtrl = this.formBuilder.control('');
    this.departmentCtrl = this.formBuilder.control('');
    this.functionCtrl = this.formBuilder.control('');
    this.officeCtrl = this.formBuilder.control('');
    
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
        //this.itemsPerPage=data.per_page;
      }
    );
    
    // Écouter les changements des employés pour extraire les départements et fonctions
    this.employees$.subscribe(employees => {
      if (employees) {
        this.extractFilterOptions(employees);
      }
    });
    
    this.employeeService.getEmployeeFromServer({current_page:1,per_page:this.itemsPerPage}, []);
    this.employeeService.getOfficesFullFromServer();
    
    // Initialiser les filtres
    this.initSearchFilter();

    //this.setnameMenu('employees');
  }

  getEmployeeSearchOptions(searchOptions: searchOption[] = []): void {
    this.employeeService.getEmployeeFromServer(this.paginateData, searchOptions);
  }
  
  createEmployee() {
    const modalRef =this.modalService.open(CreateEmployeeComponent,{
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
  updateEmployee(id:string) {
    const modalRef =this.modalService.open(CreateEmployeeComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    modalRef.componentInstance.employeeId=id;
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

  // Search and filter methods
  private initSearchFilter(): void {
    // Recherche avec debounce
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Filtres par département et fonction
    this.departmentCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.functionCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.officeCtrl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private extractFilterOptions(employees: EmployeeDetail[]): void {
    // Extraire les départements uniques
    const departments = [...new Set(employees.map(emp => emp.departement).filter(Boolean))];
    this.availableDepartments = departments;

    // Extraire les fonctions uniques
    const functions = [...new Set(employees.map(emp => emp.fonction).filter(Boolean))];
    this.availableFunctions = functions;

    // Extraire les bureaux uniques
    /*const offices = employees
      .filter(emp => emp.office && emp.office.id)
      .map(emp => emp.office)
      .filter((office, index, self) => 
        index === self.findIndex(o => o.id === office.id)
      );
    this.availableOffices = offices;*/
  }

  applyFilters(): void {
    const searchOptions: searchOption[] = [];
    
    // Recherche textuelle
    if (this.searchCtrl.value) {
      searchOptions.push(search(this.searchCtrl.value));
    }
    
    // Filtre par département
    if (this.departmentCtrl.value) {
      searchOptions.push(searchby('departement', this.departmentCtrl.value));
    }
    
    // Filtre par fonction
    if (this.functionCtrl.value) {
      searchOptions.push(searchby('fonction', this.functionCtrl.value));
    }
    
    // Filtre par bureau
    if (this.officeCtrl.value) {
      searchOptions.push(searchby('office_id', this.officeCtrl.value));
    }
    
    // Tri
    searchOptions.push(searchby('sort_by', this.currentSortBy));
    searchOptions.push(searchby('sort_direction', this.sortDirection));
    
    this.getEmployeeSearchOptions(searchOptions);
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
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  onSearch(searchTerm: string): void {
    this.searchCtrl.setValue(searchTerm);
  }

  onFilterByDepartment(department: string): void {
    this.departmentCtrl.setValue(department);
  }

  onFilterByFunction(functionName: string): void {
    this.functionCtrl.setValue(functionName);
  }

  onFilterByOffice(officeId: string): void {
    this.officeCtrl.setValue(officeId);
  }

  resetFilters(): void {
    this.currentSortBy = 'created_at';
    this.sortDirection = 'desc';
    
    // Réinitialiser les contrôles de formulaire
    this.searchCtrl.setValue('');
    this.departmentCtrl.setValue('');
    this.functionCtrl.setValue('');
    this.officeCtrl.setValue('');
    
    this.applyFilters();
  }

  viewDetails(employeeId: string): void {
    this.router.navigate(['/admin/employees/detail', employeeId]);
  }

  deleteEmployee(employeeId: string): void {
    // TODO: Implement delete functionality
    console.log('Delete employee:', employeeId);
  }

  // Ouvrir le modal d'assignation d'immobilisations
  openAssignImmobilisationModal(employeeId?: string): void {
    const modalRef = this.modalService.open(AddImmobilisationToEmployeeComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });
    
    if (employeeId) {
      modalRef.componentInstance.employeeId = employeeId;
    }
    
    modalRef.result.then((result) => {
      if (result) {
        // Recharger la liste des employés après assignation
        this.applyFilters();
      }
    }).catch((error) => {
      // Modal fermé sans action
      console.log('Modal dismissed');
    });
  }

}
