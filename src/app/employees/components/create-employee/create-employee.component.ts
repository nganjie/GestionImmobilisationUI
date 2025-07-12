import { Component, EventEmitter, Injector, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSelectSearchVersion } from 'ngx-mat-select-search';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { BuildingDetail } from '../../models/building-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { CreateOfficeComponent } from '../create-office/create-office.component';
import { OfficeDetail } from '../../models/office-detail.model';

@Component({
  selector: 'app-create-employee',
  standalone: false,
  templateUrl: './create-employee.component.html',
  styleUrl: './create-employee.component.css'
})
export class CreateEmployeeComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
 @ViewChild('singleSelect')
   singleSelect: MatSelect = new MatSelect;
   matSelectSearchVersion = MatSelectSearchVersion;
  //matSelect=null;
  selectedOption: string | null = null;
  employeeId?:string
  loading$!:Observable<boolean>;
  employeeForm!:FormGroup
  offices$!:Observable<OfficeDetail[]>
  btnSubmit=false;
  officeCtrl!:FormControl
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  numEtageCtl!:FormControl;
  public addTagNowRef!: ()=>void;
  constructor(private injector: Injector,private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private employeeService:EmployeeService,private modalService:NgbModal){
    this.addTagNowRef = this.addCustomItem.bind(this);
  }
  ngOnInit(): void {
    //this.singleSelect = this.injector.get(MatSelect);
    this.loading$=this.employeeService.loading$
    this.offices$=this.employeeService.offices$;
    this.offices$.subscribe(
      data=>{
      }
    )
    this.employeeService.getOfficesFullFromServer()
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
  addCustomItem(){
    const modalRef =this.modalService.open(CreateOfficeComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getOfficesFullFromServer()
          //this.employeeService.getOfficesFromServer(this.paginateData);
        }
      }
    )
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
    this.officeCtrl=this.formBuilder.control('');
    this.numEtageCtl=this.formBuilder.control(0,[Validators.required])
    this.employeeForm=this.formBuilder.group({
      first_name:['',Validators.required],
      last_name:['',Validators.required],
      matricule:['',Validators.required],
      fonction:['',Validators.required],
      departement:['',Validators.required],
      office_id:['',Validators.required],
    })
    if(this.employeeId){
      const detail =this.employeeService.getEmployeeDetailFromServer(this.employeeId);
      detail.subscribe(
        data=>{
          this.employeeForm.patchValue(data);
        }
      )
    }
  }
  submitForm(){
    if(this.employeeForm.valid)
    {
      this.btnSubmit=true
      console.log(this.employeeForm.value)
      if(this.employeeId){
        this.employeeService.updateEmployee(this.employeeForm,this.employeeId);
      }else{
        this.employeeService.createEmployee(this.employeeForm);
      }
      
    }else{
      console.log(this.employeeForm.value)
      console.log("un bon autre")
      this.btnSubmit=true
    }
  }
  getFormControlErrorText(ctrl:AbstractControl|null){
    
    if(ctrl?.hasError('required')){
      return "ce champ est réquis";
    }else if(ctrl?.hasError('email')){
      return "merci d'entre une adresse mail valide"
    }else if(ctrl?.hasError('minlength')){
      return 'Ce numéro de téléphone ne contient pas assez de chiffre'
    }else if(ctrl?.hasError('maxlength')){
      return 'Ce numéro de téléphone contient trop de chiffre'
    }else{
      return '';
    }
  }
}
