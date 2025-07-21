import { InventoryTypeEnum } from "../../enums/inventory-type.enum";
import { User } from "../../models/user.model";

export interface InventoryDetail {
  id: string;
  user_id: string;
  name: string;//use to create inventory
  type: InventoryTypeEnum;//use to create inventory
  description: string;//use to create inventory
  end_date?: any;//use to update inventory
  user:User;
  created_at: string;
  updated_at: string;
}