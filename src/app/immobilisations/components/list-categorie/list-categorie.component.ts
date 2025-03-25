import { Component, OnInit } from '@angular/core';
import { Categorie } from '../../models/immobilisation-detail.model';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { PageEvent } from '@angular/material/paginator';
import { Observable, BehaviorSubject } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { ImmoService } from '../../services/immo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCategorieComponent } from '../create-categorie/create-categorie.component';
import { LanguageService } from '../../../services/language/language.service';

@Component({
  selector: 'app-list-categorie',
  standalone: false,
  templateUrl: './list-categorie.component.html',
  styleUrl: './list-categorie.component.css'
})
export class ListCategorieComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    page$ =new BehaviorSubject<number>(1);
  categories$!:Observable<Categorie[]>
  constructor(private languageService:LanguageService,private immoService:ImmoService,private modalService:NgbModal){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.immoService.loading$
    this.categories$=this.immoService.categories$;
    this.paginateData$=this.immoService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
        //this.itemsPerPage=data.per_page;

      }
    );
    this.immoService.getCategoriesFromServer({current_page:1,per_page:this.itemsPerPage});

    //this.setnameMenu('categories');

  }
  
  createCategorie() {
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
          this.immoService.getCategoriesFromServer(this.paginateData);
        }
      }
    )
  }
  updateCategorie(id:string) {
    const modalRef =this.modalService.open(CreateCategorieComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    modalRef.componentInstance.categorieId=id;
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.immoService.getCategoriesFromServer(this.paginateData);
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
    this.immoService.getCategoriesFromServer(this.paginateData)
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
