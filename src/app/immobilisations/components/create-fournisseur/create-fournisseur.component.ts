import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { ImmoService } from '../../services/immo.service';

@Component({
  selector: 'app-create-fournisseur',
  standalone: false,
  templateUrl: './create-fournisseur.component.html',
  styleUrl: './create-fournisseur.component.css'
})
export class CreateFournisseurComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
  @Input()fournisseurId?:string
  loading$!:Observable<boolean>;
  fournisseurForm!:FormGroup
  btnSubmit=false
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  constructor(private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private immoService:ImmoService){}
  ngOnInit(): void {
    this.loading$=this.immoService.loading$
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
    this.fournisseurForm=this.formBuilder.group({
      name:['',Validators.required],
      raison_social:['',Validators.required],
      adresse:['',Validators.required],
      nui:['',Validators.required],
    })
    if(this.fournisseurId){
      const detail =this.immoService.getFournisseursDetailFromServer(this.fournisseurId);
      detail.subscribe(
        data=>{
          this.fournisseurForm.patchValue(data);
        }
      )
    }
  }
  submitForm(){
    if(this.fournisseurForm.valid)
    {
      this.btnSubmit=true
      console.log(this.fournisseurForm.value)
      if(this.fournisseurId){
        this.immoService.updateFournisseur(this.fournisseurForm,this.fournisseurId);
      }else{
        this.immoService.createFournisseur(this.fournisseurForm);
      }
      
    }else{
      console.log(this.fournisseurForm.value)
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
