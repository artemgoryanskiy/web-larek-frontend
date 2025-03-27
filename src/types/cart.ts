import { ProductCategory } from './products';

export interface ICartItem {
	product: {
		id: string;
		title: string;
		description: string;
		price: number;
		category: ProductCategory;
		image: string;
		isInCart: boolean;
	};
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