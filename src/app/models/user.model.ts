export interface User {
    id: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
    email: string;
    email_verified_at?: any;
    created_at: string;
    updated_at: string;
  }

  export interface EntityValue{
    name:string;
    value:string;
  }
  export const CountryData:EntityValue[]=[
    {name:'CAMEROUN',value:'CM'},
    {name:'TCHAD',value:'TD'}
  ]