import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { ImmoService } from '../../services/immo.service';

@Component({
  selector: 'app-create-structure',
  standalone: false,
  templateUrl: './create-structure.component.html',
  styleUrl: './create-structure.component.css'
})
export class CreateStructureComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
  @Input()structureId?:string
  loading$!:Observable<boolean>;
  structureForm!:FormGroup
  btnSubmit=false
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  constructor(private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private immoService:ImmoService){}
  ngOnInit(): void {
    this.loading$=this.immoService.loading$
     this.immoService.setLoadStatus(false);
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
    this.error$=this.immoService.error$;
    this.confirmSubmit$=this.immoService.confirmSubmit$
    this.confirmSubmit$.subscribe(
      bo=>{
        if(this.btnSubmit&&bo)
        {
          this.realod.emit(true)
          this.dismiss()
        }
      }
    )
    this.structureForm=this.formBuilder.group({
      name:['',Validators.required],
      short_name:['',Validators.required],
    })
    if(this.structureId){
      const detail =this.immoService.getStructureDetailFromServer(this.structureId);
      detail.subscribe(
        data=>{
          this.structureForm.patchValue(data);
        }
      )
    }
  }
  submitForm(){
    if(this.structureForm.valid)
    {
      this.btnSubmit=true
      console.log(this.structureForm.value)
      if(this.structureId){
        this.immoService.updateStructure(this.structureForm,this.structureId);
      }else{
        this.immoService.createStructure(this.structureForm);
      }
      
    }else{
      console.log(this.structureForm.value)
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
