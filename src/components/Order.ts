import { IEvents, IOrder, IOrderAddressFormState, IOrderContactFormState } from '../types';

/**
 * Класс для управления данными заказа
 */
export class Order implements IOrder {
	/** Массив идентификаторов продуктов в заказе */
	items: string[] = [];

	/** Адрес доставки */
	address = '';

	/** Способ оплаты */
	paymentMethod = '';

	/** Email пользователя */
	email = '';

	/** Телефон пользователя */
	phone = '';

	/** Состояние кнопки формы */
	buttonDisabled = true;

	constructor(private events: IEvents) {
		// Подписываемся на события изменения данных формы
		this.events.on('orderAddress:submit', this.setAddress.bind(this));
		this.events.on('orderContact:submit', this.setContact.bind(this));
	}

	/**
	 * Добавляет продукт в заказ
	 * @param id Идентификатор продукта
	 */
	addItem(id: string): void {
		if (!this.hasItem(id)) {
			this.items.push(id);
			this.events.emit('order:items:changed', { items: this.items });
		}
	}

	/**
	 * Удаляет продукт из заказа
	 * @param id Идентификатор продукта
	 */
	removeItem(id: string): void {
		this.items = this.items.filter(item => item !== id);
		this.events.emit('order:items:changed', { items: this.items });
	}

	/**
	 * Проверяет, есть ли продукт в заказе
	 * @param id Идентификатор продукта
	 */
	hasItem(id: string): boolean {
		return this.items.includes(id);
	}

	/**
	 * Очищает список товаров в заказе
	 */
	clear(): void {
		this.items = [];
		this.events.emit('order:items:changed', { items: this.items });
	}

	/**
	 * Устанавливает контактную информацию
	 * @param contactData Данные контактной формы
	 */
	setContact(contactData: IOrderContactFormState): void {
		this.email = contactData.email;
		this.phone = contactData.phone;
		this.events.emit('order:contact:changed', { email: this.email, phone: this.phone });
	}

	/**
	 * Устанавливает адрес и способ оплаты
	 * @param addressData Данные формы адреса
	 */
	setAddress(addressData: IOrderAddressFormState): void {
		this.address = addressData.address;
		this.paymentMethod = addressData.paymentMethod;
		this.events.emit('order:address:changed', {
			address: this.address,
			paymentMethod: this.paymentMethod
		});
	}

	/**
	 * Проверяет готовность заказа к оформлению
	 */
	isValid(): boolean {
		return (
			this.items.length > 0 &&
			this.paymentMethod !== '' &&
			this.address !== '' &&
			this.email !== '' &&
			this.phone !== ''
		);
	}

	/**
	 * Возвращает количество товаров в заказе
	 */
	get count(): number {
		return this.items.length;
	}

	/**
	 * Преобразует данные заказа в формат для отправки на сервер
	 */
	toJSON(): IOrder {
		return {
			items: this.items,
			address: this.address,
			paymentMethod: this.paymentMethod,
			email: this.email,
			phone: this.phone,
			buttonDisabled: this.buttonDisabled
		};
	}
}