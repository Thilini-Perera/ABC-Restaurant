import { Gallery } from "./gallery";

export interface Restuarant{
  id?: number;
  name: string;
  telephone: number;
  currentRate: number;
  maxReservations: number;
  currentReservations: number;
  location: string;
  createdOn: Date;
  galleries:string[];
}
