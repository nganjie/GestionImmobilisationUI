import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { Fournisseur } from '../../models/immobilisation-detail.model';
import { ImmoService } from '../../services/immo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../../services/language/language.service';
import { CreateFournisseurComponent } from '../create-fournisseur/create-fournisseur.component';

@Component({
  selector: 'app-list-fournisseur',
  standalone: false,
  templateUrl: './list-fournisseur.component.html',
  styleUrl: './list-fournisseur.component.css'
})
export class ListFournisseurComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    page$ =new BehaviorSubject<number>(1);
  fournisseurs$!:Observable<Fournisseur[]>
  constructor(private languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.fournisseurs$=this.immoService.fournisseurs$;
    this.paginateData$=this.immoService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
        //this.itemsPerPage=data.per_page;

      }
    );
    this.immoService.getFournisseursFromServer({current_page:1,per_page:this.itemsPerPage});

    //this.setnameMenu('fournisseurs');

  }
  createFournisseur(){
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
              this.immoService.getFournisseursFromServer(this.paginateData);
            }
          }
        )
  }
  updateFournisseur(id:string) {
      const modalRef =this.modalService.open(CreateFournisseurComponent,{
        centered:true,
        backdrop:'static',
        //backdrop: false
      });
      modalRef.componentInstance.fournisseurId=id;
      var reloadPgae:Observable<boolean>;
      reloadPgae=modalRef.componentInstance.realod;
      reloadPgae.subscribe(
        (b)=>{
          if(b){
            this.immoService.getFournisseursFromServer(this.paginateData);
          }
        }
      )
    }
  pageChange(event:PageEvent):PageEvent {
    //if(event.pageSize!=this.itemsPerPage){}
    //this.itemsPerPage=event.pageSize;
    //this.itemsPerPage$.next(this.itemsPerPage)
    this.paginateData.current_page=event.pageIndex+1
    this.paginateData.per_page=event.pageSize;
    this.immoService.getFournisseursFromServer(this.paginateData)
    console.log(this.paginateData)
    return event;
  }
  changeChoiceItemPage(){
    let arr:number[]=[];
    console.log(this.pageArray)
    if(this.totaElement<=2)
    {
      console.log('total',this.totaElement)
      arr.push(this.totaElement)
  
    }else{
      for(let i=1;i<this.totaElement/2;i++)
        {
          arr.push(i*2)
        }
        if(this.totaElement%2>0){
          arr.push(this.totaElement)
        }
    }
    console.log(arr);
    this.pageArray=arr;
  }

}
