import { Injectable } from '@angular/core';
import { GlobalServices } from '../../services/global.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Categorie, Fournisseur, ImmobilisationDetail, Structure } from '../models/immobilisation-detail.model';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { environment } from '../../../environments/environment';
import { PaginateData } from '../../models/paginate-data.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ImmoService extends GlobalServices {

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router){
    super(https,snak)
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
  getImmoFromServer(paginateD:PaginateData){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
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
      })
    ).subscribe()
  }
  getCategoriesFromServer(paginateD:PaginateData){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
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
      })
    ).subscribe()
  }
  getStructuresFromServer(paginateD:PaginateData){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
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
      })

    ).subscribe()
  }
  getFournisseursFromServer(paginateD:PaginateData){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
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
      })
    ).subscribe()
  }
  getCategorieDetailFromServer(id:string):Observable<Categorie>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Categorie>>(`${environment.apiUrlFirst}/admin/immo/categories/${id}`,header).pipe(
      map(data => data.data as Categorie)
    )
  }
  getStructureDetailFromServer(id:string):Observable<Structure>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Structure>>(`${environment.apiUrlFirst}/admin/immo/structures/${id}`,header).pipe(
      map(data => data.data as Structure)
    )
  }
  getFournisseursDetailFromServer(id:string):Observable<Fournisseur>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<Fournisseur>>(`${environment.apiUrlFirst}/admin/immo/fournisseurs/${id}`,header).pipe(
      map(data => data.data as Fournisseur)
    )
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
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
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }
}
