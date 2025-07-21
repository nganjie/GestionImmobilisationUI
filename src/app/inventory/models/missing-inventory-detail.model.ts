import { OfficeDetail } from "../../employees/models/office-detail.model";
import { InventoryStatusEnum } from "../../enums/inventory-status.enum";
import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { User } from "../../models/user.model";
import { InventoryDetail } from "./inventory-detail.model";

export interface MissingInventoryDetail {
  id: string;
  user_id: string;
  office_id: string;//use to create inventory
  immobilisation_id: string;//use to create inventory
  inventory_id: string;//use to create inventory
  status: InventoryStatusEnum;
  comment: string;//use to create inventory
  user:User;
  office:OfficeDetail
  created_at: string;
  updated_at: string;
  inventory: InventoryDetail;
  immobilisation: ImmobilisationDetail;
}