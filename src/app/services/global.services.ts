import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { PaginateData } from "../models/paginate-data.model";
import { ErrorServer } from "../models/error-server.model";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { User } from "../models/user.model";
import { Injectable, Injector } from "@angular/core";
import { RoleService } from "./role.service";
import { UserRole } from "../enums/roles.enum";

@Injectable({
  providedIn: 'root'
})
export class GlobalServices{
    headers!:{headers:HttpHeaders};
    currentUser!:User;
    roleCurrentUser!:UserRole[];
    emptyPaginate={ current_page:0,
        per_page:10}
    _nameMenue$=new BehaviorSubject<string>('');
    private _roleService: RoleService | null = null;
    
    get nameMenu$():Observable<string>{
        return this._nameMenue$.asObservable();
    }

    constructor(protected http:HttpClient,private snackBar:MatSnackBar, private injector?: Injector){
        this.handleError=this.handleError.bind(this)
        this.headers=this.getHearder()
        this.getCurrentUserBase()
        
        //this.getCurrentsTatisticsBase();
    }
    getRolesCurrentUser():UserRole[]{
        if(this.currentUser && this.currentUser.roles){
            return this.currentUser.roles.map(role => role.name as UserRole);
        }
        return [];
    }

    // Méthode pour obtenir le RoleService de manière lazy
    private getRoleService(): RoleService {
        if (!this._roleService && this.injector) {
            this._roleService = this.injector.get(RoleService);
        }
        return this._roleService!;
    }
    setNameMenue(name:string){
        this._nameMenue$.next(name);
    }


    getCurrentUserBase(){
        var data =localStorage.getItem('userApp');
        if(data){
            var stringData =JSON.stringify(data);
            var jsonDataPrimary =JSON.parse(stringData)
            var jsonData =JSON.parse(jsonDataPrimary)
            //console.log('current User : ',jsonData)
            //this.roleCurrentUser=jsonData.user_roles[0].role.code;
            this.currentUser=jsonData //as CurrentUser;
           // this.roleCurrentUser=this.currentUser.user_roles.map(a=>a.role.code as RolesEnum) 
           // Rafraîchir les rôles dans le RoleService
           if (this.injector) {
               this.getRoleService().refreshUserRoles();
           }
        }

    }

    // Méthodes déléguées au RoleService pour la rétrocompatibilité
    hasRole(role: UserRole): boolean {
        return this.getRoleService().hasRole(role);
    }

    hasAnyRole(roles: UserRole[]): boolean {
        return this.getRoleService().hasAnyRole(roles);
    }

    isSuperAdmin(): boolean {
        return this.getRoleService().isSuperAdmin();
    }

    isAdmin(): boolean {
        return this.getRoleService().isAdmin();
    }

    isVisitor(): boolean {
        return this.getRoleService().isVisitor();
    }

    canCreate(): boolean {
        return this.getRoleService().canCreate();
    }

    canModify(): boolean {
        return this.getRoleService().canModify();
    }

    canDelete(): boolean {
        return this.getRoleService().canDelete();
    }

    canManageUsers(): boolean {
        return this.getRoleService().canManageUsers();
    }

    canRead(): boolean {
        return this.getRoleService().canRead();
    }
    tokenType  = 'Bearer ';
    lastLoaded=0
    _error$ =new BehaviorSubject<ErrorServer>({status:false,message:''})
    private _loading$ =new BehaviorSubject<boolean>(false)
    get error$():Observable<ErrorServer>{
        return this._error$.asObservable();
    }
    _confirmSubmit$=new BehaviorSubject<boolean>(false)
    get confirmSubmit$():Observable<boolean>{
        return this._confirmSubmit$.asObservable();
    }
    explosePaginationOption(data:PaginateData):string{
        let options=`per_page=${data.per_page}&page=${data.current_page}`;
        return options;
    }
    setConfirmSubmit(confirm:boolean){
        this._confirmSubmit$.next(true);
    }
    _paginateData$=new BehaviorSubject<PaginateData>({
        current_page:1,
        per_page:5,
        total:1
    })
    get paginateData$():Observable<PaginateData>{
        return this._paginateData$.asObservable();
    }

    exploseRoleArray(roles:string[]):string{
        let stringSearch='';
        let i=0;
        roles.forEach(s=>{
            if(i==0)
                stringSearch+=`${s}`;
            else
              stringSearch+=`,${s}`;
            i=1;
        })
        return stringSearch;
    }
    setError(error:{status:boolean,message:string}){
        this._error$.next(error);
    }
    get loading$():Observable<boolean>{
        return this._loading$.asObservable();
    }
    getHearder():{headers:HttpHeaders}
    {
        const token =localStorage.getItem('tokenApp');
        if(token){
            const header =new HttpHeaders().set("Authorization",this.tokenType+token);
        const headers= {headers:header};
        return {headers:header};
        }else{
            return {headers:new HttpHeaders()}
        }
        //console.log(token)
        
        
    }
    setLoadStatus(loading:boolean){
        this._loading$.next(loading);
    }
    
    setSnackMesage(message:string,color:string='success-snackbar'){

      this.snackBar.open(
        message,
        "Close",
        {
          duration: 5000,
          panelClass: [color],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      console.log('popup modal')

      }
       handleError(error: HttpErrorResponse) {
        this.setLoadStatus(false);
        console.log('handleError',error);
        if(error.status==400){
            this._error$.next({status:false,message:error.error.message})
        }else{
            this._error$.next({status:false,message:error.error.message})
        }
       
        let errorMessage = '';
    
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client (navigateur, connexion)
          errorMessage = `Erreur Client : ${error.error.message}`;
          this._error$.next({status:false,message:error.error.error})
        } else {
          // Erreur côté serveur (API down, 500, etc.)
          errorMessage = `Erreur Serveur ${error.status} : ${error.message}`;
        }
        this.setSnackMesage(error.error.message,'btn-danger');
    
        //console.error(errorMessage); // Log de l'erreur (optionnel)
        return throwError(() => error); // Retourne une erreur observable
      }
      
    
}
