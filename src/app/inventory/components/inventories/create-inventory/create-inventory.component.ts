import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { InventoryService } from '../../../service/inventory.service';
import { InventoryDetail } from '../../../models/inventory-detail.model';
import { LanguageService } from '../../../../services/language/language.service';
import { InventoryTypeEnum, ListInventoryTypeEnum } from '../../../../enums/inventory-type.enum';

@Component({
  selector: 'app-create-inventory',
  standalone: false,
  templateUrl: './create-inventory.component.html',
  styleUrl: './create-inventory.component.css'
})
export class CreateInventoryComponent implements OnInit {
  @Input() inventoryId?: string;
  @Output() reload = new EventEmitter<boolean>();

  inventoryForm!: FormGroup;
  loading$!: Observable<boolean>;
  isEdit = false;
  inventoryDetail?: InventoryDetail;

  inventoryTypes = [
    { value: InventoryTypeEnum.ANNUAL, label: 'Annual' },
    { value: InventoryTypeEnum.HALFYEARLY, label: 'HalfYearly' },
    { value: InventoryTypeEnum.QUARTERLY, label: 'Quarterly' }
  ];

  inventoryTypeEnum = InventoryTypeEnum;
  listInventoryTypeEnum = ListInventoryTypeEnum;

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private activeModal: NgbActiveModal,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.inventoryService.loading$;
    this.isEdit = !!this.inventoryId;
    this.initForm();

    if (this.isEdit && this.inventoryId) {
      this.loadInventoryDetail();
    }
  }

  initForm(): void {
    this.inventoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      description: [''],
      end_date: ['']
    });
  }

  loadInventoryDetail(): void {
    if (this.inventoryId) {
      this.inventoryService.getInventoryDetailFromServer(this.inventoryId).subscribe({
        next: (inventory) => {
          this.inventoryDetail = inventory;
          this.patchForm(inventory);
        },
        error: (error) => {
          console.error('Error loading inventory detail:', error);
        }
      });
    }
  }

  patchForm(inventory: InventoryDetail): void {
    this.inventoryForm.patchValue({
      name: inventory.name,
      type: inventory.type,
      description: inventory.description,
      end_date: inventory.end_date ? new Date(inventory.end_date).toISOString().split('T')[0] : ''
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      const formData = this.inventoryForm;

      const submitAction = this.isEdit && this.inventoryId
        ? this.inventoryService.updateInventory(this.inventoryId, formData)
        : this.inventoryService.createInventory(formData);

      submitAction.subscribe({
        next: (response) => {
          if (response.success) {
            this.reload.emit(true);
            this.activeModal.close(true);
          }
        },
        error: (error) => {
          console.error('Error submitting inventory:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.inventoryForm.controls).forEach(key => {
      const control = this.inventoryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.inventoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.inventoryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.languageService.instant('FieldRequired');
      }
      if (field.errors['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  onCancel(): void {
    this.activeModal.dismiss(false);
  }

  get modalTitle(): string {
    return this.isEdit ? 'EditInventory' : 'CreateInventory';
  }

  get submitButtonText(): string {
    return this.isEdit ? 'Update' : 'Create';
  }
}
