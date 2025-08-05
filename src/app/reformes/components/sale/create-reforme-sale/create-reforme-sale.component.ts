import { Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../../models/error-server.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeService } from '../../../services/reforme.service';
import { SaleDetail } from '../../../models/sale-detail.model';
import { ImmobilisationDetail } from '../../../../immobilisations/models/immobilisation-detail.model';
import { ImmoService } from '../../../../immobilisations/services/immo.service';
import { BuyerDetail } from '../../../models/buyer-detail';

@Component({
  selector: 'app-create-reforme-sale',
  standalone: false,
  templateUrl: './create-reforme-sale.component.html',
  styleUrl: './create-reforme-sale.component.css'
})
export class CreateReformeSaleComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  
  loading$!: Observable<boolean>;
  reformeSaleForm!: FormGroup;
  btnSubmit = false;
  error$!: Observable<ErrorServer>;
  confirmSubmit$!: Observable<boolean>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
  buyers$!: Observable<BuyerDetail[]>;
  selectedFiles: File[] = [];

  constructor(
    private languageService: LanguageService,
    @Optional() private readonly activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private reformeService: ReformeService,
    private immoService: ImmoService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.reformeService.loading$;
    this.reformeService.setLoadStatus(false);
    this.immobilisations$ = this.immoService.immobilisations$;
    this.buyers$ = this.reformeService.buyers$;
    this.initForm();
    this.loadImmobilisations();
    this.loadBuyers();
  }

  confirm(): void {
    if (this.activeModal) {
      this.activeModal.close('created');
    }
  }

  dismiss(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
    }
  }

  loadImmobilisations(): void {
    // Load available immobilisations for sale
    this.immoService.getImmoFullFromServer();
  }

  loadBuyers(): void {
    // Load available buyers for sale
    this.reformeService.getBuyersFullFromServer();
  }

  initForm(): void {
    this.error$ = this.reformeService.error$;
    this.confirmSubmit$ = this.reformeService.confirmSubmit$;
    
    this.confirmSubmit$.subscribe(success => {
      if (this.btnSubmit && success) {
        this.reload.emit(true);
        this.confirm();
      }
    });

    this.reformeSaleForm = this.formBuilder.group({
      immobilisation_id: ['', Validators.required],
      buyer_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      comment: [''],
      documents: [[]]
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', files.length);
      const newFiles = Array.from(files) as File[];
      
      // Ajouter les nouveaux fichiers à la liste existante au lieu de remplacer
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      console.log('Total selected files:', this.selectedFiles.map(f => f.name));
      
      // Reset the input value so the same file can be selected again
      event.target.value = '';
    }
  }

  clearAllFiles(): void {
    this.selectedFiles = [];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  submitForm(): void {
    if (this.reformeSaleForm.valid) {
      this.btnSubmit = true;
      console.log(this.reformeSaleForm.value);
      
      const formData = new FormData();
      const formValue = this.reformeSaleForm.value;
      
      // Add form fields
      formData.append('immobilisation_id', formValue.immobilisation_id);
      formData.append('buyer_id', formValue.buyer_id);
      formData.append('amount', formValue.amount);
      formData.append('comment', formValue.comment || '');
      
      // Add documents
      this.selectedFiles.forEach((file, index) => {
        formData.append(`documents[${index}]`, file);
      });
      
      // Create new sale
      this.reformeService.createReformeSale(formData);
    } else {
      console.log('Form is invalid:', this.reformeSaleForm.value);
      this.btnSubmit = true;
    }
  }

  getFormControlErrorText(ctrl: AbstractControl | null): string {
    if (ctrl?.hasError('required')) {
      return this.languageService.instant("FieldRequired");
    } else if (ctrl?.hasError('min')) {
      return this.languageService.instant("AmountMustBePositive");
    } else if (ctrl?.hasError('minlength')) {
      return this.languageService.instant("FieldTooShort");
    } else if (ctrl?.hasError('maxlength')) {
      return this.languageService.instant("FieldTooLong");
    } else {
      return '';
    }
  }
}
