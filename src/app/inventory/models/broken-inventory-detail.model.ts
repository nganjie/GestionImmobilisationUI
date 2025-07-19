import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";

export interface BrokenInventoryDetail {
  id: string;
  user_id: string;
  immobilisation_id: string;
  status: string;
  comment: string;
  created_at: string;
  updated_at: string;
  immobilisation: ImmobilisationDetail;
}