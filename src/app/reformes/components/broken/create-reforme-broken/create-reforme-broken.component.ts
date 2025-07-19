import { Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../../models/error-server.model';
import { LanguageService } from '../../../../services/language/language.service';
import { ReformeService } from '../../../services/reforme.service';
import { ReformeBrokenDetail } from '../../../models/reforme-broken-detail';
import { ImmobilisationDetail } from '../../../../immobilisations/models/immobilisation-detail.model';
import { ImmoService } from '../../../../immobilisations/services/immo.service';

@Component({
  selector: 'app-create-reforme-broken',
  standalone: false,
  templateUrl: './create-reforme-broken.component.html',
  styleUrl: './create-reforme-broken.component.css'
})
export class CreateReformeBrokenComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  
  loading$!: Observable<boolean>;
  reformeBrokenForm!: FormGroup;
  btnSubmit = false;
  error$!: Observable<ErrorServer>;
  confirmSubmit$!: Observable<boolean>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
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
    this.immobilisations$ = this.immoService.immobilisations$;
    this.initForm();
    this.loadImmobilisations();
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

  loadImmobilisations(): void {
    // Load immobilisations with broken status
    this.immoService.getImmoFullFromServer();
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

    this.reformeBrokenForm = this.formBuilder.group({
      immobilisation_id: ['', Validators.required],
      comment: ['', Validators.required],
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
    if (this.reformeBrokenForm.valid) {
      this.btnSubmit = true;
      console.log(this.reformeBrokenForm.value);
      
      const formData = new FormData();
      const formValue = this.reformeBrokenForm.value;
      
      // Add form fields
      formData.append('immobilisation_id', formValue.immobilisation_id);
      formData.append('comment', formValue.comment);
      
      // Add documents
      this.selectedFiles.forEach((file, index) => {
        formData.append(`documents[${index}]`, file);
      });
      
      // Only create new broken assets (no update)
      this.reformeService.createReformeBroken(formData);
    } else {
      console.log('Form is invalid:', this.reformeBrokenForm.value);
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
