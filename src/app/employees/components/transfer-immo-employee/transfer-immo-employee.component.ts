import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable } from 'rxjs';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDetail } from '../../models/employee-detail.model';
import { ImmobilisationDetail } from '../../../immobilisations/models/immobilisation-detail.model';
import { ImmoService } from '../../../immobilisations/services/immo.service';
import { searchby } from '../../../models/search-element.model';

@Component({
  selector: 'app-transfer-immo-employee',
  standalone: false,
  templateUrl: './transfer-immo-employee.component.html',
  styleUrl: './transfer-immo-employee.component.css'
})
export class TransferImmoEmployeeComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  transferForm!: FormGroup;
  employees$!: Observable<EmployeeDetail[]>;
  immobilisations$!: Observable<ImmobilisationDetail[]>;
  confirmSubmit$!: Observable<boolean>;

  // Form controls
  immobilisationCtrl!: FormControl;
  fromEmployeeCtrl!: FormControl;
  toEmployeeCtrl!: FormControl;
  commentCtrl!: FormControl;

  constructor(
    private languageService: LanguageService,
    private employeeService: EmployeeService,
    private immoService: ImmoService,
    private formBuilder: FormBuilder,
    private router: Router,
    private modalService: NgbModal
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.employeeService.loading$;
    this.employees$ = this.employeeService.employees$;
    this.immobilisations$ = this.immoService.immobilisations$;
    this.confirmSubmit$ = this.employeeService.confirmSubmit$;

    this.initForm();
    this.loadData();

    // Subscribe to form submission confirmation
    this.confirmSubmit$.subscribe(confirmed => {
      if (confirmed) {
        this.router.navigate(['/admin/employees/transfers']);
      }
    });
  }

  initForm(): void {
    this.immobilisationCtrl = this.formBuilder.control('', [Validators.required]);
    this.fromEmployeeCtrl = this.formBuilder.control('',[Validators.required]);
    this.toEmployeeCtrl = this.formBuilder.control('', [Validators.required]);
    this.commentCtrl = this.formBuilder.control('');

    this.transferForm = this.formBuilder.group({
      immobilisation_id: this.immobilisationCtrl,
      from_employee_id: this.fromEmployeeCtrl,
      to_employee_id: this.toEmployeeCtrl,
      comment: this.commentCtrl
    }); 
    this.fromEmployeeCtrl.valueChanges.subscribe(value => {
      this.immoService.getImmoFullFromServer([searchby('employee_id', value)]);
    });
  }

  loadData(): void {
    this.employeeService.getEmployeeFromServer();
    //this.immoService.getImmoFullFromServer();
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      this.employeeService.createTransfer(this.transferForm);
    } else {
      this.markFormGroupTouched(this.transferForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/employees/transfers']);
  }
}
