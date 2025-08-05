import { EmployeeDetail } from "../../employees/models/employee-detail.model"
import { ImmobilisationStatusEnum } from "../../enums/immobilisation-status.enum"

export interface ImmobilisationDetail {
    id: string
    user_id: string
    categorie_id: string
    structure_id: string
    fournisseur_id: string
    code: string
    name: string
    mark?: string
    model?: string
    quantity: number
    unit_price: number
    status: ImmobilisationStatusEnum
    num_bon_commande: string
    num_proces_verbal: string
    date_of_receipt: string
    created_at: string
    updated_at: string
    categorie: Categorie
    structure: Structure
    fournisseur: Fournisseur
    user: User
    employee_immo?: Employeeimmo;
}
interface Employeeimmo {
  id: string;
  user_id: string;
  immobilisation_id: string;
  employee_id: string;
  last_employee_id?: string;
  transfer_date: string;
  comment?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  employee: EmployeeDetail;
}
  
  export interface Categorie {
    id: string
    user_id: string
    short_name: string
    name: string
    user:User
    created_at: string
    updated_at: string
  }
  
  export interface Structure {
    id: string
    user_id: string
    short_name: string
    name: string
    user:User
    created_at: string
    updated_at: string
  }
  
  export interface Fournisseur {
    id: string
    user_id: string
    raison_social: string
    adresse: string
    nui: string
    user:User
    created_at: string
    updated_at: string
  }
  
  export interface User {
    id: string
    first_name: string
    last_name: string
    is_admin: number
    email: string
    email_verified_at: any
    created_at: string
    updated_at: string
  }
  