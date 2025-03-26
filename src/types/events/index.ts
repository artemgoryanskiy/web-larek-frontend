// types/events/index.ts
import { ICartItem } from '../models/cart';
import { IApiProduct } from '../api/responses';

export enum AppEvents {
	// Catalog Events
	ProductSelected = 'product:selected',
	ProductsLoaded = 'products:loaded',

	// Cart Events
	CartItemAdded = 'cart:item:added',
	CartItemRemoved = 'cart:item:removed',
	CartUpdated = 'cart:updated',
	CheckoutStarted = 'checkout:started',

	// Order Events
	OrderStepChanged = 'order:step:changed',
	OrderSubmitted = 'order:submitted',
	OrderCompleted = 'order:completed'
}

export interface IEventPayloadMap {
	[AppEvents.ProductSelected]: IApiProduct;
	[AppEvents.ProductsLoaded]: IApiProduct[];
	[AppEvents.CartItemAdded]: ICartItem;
	[AppEvents.CartItemRemoved]: string;
	[AppEvents.CartUpdated]: ICartItem[];
	[AppEvents.CheckoutStarted]: void;
	[AppEvents.OrderStepChanged]: {
		step: 'address' | 'payment' | 'confirmation';
	};
	[AppEvents.OrderSubmitted]: {
		orderId: string;
	};
	[AppEvents.OrderCompleted]: void;
}

export interface IEventEmitter {
	on<E extends AppEvents>(
		event: E,
		handler: (payload: IEventPayloadMap[E]) => void
	): void;

	off<E extends AppEvents>(
		event: E,
		handler: (payload: IEventPayloadMap[E]) => void
	): void;

	emit<E extends AppEvents>(
		event: E,
		payload: IEventPayloadMap[E]
	): void;
}