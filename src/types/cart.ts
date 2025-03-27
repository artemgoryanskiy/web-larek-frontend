import { IProduct } from './products';

export interface ICartItem {
	product: IProduct;
	quantity: number;
	price: number;
}

/**
 * Интерфейс данных корзины
 */
export interface ICartData {
	/** Элементы в корзине */
	items: ICartItem[];
	/** Общая стоимость товаров в корзине */
	totalPrice: number;
	/** Общее количество товаров в корзине */
	totalCount: number;
}
