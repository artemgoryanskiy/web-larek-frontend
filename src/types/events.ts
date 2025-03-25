// События для системы
export enum EventTypes {
	ORDER_CREATED = "ORDER_CREATED",
	ORDER_FAILED = "ORDER_FAILED",
}

// Пейлоады для событий
export interface OrderCreatedPayload {
	orderId: string;
	total: number;
}

export interface OrderFailedPayload {
	errorMessage: string;
}

// Интерфейсы событий
export interface OrderCreatedEvent {
	type: EventTypes.ORDER_CREATED;
	payload: OrderCreatedPayload;
}

export interface OrderFailedEvent {
	type: EventTypes.ORDER_FAILED;
	payload: OrderFailedPayload;
}

// Общий тип событий
export type AppEvent = OrderCreatedEvent | OrderFailedEvent;