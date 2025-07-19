import { OfficeDetail } from "../../employees/models/office-detail.model";
import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { User } from "../../models/user.model";

export interface MissingInventoryDetail {
  id: string;
  user_id: string;
  office_id: string;
  immobilisation_id: string;
  status: string;
  comment: string;
  user:User;
  office:OfficeDetail
  created_at: string;
  updated_at: string;
  immobilisation: ImmobilisationDetail;
}