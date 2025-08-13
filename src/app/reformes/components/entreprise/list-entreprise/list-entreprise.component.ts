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
import { CreateEntrepriseComponent } from '../create-entreprise/create-entreprise.component';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ExportFormat } from '../../../../shared/components/export-buttons/export-buttons.component';

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

     constructor(public languageService:LanguageService,private reformService:ReformeService,private modalService:NgbModal, private router: Router,private formBuilder: FormBuilder,private route:ActivatedRoute, private exportService: ExportService){
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
  createEntreprise() {
      const modalRef =this.modalService.open(CreateEntrepriseComponent,{
        centered:true,
        backdrop:'static',
        //backdrop: false
      });
      var reloadPgae:Observable<boolean>;
      reloadPgae=modalRef.componentInstance.reload;
      reloadPgae.subscribe(
        (b)=>{
          if(b){
            this.reformService.getEntreprisesFromServer(this.paginateData);
          }
        }
      )
    }
    updateEntreprise(id:string) {
        const modalRef =this.modalService.open(CreateEntrepriseComponent,{
          centered:true,
          backdrop:'static',
          //backdrop: false
        });
        modalRef.componentInstance.entrepriseId=id;
        var reloadPgae:Observable<boolean>;
        reloadPgae=modalRef.componentInstance.reload;
        reloadPgae.subscribe(
          (b)=>{
            if(b){
              this.reformService.getEntreprisesFromServer(this.paginateData);
            }
          }
        )
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

    getCompanyTypeLabel(isPhysic: boolean): string {
      return isPhysic ? 'PersonnePhysique' : 'PersonneMorale';
    }

    getCompanyTypeBadgeClass(isPhysic: boolean): string {
      return isPhysic ? 'bg-gradient-info' : 'bg-gradient-primary';
    }

    viewDetails(id: string): void {
      this.router.navigate(['/admin/reformes/entreprises/detail', id]);
    }

    editEntreprise(id: string): void {
      this.router.navigate(['/admin/reformes/entreprises/edit', id]);
    }

    deleteEntreprise(id: string): void {
      this.reformService.deleteEnterprise(id);
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

    // Propriétés et méthodes d'exportation
    exportColumns: ExportColumn[] = [
      { key: 'name', label: 'Nom', translateKey: 'export.name' },
      { key: 'raison_sociale', label: 'Raison Sociale', translateKey: 'export.raisonSociale' },
      { key: 'adresse', label: 'Adresse', translateKey: 'export.adresse' },
      { key: 'contact', label: 'Contact', translateKey: 'export.contact' },
      { key: 'email', label: 'Email', translateKey: 'export.email' },
      { key: 'telephone', label: 'Téléphone', translateKey: 'export.telephone' },
      { key: 'secteur_activite', label: 'Secteur d\'Activité', translateKey: 'export.sector' },
      { key: 'status', label: 'Statut', translateKey: 'export.status' },
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
