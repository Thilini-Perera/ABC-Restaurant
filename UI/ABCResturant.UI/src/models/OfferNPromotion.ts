export interface OfferNPromotion{
  id: number;
  message: string;
  code: string;
  discount: number;
  createdOn: Date;
  offerUntil: Date;
}
