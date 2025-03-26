import { IModel } from './base';

export interface ICartItem {
	id: string;
	title: string;
	price: number;
	quantity: number;
	image: string;
}

export interface ICartState {
	items: ICartItem[];
	total: number;
	count: number;
}

export interface ICartModel extends IModel<ICartState> {
	addItem(item: ICartItem): void;
	removeItem(id: string): void;
	updateQuantity(id: string, quantity: number): void;
	clear(): void;
}
