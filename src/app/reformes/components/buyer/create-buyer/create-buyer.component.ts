import { Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../../models/error-server.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeService } from '../../../services/reforme.service';
import { BuyerDetail } from '../../../models/buyer-detail';

@Component({
  selector: 'app-create-buyer',
  standalone: false,
  templateUrl: './create-buyer.component.html',
  styleUrl: './create-buyer.component.css'
})
export class CreateBuyerComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  
  buyerId?: string;
  loading$!: Observable<boolean>;
  buyerForm!: FormGroup;
  btnSubmit = false;
  error$!: Observable<ErrorServer>;
  confirmSubmit$!: Observable<boolean>;

  constructor(
    private languageService: LanguageService,
    @Optional() private readonly activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private reformeService: ReformeService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.reformeService.loading$;
    this.reformeService.setLoadStatus(false);
    this.initForm();
  }

  confirm(): void {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }

  dismiss(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
    }
  }

  initForm(): void {
    this.error$ = this.reformeService.error$;
    this.confirmSubmit$ = this.reformeService.confirmSubmit$;
    
    this.confirmSubmit$.subscribe(success => {
      if (this.btnSubmit && success) {
        this.reload.emit(true);
        this.dismiss();
      }
    });

    this.buyerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      cni: ['', Validators.required],
      tel: ['', Validators.required]
    });

    if (this.buyerId) {
      const detail = this.reformeService.getBuyerDetailFromServer(this.buyerId);
      detail.subscribe(data => {
        this.buyerForm.patchValue(data);
      });
    }
  }

  submitForm(): void {
    if (this.buyerForm.valid) {
      this.btnSubmit = true;
      console.log(this.buyerForm.value);
      
      
      if (this.buyerId) {
        this.reformeService.updateBuyer(this.buyerId, this.buyerForm.value);
      } else {
        this.reformeService.createBuyer(this.buyerForm.value);
      }
    } else {
      console.log('Form is invalid:', this.buyerForm.value);
      this.btnSubmit = true;
    }
  }

  getFormControlErrorText(ctrl: AbstractControl | null): string {
    if (ctrl?.hasError('required')) {
      return this.languageService.instant("FieldRequired");
    } else if (ctrl?.hasError('minlength')) {
      return this.languageService.instant("FieldTooShort");
    } else if (ctrl?.hasError('maxlength')) {
      return this.languageService.instant("FieldTooLong");
    } else {
      return '';
    }
  }
}
