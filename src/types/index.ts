/**
 * Возможные категории товаров
 */
export type ProductCategory =
	| 'другое'
	| 'софт-скил'
	| 'хард-скил'
	| 'кнопка'
	| 'дополнительное';

export interface IProduct {
	id: string;
	title: string;
	description: string;
	price: number;
	category: ProductCategory;
	image: string;
	quantity?: number;
}

export interface ICatalogItem {
	category: ProductCategory;
	title: string;
	image: string;
	price: number;
}


export interface IBasketItem {
	title: string;
	price: number;
}

export interface IOrderAddressFormState {
	/** Выбранный способ оплаты */
	payment: string;
	/** Адрес доставки */
	address: string;
}

export interface IOrderContactFormState {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderAddressFormState, IOrderContactFormState {
	items: string[];
	total?: number;
}

export type FormErrors = Partial<	Record<keyof IOrder | 'items', string>>;


export interface IOrderResult {
	id: string;
	total: number;
}

export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}
