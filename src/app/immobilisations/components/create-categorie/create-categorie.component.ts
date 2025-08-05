import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ImmoService } from '../../services/immo.service';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';

@Component({
  selector: 'app-create-categorie',
  standalone: false,
  templateUrl: './create-categorie.component.html',
  styleUrl: './create-categorie.component.css'
})
export class CreateCategorieComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
  @Input()categorieId?:string
  loading$!:Observable<boolean>;
  categorieForm!:FormGroup
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
    this.categorieForm=this.formBuilder.group({
      name:['',Validators.required],
      short_name:['',Validators.required],
    })
    if(this.categorieId){
      const detail =this.immoService.getCategorieDetailFromServer(this.categorieId);
      detail.subscribe(
        data=>{
          this.categorieForm.patchValue(data);
        }
      )
    }
  }
  submitForm(){
    if(this.categorieForm.valid)
    {
      this.btnSubmit=true
      console.log(this.categorieForm.value)
      if(this.categorieId){
        this.immoService.updateCategorie(this.categorieForm,this.categorieId);
      }else{
        this.immoService.createCategorie(this.categorieForm);
      }
      
    }else{
      console.log(this.categorieForm.value)
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
