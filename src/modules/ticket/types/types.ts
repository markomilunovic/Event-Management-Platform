export type PurchaseTicketType = {
    eventId: number;
}

export type PurchaseTicketActivityType = {
    userId: number;
    action: string;
    timestamp: Date;
    metadata: object;
}