export type UpdateEventType = {
    title?: string;
    description?: string;
    location?: string;
    category?: string;
    date?: Date;
    time?: string;
}

export type CheckInActivityType = {
    userId: number;
    action: string; 
    timestamp: Date;
    metadata: object;
}