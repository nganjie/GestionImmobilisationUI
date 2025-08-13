import { Injectable, Injector } from '@angular/core';
import { GlobalServices } from '../../services/global.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { Categorie, Fournisseur, ImmobilisationDetail, Structure } from '../models/immobilisation-detail.model';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { environment } from '../../../environments/environment';
import { PaginateData } from '../../models/paginate-data.model';
import { FormGroup } from '@angular/forms';
import { EmployeeDetail } from '../../employees/models/employee-detail.model';
import { exploseSearchOption, searchOption } from '../../models/search-element.model';

@Injectable({
  providedIn: 'root'
})
export class ImmoService extends GlobalServices {

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router, private injector_: Injector){
    super(https,snak, injector_)
  }
  _immobilisations$=new BehaviorSubject<ImmobilisationDetail[]>([])
  get immobilisations$():Observable<ImmobilisationDetail[]>{
    return this._immobilisations$.asObservable();
  }
  _categories$= new BehaviorSubject<Categorie[]>([]);
  get categories$():Observable<Categorie[]>{
    return this._categories$.asObservable();
  }
  _structures$= new BehaviorSubject<Structure[]>([]);
  get structures$():Observable<Structure[]>{
    return this._structures$.asObservable();
  }
  _fournisseurs$= new BehaviorSubject<Fournisseur[]>([]);
  get fournisseurs$():Observable<Fournisseur[]>{
    return this._fournisseurs$.asObservable();
  }
  getImmoFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<ImmobilisationDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._immobilisations$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getImmoEmployeeFromServer(employeeId:string,paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<ImmobilisationDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/employee/${employeeId}?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._immobilisations$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      }),
      catchError(this.handleError)
    ).subscribe()

  }
  getImmoFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.setLoadStatus(true)
    let search =exploseSearchOption(searchOptions);
    this.http.get<ApiResponse<ImmobilisationDetail[]>>(`${environment.apiUrlFirst}/admin/immo/immo/full-all?${search}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._immobilisations$.next(data.data??[]);
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getCategoriesFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<Categorie>>(`${environment.apiUrlFirst}/admin/immo/categories/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._categories$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getCategoriesFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.setLoadStatus(true)
    
    this.http.get<ApiResponse<Categorie[]>>(`${environment.apiUrlFirst}/admin/immo/categories/full-all?`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._categories$.next(data.data??[]);
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getStructuresFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<Structure>>(`${environment.apiUrlFirst}/admin/immo/structures/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._structures$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getStructuresFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.get<ApiResponse<Structure[]>>(`${environment.apiUrlFirst}/admin/immo/structures/full-all?`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._structures$.next(data.data??[]);
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getFournisseursFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<Fournisseur>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._fournisseurs$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getFournisseursFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.get<ApiResponse<Fournisseur[]>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/full-all`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._fournisseurs$.next(data.data??[]);
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  getImmoDetailFromServer(id:string):Observable<ImmobilisationDetail>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<ImmobilisationDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/${id}`,header).pipe(
      map(data => data.data as ImmobilisationDetail),
      catchError(this.handleError)
    )
  }
  getCategorieDetailFromServer(id:string):Observable<Categorie>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Categorie>>(`${environment.apiUrlFirst}/admin/immo/categories/${id}`,header).pipe(
      map(data => data.data as Categorie),
      catchError(this.handleError)
    )
  }
  getStructureDetailFromServer(id:string):Observable<Structure>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Structure>>(`${environment.apiUrlFirst}/admin/immo/structures/${id}`,header).pipe(
      map(data => data.data as Structure),
      catchError(this.handleError)
    )
  }
  getFournisseursDetailFromServer(id:string):Observable<Fournisseur>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Fournisseur>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/${id}`,header).pipe(
      map(data => data.data as Fournisseur),
      catchError(this.handleError)
    )
  }
  createImmo(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<EmployeeDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  updateImmo(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<EmployeeDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  createCategorie(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<Categorie>>(`${environment.apiUrlFirst}/admin/immo/categories/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Categorie create successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  updateCategorie(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<Categorie>>(`${environment.apiUrlFirst}/admin/immo/categories/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Categorie Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  createFournisseur(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<Fournisseur>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Fournisseur Create successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          console.log(data.error)
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  updateFournisseur(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<Fournisseur>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Fournisseur Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  createStructure(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<Structure>>(`${environment.apiUrlFirst}/admin/immo/structures/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Fournisseur Create successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  updateStructure(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<Structure>>(`${environment.apiUrlFirst}/admin/immo/structures/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Structure Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  deleteImmo(id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.delete<ApiResponse<ImmobilisationDetail>>(`${environment.apiUrlFirst}/admin/immo/immo/delete/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true);
          this.getImmoFromServer();
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  deleteCategorie(id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/immo/categories/delete/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true);
          this.getCategoriesFromServer();
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  deleteStructure(id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/immo/structures/delete/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true);
          this.getStructuresFromServer();
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
  deleteFournisseur(id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/delete/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        this.getFournisseursFromServer();
        if(data.success){
          this.setSnackMesage(data.message)
          this.setConfirmSubmit(true);
          
        }else{
          this.setSnackMesage(`${data.error}`,'custom-error-snackbar');
        }
      }),
      catchError(this.handleError)
    ).subscribe()
  }
}
