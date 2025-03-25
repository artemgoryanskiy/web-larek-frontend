export enum EventTypes {
	ORDER_CREATED = "ORDER_CREATED",
	ORDER_FAILED = "ORDER_FAILED",
}

export interface OrderCreatedPayload {
	orderId: string;
	total: number;
}

export interface OrderFailedPayload {
	errorMessage: string;
}

export interface OrderCreatedEvent {
	type: EventTypes.ORDER_CREATED;
	payload: OrderCreatedPayload;
}

export interface OrderFailedEvent {
	type: EventTypes.ORDER_FAILED;
	payload: OrderFailedPayload;
}

export type AppEvent = OrderCreatedEvent | OrderFailedEvent;