import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { User } from "../../models/user.model";

export interface SaleDetail {
  buyer_id: string;
  amount: string;
  comment: string;
  immobilisation_id: string;
  documents: string[];
  user_id: string;
  id: string;
  immobilisation:ImmobilisationDetail;
  user:User;
  updated_at: string;
  created_at: string;
}