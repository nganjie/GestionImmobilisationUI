import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ImmoService } from '../../services/immo.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ImmobilisationDetail } from '../../models/immobilisation-detail.model';
import { PaginateData } from '../../../models/paginate-data.model';

@Component({
  selector: 'app-list-immobilisation',
  standalone: false,
  templateUrl: './list-immobilisation.component.html',
  styleUrl: './list-immobilisation.component.css'
})
export class ListImmobilisationComponent extends BaseComponent implements OnInit {
  loading$!:Observable<boolean>;
    itemsPerPage: number = 10;
    paginateData$!:Observable<PaginateData>;
    paginateData!:PaginateData;
    totaElement=0;
    pageEvent!: PageEvent;
    pageArray:number[]=[]
    itemsPerPage$=new BehaviorSubject<number>(this.itemsPerPage)
    page$ =new BehaviorSubject<number>(1);
  immobilisations$!:Observable<ImmobilisationDetail[]>
  constructor(private immoService:ImmoService){
    super();
    
    console.log('init constructor')
  }
  ngOnInit(): void {
    console.log('init')
    this.immobilisations$=this.immoService.immobilisations$;
    this.immoService.getImmoFromServer({current_page:1,per_page:this.itemsPerPage});

    //this.setnameMenu('Immobilisations');

  }
  pageChange(event:PageEvent):PageEvent {
    //if(event.pageSize!=this.itemsPerPage){}
    //this.itemsPerPage=event.pageSize;
    //this.itemsPerPage$.next(this.itemsPerPage)
    this.paginateData.current_page=event.pageIndex+1
    this.paginateData.per_page=event.pageSize;
    this.immoService.getImmoFromServer(this.paginateData)
    console.log(this.paginateData)
    return event;
  }

}
