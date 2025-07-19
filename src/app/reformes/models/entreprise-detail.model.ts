import { User } from "../../models/user.model";

export interface EntrepriseDetail {
  id: string;
  user_id: string;
  name: string;
  adresse: string;
  nui: string;
  tel: string;
  is_physic: boolean;
  created_at: string;
  updated_at: string;
  user:User
}