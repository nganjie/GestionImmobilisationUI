import { Injectable, Injector } from '@angular/core';
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
import { BuyerDetail } from '../models/buyer-detail';
import { ReformeBrokenDetail } from '../models/reforme-broken-detail';
import { CessionDetail } from '../models/cession-detail';
import { SaleDetail } from '../models/sale-detail.model';

@Injectable({
  providedIn: 'root'
})
export class ReformeService extends GlobalServices{

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router, private injector_: Injector){
    super(https,snak, injector_)
  }
  _entreprises$:BehaviorSubject<EntrepriseDetail[]>=new BehaviorSubject<EntrepriseDetail[]>([]);
  get entreprises$(){
    return this._entreprises$.asObservable();
  }
  _buyers$:BehaviorSubject<BuyerDetail[]>=new BehaviorSubject<BuyerDetail[]>([]);
  get buyers$(){
    return this._buyers$.asObservable();
  }
  _reformeBrokens$:BehaviorSubject<ReformeBrokenDetail[]>=new BehaviorSubject<ReformeBrokenDetail[]>([]);
  get reformeBrokens$(){
    return this._reformeBrokens$.asObservable();
  }
  _cessions$:BehaviorSubject<CessionDetail[]>=new BehaviorSubject<CessionDetail[]>([]);
  get cessions$(){
    return this._cessions$.asObservable();
  }
  _sales$:BehaviorSubject<SaleDetail[]>=new BehaviorSubject<SaleDetail[]>([])
  get sales$():Observable<SaleDetail[]>{
    return this._sales$.asObservable()
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
    return this.https.get<ApiResponse<EntrepriseDetail>>(`${environment.apiUrlFirst}/admin/entreprises/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        return data.data as EntrepriseDetail;
      })
    )
  }

  createEntreprise(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<EntrepriseDetail>>(`${environment.apiUrlFirst}/admin/entreprises/create`,form,header).pipe(
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
    this.https.put<ApiResponse<EntrepriseDetail>>(`${environment.apiUrlFirst}/admin/entreprises/update/${id}`,form,header).pipe(
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

//endpoint for buyer

getBuyerFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
        let pagin =this.explosePaginationOption(paginateD);
        let search =exploseSearchOption(searchOptions);
            pagin += search ? `&${search}` : '';
        this.setLoadStatus(true)
        this.https.get<ApiPaginatedResponse<BuyerDetail>>(`${environment.apiUrlFirst}/admin/buyers/all?${pagin}`,header).pipe(
          map(data=>{
            this.setLoadStatus(false);
            this._buyers$.next(data.data?.data??[]);
            this._paginateData$.next({
              current_page: data.data?.current_page ?? 0,
              per_page: data.data?.per_page ?? 10,
          })}
        )).subscribe()
  }
  getBuyerDetailFromServer(id:string):Observable<BuyerDetail>{
    const header =this.getHearder();
    this.setLoadStatus(true);
    return this.https.get<ApiResponse<BuyerDetail>>(`${environment.apiUrlFirst}/admin/buyers/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        return data.data as BuyerDetail;
      })
    )
  }

  createBuyer(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<BuyerDetail>>(`${environment.apiUrlFirst}/admin/buyers/create`,form,header).pipe(
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
  updateBuyer(id:string,form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.put<ApiResponse<BuyerDetail>>(`${environment.apiUrlFirst}/admin/buyers/update/${id}`,form,header).pipe(
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
  }
  
  getBuyersFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.get<ApiResponse<BuyerDetail[]>>(`${environment.apiUrlFirst}/admin/buyers/full-all`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._buyers$.next(data.data??[]);
      })
    ).subscribe()
  }
//endpoint for reforme broken
getReformeBrokenFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
        let pagin =this.explosePaginationOption(paginateD);
        let search =exploseSearchOption(searchOptions);
            pagin += search ? `&${search}` : '';
        this.setLoadStatus(true)
        this.https.get<ApiPaginatedResponse<ReformeBrokenDetail>>(`${environment.apiUrlFirst}/admin/reformes/brokens?${pagin}`,header).pipe(
          map(data=>{
            this.setLoadStatus(false);
            this._reformeBrokens$.next(data.data?.data??[]);
            this._paginateData$.next({
              current_page: data.data?.current_page ?? 0,
              per_page: data.data?.per_page ?? 10,
          })}
        )).subscribe()
  }
  getReformeBrokenDetailFromServer(id:string):Observable<ReformeBrokenDetail>{
    const header =this.getHearder();
    this.setLoadStatus(true);
    return this.https.get<ApiResponse<ReformeBrokenDetail>>(`${environment.apiUrlFirst}/admin/reformes/broken/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        return data.data as ReformeBrokenDetail;
      })
    )
  }

  createReformeBroken(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<ReformeBrokenDetail>>(`${environment.apiUrlFirst}/admin/reformes/broken`,form,header).pipe(
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
  updateReformeBroken(id:string,form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.put<ApiResponse<ReformeBrokenDetail>>(`${environment.apiUrlFirst}/admin/reformes/broken/update/${id}`,form,header).pipe(
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
//endpoint for cession
getCessionFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
        let pagin =this.explosePaginationOption(paginateD);
        let search =exploseSearchOption(searchOptions);
            pagin += search ? `&${search}` : '';
        this.setLoadStatus(true)
        this.https.get<ApiPaginatedResponse<CessionDetail>>(`${environment.apiUrlFirst}/admin/reformes/cessions?${pagin}`,header).pipe(
          map(data=>{
            this.setLoadStatus(false);
            this._cessions$.next(data.data?.data??[]);
            this._paginateData$.next({
              current_page: data.data?.current_page ?? 0,
              per_page: data.data?.per_page ?? 10,
          })}
        )).subscribe()
  }
  getCessionDetailFromServer(id:string):Observable<CessionDetail>{
    const header =this.getHearder();
    this.setLoadStatus(true);
    return this.https.get<ApiResponse<CessionDetail>>(`${environment.apiUrlFirst}/admin/reformes/cession/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        return data.data as CessionDetail;
      })
    )
  }
  createCession(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<CessionDetail>>(`${environment.apiUrlFirst}/admin/re
formes/cession`,form,header).pipe(
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

  //reforme sale endpoint
getReformeSaleFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
        let pagin =this.explosePaginationOption(paginateD);
        let search =exploseSearchOption(searchOptions);
            pagin += search ? `&${search}` : '';
        this.setLoadStatus(true)
        this.https.get<ApiPaginatedResponse<SaleDetail>>(`${environment.apiUrlFirst}/admin/reformes/sales?${pagin}`,header).pipe(
          map(data=>{
            this.setLoadStatus(false);
            this._sales$.next(data.data?.data??[]);
            this._paginateData$.next({
              current_page: data.data?.current_page ?? 0,
              per_page: data.data?.per_page ?? 10,
          })}
        )).subscribe()
  }
  getReformeSaleDetailFromServer(id:string):Observable<SaleDetail>{
    const header =this.getHearder();
    this.setLoadStatus(true);
    return this.https.get<ApiResponse<SaleDetail>>(`${environment.apiUrlFirst}/admin/reformes/sale/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        return data.data as SaleDetail;
      })
    )
  }
  createReformeSale(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.https.post<ApiResponse<SaleDetail>>(`${environment.apiUrlFirst}/admin/reformes/sale`,form,header).pipe(
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

  deleteEnterprise(enterpriseId: string) {
    const header = this.getHearder();
    this.setLoadStatus(true);
    this.https.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/reformes/enterprise/${enterpriseId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message, 'success');
          this.setConfirmSubmit(true);
        } else {
          this.setSnackMesage(data.error, 'btn-warning');
        }
      })
    ).subscribe();
  }
  deleteBuyer(buyerId: string) {
    const header = this.getHearder();
    this.setLoadStatus(true);
    this.https.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/reformes/buyer/${buyerId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message, 'success');
          this.setConfirmSubmit(true);
        } else {
          this.setSnackMesage(data.error, 'btn-warning');
        }
      })
    ).subscribe();
  }

}
