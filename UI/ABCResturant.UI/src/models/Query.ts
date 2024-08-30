export enum CustomerResponseType{
    NONE,
    QUERY,
    RESPONSES
}

export interface Chat{
    id: number;
    response: string;
    customerResponseType: CustomerResponseType;
    UserId: number;
    ChatRoomId: number;
}

export interface ChatRoom{
    id: number;
    CustomerResponses: Chat[];
    createdOn: Date;
    updatedOn: Date;
}