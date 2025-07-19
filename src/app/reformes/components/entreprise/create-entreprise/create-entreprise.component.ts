import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../../models/error-server.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeService } from '../../../services/reforme.service';
import { EntrepriseDetail } from '../../../models/entreprise-detail.model';

@Component({
  selector: 'app-create-entreprise',
  standalone: false,
  templateUrl: './create-entreprise.component.html',
  styleUrl: './create-entreprise.component.css'
})
export class CreateEntrepriseComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  
  @Input()entrepriseId?: string;
  loading$!: Observable<boolean>;
  entrepriseForm!: FormGroup;
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

    if(this.entrepriseId) {
      this.entrepriseForm = this.formBuilder.group({
      name: [''],
      nui: [''],
      tel: [''],
      adresse: [''],
      is_physic: [false]
    });
    }else{
      this.entrepriseForm = this.formBuilder.group({
      name: ['', Validators.required],
      nui: ['', Validators.required],
      tel: ['', Validators.required],
      adresse: ['', Validators.required],
      is_physic: [false, Validators.required]
    });
    }

    
    console.log('Entreprise ID:', this.entrepriseId);
    if (this.entrepriseId) {
      const detail = this.reformeService.getEntrepriseDetailFromServer(this.entrepriseId);
      detail.subscribe(data => {
        console.log('Entreprise detail:', data);
        this.entrepriseForm.patchValue(data);
      });
    }
  }

  submitForm(): void {
    if (this.entrepriseForm.valid) {
      this.btnSubmit = true;
      console.log(this.entrepriseForm.value);
      
      
      
      if (this.entrepriseId) {
        this.reformeService.updateEntreprise(this.entrepriseId, this.entrepriseForm.value);
      } else {
        this.reformeService.createEntreprise(this.entrepriseForm.value);
      }
    } else {
      console.log('Form is invalid:', this.entrepriseForm.value);
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
