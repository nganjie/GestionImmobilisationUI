import { Injectable } from '@angular/core';
import { GlobalServices } from '../../services/global.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { EntrepriseDetail } from '../models/entreprise-detail.model';
import { exploseSearchOption, searchOption } from '../../models/search-element.model';
import { PaginateData } from '../../models/paginate-data.model';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReformeService extends GlobalServices{

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router){
    super(https,snak)
  }
  _entreprises$:BehaviorSubject<EntrepriseDetail[]>=new BehaviorSubject<EntrepriseDetail[]>([]);
  get entreprises$(){
    return this._entreprises$.asObservable();
  }
  getEntreprisesFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
        let pagin =this.explosePaginationOption(paginateD);
        let search =exploseSearchOption(searchOptions);
            pagin += search ? `&${search}` : '';
        this.setLoadStatus(true)
        this.https.get<ApiPaginatedResponse<EntrepriseDetail>>(`${environment.apiUrlFirst}/admin/entreprises/all?${pagin}`,header).pipe(
          map(data=>{
            this.setLoadStatus(false);
            this._entreprises$.next(data.data?.data??[]);
            this._paginateData$.next({
              current_page: data.data?.current_page ?? 0,
              per_page: data.data?.per_page ?? 10,
          })}
        )).subscribe()
  }
  getEntrepriseDetailFromServer(id:string):Observable<EntrepriseDetail>{
    const header =this.getHearder();
    this.setLoadStatus(true);
    return this.https.get<EntrepriseDetail>(`${environment.apiUrlFirst}/admin/entreprises/${id}`,header).pipe(
      map(data=>data)
    )
  }

  createEntreprise(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<EntrepriseDetail>>(`${environment.apiUrlFirst}/admin/entreprises`,form,header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if(data.success){
          this.setSnackMesage(data.message,'success');
          this.setConfirmSubmit(true);
        }else{
          this.setSnackMesage(data.error,'btn-warning')
        }
      }
        
      )
    ).subscribe()
  }
  updateEntreprise(id:string,form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.put<ApiResponse<ApiResponse<EntrepriseDetail>>>(`${environment.apiUrlFirst}/admin/entreprises/${id}`,form,header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if(data.success){
          this.setSnackMesage(data.message,'btn-success');
          this.setConfirmSubmit(true);
        }else{
          this.setSnackMesage(data.error,'btn-warning');
        }
      })
    ).subscribe();
  //getEntrepriseF
}

}
