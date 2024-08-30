export enum CustomerResponseType{
  NONE,
  QUERY,
  RESPONSES
}

export interface CustomerResponse{
  id: number;
  response: string;
  customerResponseType: CustomerResponseType;
  createdOn: Date;
}
