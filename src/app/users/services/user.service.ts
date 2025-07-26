import { Injectable } from '@angular/core';
import { GlobalServices } from '../../services/global.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map } from 'rxjs';
import { Role, User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { PaginateData } from '../../models/paginate-data.model';
import { searchOption, exploseSearchOption } from '../../models/search-element.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends GlobalServices {

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router){
    super(https,snak)
  }
  _users$:BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  get users$(){
    return this._users$.asObservable();
  }
  _roles$:BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);
  get roles$(){
    return this._roles$.asObservable();
  }

  getUserFromServer(paginateD:PaginateData=this.emptyPaginate,searchOptions:searchOption[]=[]){
      const header =this.getHearder();
      let pagin =this.explosePaginationOption(paginateD);
      let search =exploseSearchOption(searchOptions);
      pagin += search ? `&${search}` : '';
      this.setLoadStatus(true)
      this.http.get<ApiPaginatedResponse<User>>(`${environment.apiUrlFirst}/admin/users/all?${pagin}`,header).pipe(
        map(data=>{
          this.setLoadStatus(false);
          console.log(data)
          this._users$.next(data.data?.data??[]);
          this._paginateData$.next({
            current_page:data.data?.current_page??1,
            per_page:data.data?.per_page??1,
            total:data.data?.total??1,
          })
        }),
        catchError(this.handleError)
      ).subscribe()
    }
    createUser(form:FormData){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.post<ApiResponse<User>>(`${environment.apiUrlFirst}/admin/users/create`,form,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message,'btn-success');
          this.setConfirmSubmit(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }

  updateUser(form:FormData,id:string){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.put<ApiResponse<User>>(`${environment.apiUrlFirst}/admin/users/update/${id}`,form,header).pipe(
      map(data=>{
        this.setLoadStatus(false)
                console.log(data)
        if(data.success){
          this.setSnackMesage(data.message,'btn-success');
          this.setConfirmSubmit(true)
        }else{
          this.setSnackMesage(`${data.error}`,'btn-warning');
        }
      })
    ).subscribe()
  }

  getRolesFromServer(){
    const header =this.getHearder();
    this.setLoadStatus(true)
    this.http.get<ApiResponse<Role[]>>(`${environment.apiUrlFirst}/admin/roles/all`,header).pipe(
      map(data=>{
        this.setLoadStatus(false);
        console.log(data)
        this._roles$.next(data.data??[]);
      })
    ).subscribe()
  }
}