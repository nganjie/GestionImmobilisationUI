import { PaginationDetail } from "./pagination-detail.model";


export interface ApiPaginatedResponse<T=any> {
  data?:PaginationDetail<T>;
  message?: any;
  success: boolean;
  error_code: number;
  error: string;
  }
  export interface ApiResponse<T=any>{
    data?:T;
    message?: any;
    success: boolean;
    error_code: number;
    error: string;
  }


  export function LogOut(){
    localStorage.removeItem("tokenApp")
    localStorage.removeItem("userApp")
  }

  export function HavePermission():boolean{
    let reponse=false;
  return reponse

    }
    
 
