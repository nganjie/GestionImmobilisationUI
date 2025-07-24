import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { InventoryService } from '../../../service/inventory.service';
import { MissingInventoryDetail } from '../../../models/missing-inventory-detail.model';
import { InventoryDetail } from '../../../models/inventory-detail.model';
import { OfficeDetail } from '../../../../employees/models/office-detail.model';
import { ImmobilisationDetail } from '../../../../immobilisations/models/immobilisation-detail.model';
import { LanguageService } from '../../../../services/language/language.service';
import { InventoryStatusEnum } from '../../../../enums/inventory-status.enum';
import { ImmoService } from '../../../../immobilisations/services/immo.service';
import { EmployeeService } from '../../../../employees/services/employee.service';
import { searchby } from '../../../../models/search-element.model';

@Component({
  selector: 'app-create-missing-inventory',
  standalone: false,
  templateUrl: './create-missing-inventory.component.html',
  styleUrl: './create-missing-inventory.component.css'
})
export class CreateMissingInventoryComponent implements OnInit {
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @Input() missingInventoryId: string = '';
  @Input() inventoryId: string | null = null; // Pour manage-inventory
  @Input() preSelectedOfficeId: string | null = null; // Pour manage-inventory
  @Input() preSelectedImmobilisationId: string | null = null; // Pour manage-inventory

  missingInventoryForm!: FormGroup;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  currentMissingInventory!: MissingInventoryDetail;

  // Options pour les dropdowns
  inventories$!: Observable<InventoryDetail[]>;
  offices$!: Observable<OfficeDetail[]>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
  confirmSubmit$!: Observable<boolean>;

  // Énumérations
  inventoryStatusEnum = InventoryStatusEnum;
  statusOptions = [
    { value: InventoryStatusEnum.PENDING, label: 'Pending' },
    { value: InventoryStatusEnum.TERMINATED, label: 'Terminated' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private languageService: LanguageService,
    public activeModal: NgbActiveModal,
    private immoService:ImmoService,
    private employeeService:EmployeeService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.missingInventoryId;
    this.initForm();
    this.loadDropdownData();
    
    if (this.isEditMode) {
      this.loadMissingInventoryData();
    }
  }

  initForm(): void {
    this.confirmSubmit$ = this.inventoryService.confirmSubmit$;
    this.confirmSubmit$.subscribe((confirm) => {
      if (confirm) {
        this.activeModal.close(true);
        this.reload.emit(true);
      }
    });
    this.missingInventoryForm = this.formBuilder.group({
      office_id: ['', [Validators.required]],
      immobilisation_id: ['', [Validators.required]],
      inventory_id: ['', [Validators.required]],
      comment: ['']
    });
  }

  loadDropdownData(): void {
    // Charger les inventaires actifs
    this.inventories$ = this.inventoryService.getActiveInventoriesFromServer();
    this.inventories$.subscribe();
    this.offices$=this.employeeService.offices$;
    this.immobilisations$=this.immoService.immobilisations$;
    this.employeeService.getOfficesFullFromServer();
    this.immoService.getImmoFullFromServer([searchby('assigned_employee', 1)]);
    
    // Pré-remplir les champs si des valeurs sont passées depuis manage-inventory
    if (this.inventoryId) {
      this.missingInventoryForm.patchValue({
        inventory_id: this.inventoryId
      });
    }
    
    if (this.preSelectedOfficeId) {
      this.missingInventoryForm.patchValue({
        office_id: this.preSelectedOfficeId
      });
    }
    
    if (this.preSelectedImmobilisationId) {
      this.missingInventoryForm.patchValue({
        immobilisation_id: this.preSelectedImmobilisationId
      });
    }
    
    // TODO: Charger les offices et immobilisations
    // Ces méthodes devraient être disponibles via leurs services respectifs
    // this.loadOffices();
    // this.loadImmobilisations();
  }

  loadMissingInventoryData(): void {
    this.isLoading = true;
    this.inventoryService.getMissingInventoryDetailFromServer(this.missingInventoryId).subscribe({
      next: (missingInventory) => {
        this.currentMissingInventory = missingInventory;
        this.populateForm(missingInventory);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.isLoading = false;
      }
    });
  }

  populateForm(missingInventory: MissingInventoryDetail): void {
    this.missingInventoryForm.patchValue({
      office_id: missingInventory.office_id,
      immobilisation_id: missingInventory.immobilisation_id,
      inventory_id: missingInventory.inventory_id,
      status: missingInventory.status,
      comment: missingInventory.comment || ''
    });
  }

  onSubmit(): void {
    if (this.missingInventoryForm.valid) {
      this.isLoading = true;
      const formData = this.missingInventoryForm.value;
      console.log('Form Data:', formData);
      const request$ = this.isEditMode
        ? this.inventoryService.updateMissingInventory(this.missingInventoryId, formData)
        : this.inventoryService.createMissingInventory(this.missingInventoryForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.missingInventoryForm.controls).forEach(key => {
      const control = this.missingInventoryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.missingInventoryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.missingInventoryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.languageService.instant('FieldRequired');
      }
    }
    return '';
  }

  onCancel(): void {
    this.activeModal.dismiss('cancel');
  }

  getModalTitle(): string {
    return this.isEditMode 
      ? this.languageService.instant('EditMissingItem')
      : this.languageService.instant('AddMissingItem');
  }

  getSubmitButtonText(): string {
    return this.isEditMode 
      ? this.languageService.instant('Update')
      : this.languageService.instant('Create');
  }

  // Méthodes pour les icônes de statut
  getStatusIcon(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'fas fa-clock';
      case InventoryStatusEnum.TERMINATED:
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusClass(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'text-warning';
      case InventoryStatusEnum.TERMINATED:
        return 'text-success';
      default:
        return 'text-secondary';
    }
  }
}
