import { User } from "../../models/user.model";

export interface BuildingDetail {
    id: string;
    user_id: string;
    name: string;
    country: string;
    city: string;
    nb_etage: number;
    created_at: string;
    updated_at: string;
    user: User;
  }