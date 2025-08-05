import { Component, EventEmitter, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { ImmoService } from '../../services/immo.service';
import { MatSelect } from '@angular/material/select';
import { CreateCategorieComponent } from '../create-categorie/create-categorie.component';
import { Injector } from '@angular/core/primitives/di';
import { CreateStructureComponent } from '../create-structure/create-structure.component';
import { CreateFournisseurComponent } from '../create-fournisseur/create-fournisseur.component';
import { Categorie, Fournisseur, Structure } from '../../models/immobilisation-detail.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-immobilisation',
  standalone: false,
  templateUrl: './create-immobilisation.component.html',
  styleUrl: './create-immobilisation.component.css'
})
export class CreateImmobilisationComponent implements OnInit{
  @Output() realod= new EventEmitter<boolean>()
  @ViewChild('singleSelect')
   singleSelect: MatSelect = new MatSelect;
  immoId?:string
  loading$!:Observable<boolean>;
  immoForm!:FormGroup;
  structures$!:Observable<Structure[]>;
  categories$!:Observable<Categorie[]>;
  fournisseurs$!:Observable<Fournisseur[]>
  btnSubmit=false
  error$!:Observable<ErrorServer>;
  confirmSubmit$!:Observable<boolean>;
  public addTagNowRef!: ()=>void;
  public addTagNowStrRef!: ()=>void;
  public addTagNowFourRef!: ()=>void;
  constructor(private languageSservice:LanguageService,@Optional() private readonly activeModal:NgbActiveModal,private formBuilder:FormBuilder,private immoService:ImmoService,private modalService:NgbModal,private route:ActivatedRoute){
    this.addTagNowRef = this.addCustomItem.bind(this);
    this.addTagNowStrRef = this.addCustomStrItem.bind(this);
    this.addTagNowFourRef = this.addCustomFourItem.bind(this);
  }
  ngOnInit(): void {
    this.immoId = this.route.snapshot.paramMap.get('id') || undefined;
    this.loading$=this.immoService.loading$
    this.structures$=this.immoService.structures$;
    this.categories$=this.immoService.categories$;
    this.fournisseurs$=this.immoService.fournisseurs$;
    this.immoService.getCategoriesFullFromServer();
    this.immoService.getStructuresFullFromServer();
    this.immoService.getFournisseursFullFromServer();
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
      const modalRef =this.modalService.open(CreateCategorieComponent,{
        centered:true,
        backdrop:'static',
        //backdrop: false
      });
      var reloadPgae:Observable<boolean>;
      reloadPgae=modalRef.componentInstance.realod;
      reloadPgae.subscribe(
        (b)=>{
          if(b){
            this.immoService.getCategoriesFullFromServer()
            //this.employeeService.getOfficesFromServer(this.paginateData);
          }
        }
      )
    }
    addCustomStrItem(){
      const modalRef =this.modalService.open(CreateStructureComponent,{
        centered:true,
        backdrop:'static',
        //backdrop: false
      });
      var reloadPgae:Observable<boolean>;
      reloadPgae=modalRef.componentInstance.realod;
      reloadPgae.subscribe(
        (b)=>{
          if(b){
            this.immoService.getStructuresFullFromServer()
            //this.employeeService.getOfficesFromServer(this.paginateData);
          }
        }
      )
    }
    addCustomFourItem(){
      const modalRef =this.modalService.open(CreateFournisseurComponent,{
        centered:true,
        backdrop:'static',
        //backdrop: false
      });
      var reloadPgae:Observable<boolean>;
      reloadPgae=modalRef.componentInstance.realod;
      reloadPgae.subscribe(
        (b)=>{
          if(b){
            this.immoService.getFournisseursFullFromServer()
            //this.employeeService.getOfficesFromServer(this.paginateData);
          }
        }
      )
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
    if(this.immoId){
       this.immoForm=this.formBuilder.group({
      name:[''],
      mark:[''],
      model:[''],
      unit_price:[''],
      num_bon_commande:[''],
      num_proces_verbal:[''],
      date_of_receipt:[''],
      categorie_id:[''],
      fournisseur_id:[''],
      structure_id:[''],
    })
    }else{
       this.immoForm=this.formBuilder.group({
      name:['',Validators.required],
      mark:[''],
      model:[''],
      quantity:['',Validators.required],
      unit_price:['',Validators.required],
      num_bon_commande:['',Validators.required],
      num_proces_verbal:['',Validators.required],
      date_of_receipt:['',Validators.required],
      categorie_id:['',Validators.required],
      fournisseur_id:['',Validators.required],
      structure_id:['',Validators.required],
    })
    }
   
    if(this.immoId){
      const detail =this.immoService.getImmoDetailFromServer(this.immoId);
      detail.subscribe(
        data=>{
          this.immoForm.patchValue(data);
        }
      )
    }
  }
  submitForm(){
    if(this.immoForm.valid)
    {
      this.btnSubmit=true
      console.log(this.immoForm.value)
      if(this.immoId){
        this.immoService.updateImmo(this.immoForm,this.immoId);
      }else{
        this.immoService.createImmo(this.immoForm);
      }
      
    }else{
      console.log(this.immoForm.value)
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

  /**
   * Vérifie si un champ du formulaire est obligatoire
   */
  isFieldRequired(fieldName: string): boolean {
    const control = this.immoForm?.get(fieldName);
    if (control?.validator) {
      const validator = control.validator({} as AbstractControl);
      return validator && validator['required'];
    }
    return false;
  }
}
