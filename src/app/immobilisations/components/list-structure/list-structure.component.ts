import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { Structure } from '../../models/immobilisation-detail.model';
import { ImmoService } from '../../services/immo.service';
import { CreateStructureComponent } from '../create-structure/create-structure.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../../services/language/language.service';

@Component({
  selector: 'app-list-structure',
  standalone: false,
  templateUrl: './list-structure.component.html',
  styleUrl: './list-structure.component.css'
})
export class ListStructureComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    page$ =new BehaviorSubject<number>(1);
  structures$!:Observable<Structure[]>
  constructor(private languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.structures$=this.immoService.structures$;
    this.paginateData$=this.immoService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
      }
    );
    this.immoService.getStructuresFromServer({current_page:1,per_page:this.itemsPerPage});

    //this.setnameMenu('structures');

  }
   createStructure(){
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
                this.immoService.getStructuresFromServer(this.paginateData);
              }
            }
          )
    }
    updateStructure(id:string) {
        const modalRef =this.modalService.open(CreateStructureComponent,{
          centered:true,
          backdrop:'static',
          //backdrop: false
        });
        modalRef.componentInstance.structureId=id;
        var reloadPgae:Observable<boolean>;
        reloadPgae=modalRef.componentInstance.realod;
        reloadPgae.subscribe(
          (b)=>{
            if(b){
              this.immoService.getStructuresFromServer(this.paginateData);
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
    this.immoService.getStructuresFromServer(this.paginateData)
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
