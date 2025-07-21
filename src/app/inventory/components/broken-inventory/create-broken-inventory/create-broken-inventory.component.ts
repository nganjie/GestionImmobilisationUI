import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { InventoryService } from '../../../service/inventory.service';
import { EmployeeService } from '../../../../employees/services/employee.service';
import { ImmoService } from '../../../../immobilisations/services/immo.service';
import { BrokenInventoryDetail } from '../../../models/broken-inventory-detail.model';
import { InventoryDetail } from '../../../models/inventory-detail.model';
import { ImmobilisationDetail } from '../../../../immobilisations/models/immobilisation-detail.model';
import { InventoryStatusEnum } from '../../../../enums/inventory-status.enum';
import { searchby } from '../../../../models/search-element.model';

@Component({
  selector: 'app-create-broken-inventory',
  standalone: false,
  templateUrl: './create-broken-inventory.component.html',
  styleUrl: './create-broken-inventory.component.css'
})
export class CreateBrokenInventoryComponent implements OnInit {
  @Input() brokenInventoryId: string | null = null;
  @Input() isEditMode: boolean = false;
  @Input() inventoryId: string | null = null; // Pour manage-inventory
  @Input() preSelectedImmobilisationId: string | null = null; // Pour manage-inventory
  @Output() reload: EventEmitter<boolean> = new EventEmitter();

  brokenInventoryForm!: FormGroup;
  loading$!: Observable<boolean>;
  inventories$!: Observable<InventoryDetail[]>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
  
  // Énumérations
  inventoryStatusEnum = InventoryStatusEnum;

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private inventoryService: InventoryService,
    private employeeService: EmployeeService,
    private immoService: ImmoService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    
    if (this.isEditMode && this.brokenInventoryId) {
      this.loadBrokenInventoryData();
    }
  }

  initializeForm(): void {
    this.brokenInventoryForm = this.formBuilder.group({
      immobilisation_id: ['', [Validators.required]],
      inventory_id: ['', [Validators.required]],
      status: [InventoryStatusEnum.PENDING, [Validators.required]],
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  loadData(): void {
    this.loading$ = this.inventoryService.loading$;
    
    // Charger les inventaires actifs
    this.inventories$ = this.inventoryService.getActiveInventoriesFromServer();
    
    // Charger les immobilisations
    this.immobilisations$ = this.immoService.immobilisations$;
    this.immoService.getImmoFullFromServer([searchby('assigned_employee', 1)]);
    
    // Pré-remplir les champs si des valeurs sont passées depuis manage-inventory
    if (this.inventoryId) {
      this.brokenInventoryForm.patchValue({
        inventory_id: this.inventoryId
      });
    }
    
    if (this.preSelectedImmobilisationId) {
      this.brokenInventoryForm.patchValue({
        immobilisation_id: this.preSelectedImmobilisationId
      });
    }
  }

  loadBrokenInventoryData(): void {
    if (!this.brokenInventoryId) return;
    
    this.inventoryService.getBrokenInventoryDetailFromServer(this.brokenInventoryId).subscribe({
      next: (brokenInventory: BrokenInventoryDetail) => {
        this.brokenInventoryForm.patchValue({
          immobilisation_id: brokenInventory.immobilisation_id,
          inventory_id: brokenInventory.inventory_id,
          status: brokenInventory.status,
          comment: brokenInventory.comment
        });
      },
      error: (error) => {
        console.error('Error loading broken inventory data:', error);
        this.close();
      }
    });
  }

  onSubmit(): void {
    if (this.brokenInventoryForm.valid) {
      

      if (this.isEditMode && this.brokenInventoryId) {
        this.inventoryService.updateBrokenInventory(this.brokenInventoryId, this.brokenInventoryForm.value);
      } else {
        this.inventoryService.createBrokenInventory(this.brokenInventoryForm.value);
      }

      // Surveiller le statut de confirmation
      this.inventoryService.confirmSubmit$.subscribe(confirmed => {
        if (confirmed) {
          this.reload.emit(true);
          this.activeModal.close(true);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.brokenInventoryForm.controls).forEach(key => {
      const control = this.brokenInventoryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.brokenInventoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.brokenInventoryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  close(): void {
    this.activeModal.close(false);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
