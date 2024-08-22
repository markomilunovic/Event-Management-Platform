export type PurchaseTicketType = {
    eventId: number;
}

export type PurchaseTicketActiityType = {
    userId: number;
    action: string;
    timestamp: Date;
    metadata: object;
}