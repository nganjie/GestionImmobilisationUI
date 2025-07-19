import { User } from "../../models/user.model";

export interface BuyerDetail {
  first_name: string;//use to create buyer
  last_name: string;//use to create buyer
  cni: string;//use to create buyer
  tel: string;//use to create buyer
  user_id: string;
  id: string;
  user:User;
  updated_at: string;
  created_at: string;
}