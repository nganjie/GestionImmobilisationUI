import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImmobilisationDetail } from '../../../immobilisations/models/immobilisation-detail.model';
import { ImmoService } from '../../../immobilisations/services/immo.service';
import { limit, search, searchby } from '../../../models/search-element.model';
import { EmployeeDetail } from '../../models/employee-detail.model';

@Component({
  selector: 'app-add-immobilisation-to-employee',
  standalone: false,
  templateUrl: './add-immobilisation-to-employee.component.html',
  styleUrl: './add-immobilisation-to-employee.component.css'
})
export class AddImmobilisationToEmployeeComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  immoForm!: FormGroup;
  loading$!: Observable<boolean>;
  error$!: Observable<ErrorServer>;
  @Input()employeeId?: string;
  btnSubmit=false
  confirmSubmit$!:Observable<boolean>;
  immobilisations$!:Observable<ImmobilisationDetail[]>;
  filteredImmobilisations: ImmobilisationDetail[] = [];
  selectedImmobilisations: string[] = [];
  allImmobilisations: ImmobilisationDetail[] = [];
  employees$!:Observable<EmployeeDetail[]>;
  confirmSubmit!:Observable<boolean>;
  constructor(@Optional() private readonly activeModal:NgbActiveModal,private employeeService: EmployeeService, private languageService: LanguageService,private formBuilder:FormBuilder,private immoService:ImmoService) {}
  ngOnInit(): void {
    this.confirmSubmit$ = this.employeeService.confirmSubmit$;
    this.confirmSubmit$.subscribe(
      bo=>{
        if(this.btnSubmit&&bo)
        {
          this.reload.emit(true);
          this.dismiss();
        }
      }
    );
    this.immobilisations$ = this.immoService.immobilisations$;
    this.employees$ = this.employeeService.employees$;

    this.loading$ = this.employeeService.loading$;
    this.error$ = this.employeeService.error$;
    this.employeeService.getEmployeeFullFromServer();
    this.initForm();
    this.loadImmobilisations();
    // Charger les immobilisations si elles ne sont pas déjà chargées
    this.immoService.getImmoFullFromServer([limit(10),searchby('not_assigned', this.employeeId)]);
  }
  initForm(){
    if (this.employeeId) {
      this.immoForm = this.formBuilder.group({
      immobilisations: this.formBuilder.array([]),
    });
    }else{
      this.immoForm = this.formBuilder.group({
        immobilisations: this.formBuilder.array([]),
        employee_id:['', Validators.required]
      });
    }
    
  }
  confirm():void{
    if(this.activeModal)
      this.activeModal.close()
  }
  dismiss():void{
    if(this.activeModal)
    {
      
      this.activeModal.dismiss()
    }
      
  }
  submitForm(){
    if(this.selectedImmobilisations.length > 0)
    {
      this.btnSubmit=true
      // Mettre à jour le FormArray avec les immobilisations sélectionnées
      const immobilisationIds = this.immoForm.get('immobilisations') as FormArray;
      immobilisationIds.clear();
      this.selectedImmobilisations.forEach(id => {
        immobilisationIds.push(this.formBuilder.control(id));
      });

      console.log(this.immoForm.value)
      if(this.employeeId){
        this.employeeService.assignImmobilisationToEmployee(this.immoForm.value,this.employeeId);
      }else{
        this.employeeService.assignImmobilisationToEmployee(this.immoForm.value,this.immoForm.value.employee_id);
      }
      
    }else{
      console.log("Aucune immobilisation sélectionnée")
      this.btnSubmit=false
    }
  }

  // Charger les immobilisations disponibles
  loadImmobilisations(): void {
    this.immobilisations$.subscribe(immobilisations => {
      // Filtrer seulement les immobilisations disponibles (non assignées)
      this.allImmobilisations = immobilisations
      this.filteredImmobilisations = [...this.allImmobilisations];
    });
  }

  // Filtrer les immobilisations par nom ou code
  filterImmobilisations(searchTerm: string): void {
    this.immoService.getImmoFullFromServer([search(searchTerm),searchby('not_assigned', this.employeeId)]);
   /* console.log('Filtrer les immobilisations avec le terme:', searchTerm);
    if (!searchTerm.trim()) {
      this.filteredImmobilisations = [...this.allImmobilisations];
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredImmobilisations = this.allImmobilisations.filter(immo =>
      immo.name.toLowerCase().includes(term) ||
      immo.code.toLowerCase().includes(term) ||
      immo.mark.toLowerCase().includes(term) ||
      immo.model.toLowerCase().includes(term)
    );
    console.log('Immobilisations filtrées:', this.filteredImmobilisations);*/
  }

  // Gérer la sélection d'une immobilisation
  onImmobilisationSelect(event: Event, immobilisationId: string): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      if (!this.selectedImmobilisations.includes(immobilisationId)) {
        this.selectedImmobilisations.push(immobilisationId);
      }
    } else {
      const index = this.selectedImmobilisations.indexOf(immobilisationId);
      if (index > -1) {
        this.selectedImmobilisations.splice(index, 1);
      }
    }
  }

  // Gérer la sélection/désélection de tous
  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentImmobilisations = this.filteredImmobilisations.length > 0 
      ? this.filteredImmobilisations 
      : this.allImmobilisations;

    if (checkbox.checked) {
      // Sélectionner tous les éléments visibles
      currentImmobilisations.forEach(immo => {
        if (!this.selectedImmobilisations.includes(immo.id)) {
          this.selectedImmobilisations.push(immo.id);
        }
      });
    } else {
      // Désélectionner tous les éléments visibles
      currentImmobilisations.forEach(immo => {
        const index = this.selectedImmobilisations.indexOf(immo.id);
        if (index > -1) {
          this.selectedImmobilisations.splice(index, 1);
        }
      });
    }

    // Mettre à jour l'état des checkboxes individuelles
    this.updateIndividualCheckboxes();
  }
  onSearchEmployee(searchTerm:any): void {
    this.employeeService.getEmployeeFullFromServer([search(searchTerm)]);
  }

  // Mettre à jour l'état des checkboxes individuelles
  private updateIndividualCheckboxes(): void {
    const currentImmobilisations = this.filteredImmobilisations.length > 0 
      ? this.filteredImmobilisations 
      : this.allImmobilisations;

    currentImmobilisations.forEach(immo => {
      const checkbox = document.getElementById(`immo-${immo.id}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = this.selectedImmobilisations.includes(immo.id);
      }
    });
  }
}
