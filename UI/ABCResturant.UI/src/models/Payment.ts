import { User } from "./user";

export interface Payment{
  id: number;
  total: number;
  user: User;
  userId: number;
  restuarantId: number;
  CreatedOn: Date;
  UpdatedOn: Date;
}
