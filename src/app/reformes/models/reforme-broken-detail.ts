import { ImmobilisationDetail } from "../../immobilisations/models/immobilisation-detail.model";
import { User } from "../../models/user.model";

export interface ReformeBrokenDetail {
  comment: string;//use to create reform broken
  immobilisation_id: string;//use to create reform broken
  documents: string[];//use to create reform broken, is an array of file (words, pdf, images)
  user_id: string;
  id: string;
  updated_at: string;
  created_at: string;
  immobilisation: ImmobilisationDetail;
  user: User;
}