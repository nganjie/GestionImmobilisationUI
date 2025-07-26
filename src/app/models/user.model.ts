export interface User {
  id: string;
  first_name: string;//use to create user
  last_name: string;//use to create user
  is_admin: number;//use to create user
  email: string;//use to create user
  email_verified_at?: any;
  created_at: string;
  updated_at: string;
  roles: Role[];//select one role to create user
}
export interface Role {
  id: string;
  name: string;
  guard_name: string;
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