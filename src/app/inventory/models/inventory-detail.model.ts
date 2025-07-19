import { User } from "../../models/user.model";

export interface InventoryDetail {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description: string;
  end_date?: any;
  user:User;
  created_at: string;
  updated_at: string;
}