import { User } from "../../models/user.model";
import { OfficeDetail } from "./office-detail.model";

export interface EmployeeDetail {
    id: string;
    user_id: string;
    office_id: string;
    first_name: string;
    last_name: string;
    matricule: string;
    fonction: string;
    departement: string;
    created_at: string;
    updated_at: string;
    office: OfficeDetail;
    user:User
  }