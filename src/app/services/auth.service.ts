import { Injectable, Injector } from '@angular/core';
import { GlobalServices } from './global.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { tap, catchError, Observable, map } from 'rxjs';
import { ApiResponse } from '../models/data-server.model';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends GlobalServices {

  constructor(private https:HttpClient,private snak :MatSnackBar,private router:Router, private injector_: Injector){
    super(https,snak, injector_)
  }
  autentificate(userName: string | null, password: string | null) {

    this.setLoadStatus(true)
    this.http.post<ApiResponse<User>>(`${environment.apiUrlFirst}/main/login`,{
        "email":userName,
        "password":password
    }).pipe(
        tap(dataServer=>{
            console.log(dataServer)
            console.log(dataServer.data);
            
            var d =JSON.stringify(dataServer);
            var dataServerJson=JSON.parse(d) 
            console.log(dataServer)
            if(dataServer.success)
            {
                this.setItemEtExecuter('userApp',JSON.stringify(dataServer.data)).then(()=>{
                    this.setItemEtExecuter('tokenApp',dataServer.message).then(()=>{
                        this.router.navigateByUrl('admin/immobilisations');
                    })
                })

            }
            else
            {
               
                this.setConfirmSubmit(true)
                this._error$.next({status:false,message:dataServer.error})
                this.setSnackMesage(`${dataServer.error}`, 'btn-danger')
                this.setLoadStatus(false)
            }
         // this.setLoadStatus(false)
          
        }),
        catchError(this.handleError)
    ).subscribe()
}
currentUserFromServer(): Observable<User> {
    let headers=this.getHearder();
    this.setLoadStatus(true);
    return this.http.get<ApiResponse<User>>(`${environment.apiUrlFirst}/admin/auth/current-user`,headers).pipe(
        map(dataServer => {
            this.setLoadStatus(false);
            return dataServer.data as User;
        }),
        catchError(this.handleError)
    );
}
 setItemEtExecuter(cle:string, valeur:any) {
    return new Promise<void>((resolve) => {
        localStorage.setItem(cle, valeur);
        resolve(); // Exécution uniquement après l'enregistrement
    });
}


}
