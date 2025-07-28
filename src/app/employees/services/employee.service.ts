import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { PaginateData } from '../../models/paginate-data.model';
import { GlobalServices } from '../../services/global.services';
import { BuildingDetail } from '../models/building-detail.model';
import { EmployeeDetail } from '../models/employee-detail.model';
import { OfficeDetail } from '../models/office-detail.model';
import { exploseSearchOption, searchOption } from '../../models/search-element.model';
import { Employeeimmo } from '../models/employee-immo-detail.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends GlobalServices {

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router, private injector_: Injector){
    super(https,snak, injector_)
  }
  _employees$=new BehaviorSubject<EmployeeDetail[]>([])
  get employees$():Observable<EmployeeDetail[]>{
    return this._employees$.asObservable();
  }
  _buildings$= new BehaviorSubject<BuildingDetail[]>([]);
  get buildings$():Observable<BuildingDetail[]>{
    return this._buildings$.asObservable();
  }
  _offices$= new BehaviorSubject<OfficeDetail[]>([]);
  get offices$():Observable<OfficeDetail[]>{
    return this._offices$.asObservable();
  }
  _transfers$= new BehaviorSubject<Employeeimmo[]>([]);
  get transfers$():Observable<Employeeimmo[]>{
    return this._transfers$.asObservable();
  }
  getEmployeeFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
        pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<EmployeeDetail>>(`${environment.apiUrlFirst}/admin/employees/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._employees$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      })
    ).subscribe()
  }
  getEmployeeFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.http.get<ApiResponse<EmployeeDetail[]>>(`${environment.apiUrlFirst}/admin/employees/full-all?`,header).pipe(
      map(data=>{
        console.log(data)
        this._employees$.next(data.data??[]);
      })
    ).subscribe()
  }
  getBuildingsFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
        pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<BuildingDetail>>(`${environment.apiUrlFirst}/admin/buildings/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._buildings$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      })
    ).subscribe()
  }
  getBuildingsFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.http.get<ApiResponse<BuildingDetail[]>>(`${environment.apiUrlFirst}/admin/buildings/full-all`,header).pipe(
      map(data=>{
        console.log(data)
        this._buildings$.next(data.data??[]);
      })
    ).subscribe()
  }
  getOfficesFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
        pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/offices/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._offices$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1,
        })
      })

    ).subscribe()
  }
  getOfficesFullFromServer(searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    this.http.get<ApiResponse<OfficeDetail[]>>(`${environment.apiUrlFirst}/admin/offices/full-all?`,header).pipe(
      map(data=>{
        console.log(data)
        this._offices$.next(data.data??[]);
      })

    ).subscribe()
  }
  getEmployeeDetailFromServer(id:string):Observable<EmployeeDetail>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<EmployeeDetail>>(`${environment.apiUrlFirst}/admin/employees/${id}`,header).pipe(
      map(data => data.data as EmployeeDetail)
    )
  }
  getBuildingDetailFromServer(id:string):Observable<BuildingDetail>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<BuildingDetail>>(`${environment.apiUrlFirst}/admin/buildings/${id}`,header).pipe(
      map(data => data.data as BuildingDetail)
    )
  }
  getOfficeDetailFromServer(id:string):Observable<OfficeDetail>{
    const header =this.getHearder();
    //this.setLoadStatus(true)
    return this.http.get<ApiResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/offices/${id}`,header).pipe(
      map(data => data.data as OfficeDetail)
    )
  }
  createBuilding(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<BuildingDetail>>(`${environment.apiUrlFirst}/admin/buildings/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('BuildingDetail create successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }
  updateBuilding(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<BuildingDetail>>(`${environment.apiUrlFirst}/admin/buildings/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('BuildingDetail Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }
  createOffice(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/offices/create`,form.value,header).pipe(
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
  updateOffice(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/offices/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Office Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }
  createEmployee(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/employees/create`,form.value,header).pipe(
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
  updateEmployee(form:FormGroup,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<OfficeDetail>>(`${environment.apiUrlFirst}/admin/employees/update/${id}`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage('Office Updated successfully')
          this.setConfirmSubmit(true)
          this.setLoadStatus(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }
  assignImmobilisationToEmployee(formdData:FormData,employe_id:string){
    const header =this.getHearder();
    this.setLoadStatus(true);
    this.http.post<ApiResponse<EmployeeDetail>>(`${environment.apiUrlFirst}/admin/employees/assign-immo/${employe_id}`,formdData,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data);
        if(data.success){
          this.setSnackMesage('Immobilisation assigned successfully');
          this.setConfirmSubmit(true);
        }
        else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      }),
      catchError(this.handleError)
    ).subscribe();
  }

  // Methods for Transfer Management
  getTransfersFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
    const header =this.getHearder();
    let pagin =this.explosePaginationOption(paginateD);
    let search =exploseSearchOption(searchOptions);
        pagin += search ? `&${search}` : '';
    this.setLoadStatus(true)
    this.http.get<ApiPaginatedResponse<Employeeimmo>>(`${environment.apiUrlFirst}/admin/transfer-immo-employees/all?${pagin}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._transfers$.next(data.data?.data??[]);
        this._paginateData$.next({
          current_page:data.data?.current_page??1,
          per_page:data.data?.per_page??1,
          total:data.data?.total??1
        })
        return data.data?.data??[]
      }),
      catchError(this.handleError)
    ).subscribe();
  }

  getTransferDetailFromServer(id:string):Observable<Employeeimmo|null>{
    const header =this.getHearder();
    this.setLoadStatus(true)
    return this.http.get<ApiResponse<Employeeimmo>>(`${environment.apiUrlFirst}/admin/transfer-immo-employees/detail/${id}`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data);
        return data.data??null;
      }),
      catchError(this.handleError)
    );
  }

  createTransfer(form:FormGroup){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<Employeeimmo>>(`${environment.apiUrlFirst}/admin/transfer-immo-employees/create`,form.value,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data);
        if(data.success){
          this.setSnackMesage('Transfer created successfully');
          this.setConfirmSubmit(true);
        }
        else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      }),
      catchError(this.handleError)
    ).subscribe();
  }
}
