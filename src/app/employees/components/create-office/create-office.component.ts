import { Component, EventEmitter, Injector, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { CountryData } from '../../../models/user.model';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { BuildingDetail } from '../../models/building-detail.model';
import { MatSelectSearchVersion } from 'ngx-mat-select-search';
import { CreateBuildingComponent } from '../create-building/create-building.component';

@Component({
  selector: 'app-create-office',
  standalone: false,
  templateUrl: './create-office.component.html',
  styleUrl: './create-office.component.css'
})
export class CreateOfficeComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
 @ViewChild('singleSelect')
   singleSelect: MatSelect = new MatSelect;
   matSelectSearchVersion = MatSelectSearchVersion;
   options = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
  ];
  selectedOption: string | null = null;
  //matSelect=null;
  officeId?:string
  loading$!:Observable<boolean>;
  employeeForm!:FormGroup
  buildings$!:Observable<BuildingDetail[]>
  btnSubmit=false;
  buildingCtrl!:FormControl
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  buildingsData!:BuildingDetail[];
  numEtageCtl!:FormControl;
  public addTagNowRef!: ()=>void;
  constructor(private injector: Injector,private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private employeeService:EmployeeService,private modalService:NgbModal){
    this.addTagNowRef = this.addCustomItem.bind(this);
  }
  ngOnInit(): void {
    //this.singleSelect = this.injector.get(MatSelect);
    this.loading$=this.employeeService.loading$
    this.buildings$=this.employeeService.buildings$;
    this.buildings$.subscribe(
      data=>{
        this.buildingsData=data
      }
    )
    this.employeeService.getBuildingsFromServer()
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
    const modalRef =this.modalService.open(CreateBuildingComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getBuildingsFromServer()
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
    this.buildingCtrl=this.formBuilder.control('');
    this.numEtageCtl=this.formBuilder.control(0,[Validators.required])
    this.employeeForm=this.formBuilder.group({
      name:['',Validators.required],
      building_id:['',Validators.required],
      num_office:['',Validators.required],
      num_etage:this.numEtageCtl,
    })
    if(this.officeId){
      const detail =this.employeeService.getOfficeDetailFromServer(this.officeId);
      detail.subscribe(
        data=>{
          this.employeeForm.patchValue(data);
        }
      )
    }
  }
  selectBuilding(event:any){
    console.log(event.target.value);
    this.numEtageCtl.addValidators([Validators.max(this.buildingsData.find(a=>a.id==event.target.value)?.nb_etage??5)])
   // this.employeeForm.addAsyncValidators({})
  }
  submitForm(){
    if(this.employeeForm.valid)
    {
      this.btnSubmit=true
      console.log(this.employeeForm.value)
      if(this.officeId){
        this.employeeService.updateOffice(this.employeeForm,this.officeId);
      }else{
        this.employeeService.createOffice(this.employeeForm);
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
    }else if(ctrl?.hasError('max')){
      const maxFloors = this.buildingsData.find(a=>a.id==this.employeeForm?.get('building_id')?.value)?.nb_etage;
      return this.languageSservice.instant("FloorNumberTooHigh").replace('{max}', maxFloors?.toString() || '');
    }else{
      return '';
    }
  }
}
