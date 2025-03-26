import { ProductData } from './ProductModel';

export interface OrderData {
	items: { product: ProductData; quantity: number }[];
	totalPrice: number;
	address: string;
	paymentMethod: 'online' | 'offline';
}

export class OrderModel {
	items: { product: ProductData; quantity: number }[];
	totalPrice: number;
	address: string;
	paymentMethod: 'online' | 'offline';

	constructor(data: OrderData) {
		this.items = data.items;
		this.totalPrice = data.totalPrice;
		this.address = data.address;
		this.paymentMethod = data.paymentMethod;
	}

	validate(): boolean {
		return (
			this.items.length > 0 &&
			this.totalPrice > 0 &&
			this.address.trim() !== '' &&
			['online', 'offline'].includes(this.paymentMethod)
		);
	}

	getOrderDetail(): string {
		return `
			Адрес доставки: ${this.address}
			Способ оплаты: ${this.paymentMethod}
			Товары: ${this.items
				.map(({ product, quantity }) => `${product.title} x${quantity}`)
				.join(', ')}
			Общая стоимость: ${this.totalPrice.toLocaleString('ru-Ru')} синапсов.
		`;
	}
}
