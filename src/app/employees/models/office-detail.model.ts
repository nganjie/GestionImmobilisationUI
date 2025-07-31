import { OfficeStatusEnum } from "../../enums/office-status.num";
import { User } from "../../models/user.model";
import { BuildingDetail } from "./building-detail.model";

export interface OfficeDetail {
    id: string;
    user_id: string;
    building_id: string;
    name: string;
    num_office: string;
    status: OfficeStatusEnum;
    num_etage: number;
    is_inventory: boolean;
    created_at: string;
    updated_at: string;
    building: BuildingDetail;
    user:User
  }