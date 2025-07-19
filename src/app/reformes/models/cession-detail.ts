import { EntrepriseDetail } from "./entreprise-detail.model";
import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { User } from "../../models/user.model";

export interface CessionDetail {
  entreprise_id: string;
  comment: string;
  immobilisation_id: string;
  documents: string[];
  user_id: string;
  id: string;
  entreprise: EntrepriseDetail;
  immobilisation: ImmobilisationDetail;
  user: User;
  updated_at: string;
  created_at: string;
}