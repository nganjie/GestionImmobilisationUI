import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { EmployeeDetail } from "./employee-detail.model";

export interface Employeeimmo {
  id: string;
  user_id: string;
  immobilisation_id: string;
  employee_id: string; // use to create transfer (to name it to_employee_id to the form model)
  last_employee_id?: string;//use to create transfer (to name it from_employee_id to the form model)
  transfer_date: string;
  comment?: string;//use to create transfer 
  status: boolean;
  created_at: string;
  updated_at: string;
  immobilisation:ImmobilisationDetail;
  employee: EmployeeDetail;
  last_employee?: EmployeeDetail; // Optional field for the last employee
}