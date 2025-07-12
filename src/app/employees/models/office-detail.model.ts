import { User } from "../../models/user.model";
import { BuildingDetail } from "./building-detail.model";

export interface OfficeDetail {
    id: string;
    user_id: string;
    building_id: string;
    name: string;
    num_office: string;
    status: string;
    num_etage: number;
    created_at: string;
    updated_at: string;
    building: BuildingDetail;
    user:User
  }