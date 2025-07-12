import { Component, OnInit } from '@angular/core';
import { BuildingDetail } from '../../models/building-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject } from 'rxjs';
import { PaginateData } from '../../../models/paginate-data.model';
import { LanguageService } from '../../../services/language/language.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { CreateBuildingComponent } from '../create-building/create-building.component';

@Component({
  selector: 'app-list-building',
  standalone: false,
  templateUrl: './list-building.component.html',
  styleUrl: './list-building.component.css'
})
export class ListBuildingComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    page$ =new BehaviorSubject<number>(1);
  buildings$!:Observable<BuildingDetail[]>
  constructor(private languageService:LanguageService,private employeeService:EmployeeService,private modalService:NgbModal){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.loading$=this.employeeService.loading$
    this.buildings$=this.employeeService.buildings$;
    this.paginateData$=this.employeeService.paginateData$
    this.paginateData$.subscribe(
      data=>{
        this.paginateData=data;
        this.totaElement=data.total??0
        this.changeChoiceItemPage()
        //this.itemsPerPage=data.per_page;

      }
    );
    this.employeeService.getBuildingsFromServer({current_page:1,per_page:this.itemsPerPage});

    //this.setnameMenu('buildings');

  }
  
  createBuilding() {
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
          this.employeeService.getBuildingsFromServer(this.paginateData);
        }
      }
    )
  }
  updateBuilding(id:string) {
    const modalRef =this.modalService.open(CreateBuildingComponent,{
      centered:true,
      backdrop:'static',
      //backdrop: false
    });
    modalRef.componentInstance.buildingId=id;
    var reloadPgae:Observable<boolean>;
    reloadPgae=modalRef.componentInstance.realod;
    reloadPgae.subscribe(
      (b)=>{
        if(b){
          this.employeeService.getBuildingsFromServer(this.paginateData);
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
    this.employeeService.getBuildingsFromServer(this.paginateData)
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
