/**
 * Доступные способы оплаты
 */
export type PaymentMethodType = 'online' | 'cash';

/**
 * Интерфейс данных формы заказа
 */
export interface IOrderFormData {
	/** Адрес доставки */
	address: string;
	/** Email покупателя */
	email: string;
	/** Телефон покупателя */
	phone: string;
	/** Выбранный способ оплаты */
	payment: PaymentMethodType;
	/** Статусы валидации полей */
	valid: {
		address: boolean;
		email: boolean;
		phone: boolean;
	};
}

/**
 * Интерфейс данных заказа для отправки на сервер
 */
export interface IOrderData extends IOrderFormData {
	/** Идентификаторы товаров в заказе */
	items: string[];
	/** Общая стоимость заказа */
	total: number;
}
