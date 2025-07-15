import { Component, EventEmitter, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { CountryData } from '../../../models/user.model';
import { MatSelectSearchVersion } from 'ngx-mat-select-search';
import { VERSION } from '@angular/material/core';

@Component({
  selector: 'app-create-building',
  standalone: false,
  templateUrl: './create-building.component.html',
  styleUrl: './create-building.component.css'
})
export class CreateBuildingComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
  //@ViewChild('singleSelect') singleSelect!: MatSelect;
  @ViewChild('singleSelect')
  singleSelect: MatSelect = new MatSelect;
  matSelectSearchVersion = MatSelectSearchVersion;
  version = VERSION;
  buildingId?:string
  loading$!:Observable<boolean>;
  employeeForm!:FormGroup
  btnSubmit=false
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  countries=CountryData;
  constructor(private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private employeeService:EmployeeService){}
  ngOnInit(): void {
    this.loading$=this.employeeService.loading$
    this.initForm()
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
  
  initForm(){
    this.error$=this.employeeService.error$;
    this.confirmSubmit$=this.employeeService.confirmSubmit$
    this.confirmSubmit$.subscribe(
      bo=>{
        if(this.btnSubmit&&bo)
        {
          this.realod.emit(true)
          this.dismiss()
        }
      }
    )
    this.employeeForm=this.formBuilder.group({
      name:['',Validators.required],
      country:['',Validators.required],
      city:['',Validators.required],
      nb_etage:['',Validators.required],
    })
    if(this.buildingId){
      const detail =this.employeeService.getBuildingDetailFromServer(this.buildingId);
      detail.subscribe(
        data=>{
          this.employeeForm.patchValue(data);
          this.employeeForm.patchValue({
            country:data.country
          });
        }
      )
    }
  }
  submitForm(){
    if(this.employeeForm.valid)
    {
      this.btnSubmit=true
      console.log(this.employeeForm.value)
      if(this.buildingId){
        this.employeeService.updateBuilding(this.employeeForm,this.buildingId);
      }else{
        this.employeeService.createBuilding(this.employeeForm);
      }
      
    }else{
      console.log(this.employeeForm.value)
      console.log("un bon autre")
      this.btnSubmit=true
    }
  }
  getFormControlErrorText(ctrl:AbstractControl|null){
    if(ctrl?.hasError('required')){
      return this.languageSservice.instant("FieldRequired");
    }else if(ctrl?.hasError('email')){
      return this.languageSservice.instant("ValidEmailRequired");
    }else if(ctrl?.hasError('minlength')){
      return this.languageSservice.instant("PhoneNumberTooShort");
    }else if(ctrl?.hasError('maxlength')){
      return this.languageSservice.instant("PhoneNumberTooLong");
    }else{
      return '';
    }
  }
}
