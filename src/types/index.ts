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
}

export type ICatalogItem = Pick<IProduct, 'category' | 'title' | 'image' | 'price'>;

export type IBasketItem = Pick<IProduct, 'title' | 'price'>;

export interface IOrderAddressFormState {
	/** Выбранный способ оплаты */
	paymentMethod: string;
	/** Адрес доставки */
	address: string;
	/** Состояние кнопки отправки формы */
	buttonDisabled: boolean;
}

export interface IOrderContactFormState {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderAddressFormState, IOrderContactFormState {
	items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;


export interface IOrderResult {
	id: string;
	total: string;
}

export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}
