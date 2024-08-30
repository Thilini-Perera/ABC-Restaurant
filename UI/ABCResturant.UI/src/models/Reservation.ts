export enum ReservationType {
  NONE,
  DINEIN,
  DELIVERY
}


export interface Reservation{
  id: number;
  name: string;
  reservationOn : Date;
  numberOfPeople :number;
  ReservationType: ReservationType;
  CreatedOn: Date;
  restuarantId : number;
  userId : number;

}
