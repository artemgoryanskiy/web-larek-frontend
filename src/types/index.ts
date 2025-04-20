import { FormFields } from '../components/common/Form';

/**
 * Возможные категории товаров
 * @typedef {('другое'|'софт-скил'|'хард-скил'|'кнопка'|'дополнительное')} ProductCategory
 */
export type ProductCategory =
	| 'другое'
	| 'софт-скил'
	| 'хард-скил'
	| 'кнопка'
	| 'дополнительное';

/**
 * Интерфейс, описывающий товар
 * @interface IProduct
 * @property {string} id - Уникальный идентификатор товара
 * @property {string} title - Название товара
 * @property {string} description - Описание товара
 * @property {number} price - Цена товара
 * @property {ProductCategory} category - Категория товара
 * @property {string} image - Путь к изображению товара
 * @property {number} [quantity] - Количество товара (опционально)
 */
export interface IProduct {
	id: string;
	title: string;
	description: string;
	price: number;
	category: ProductCategory;
	image: string;
	quantity?: number;
}

/**
 * Интерфейс для состояния формы с адресом заказа
 * @interface IOrderAddressFormState
 * @extends {FormFields}
 * @property {string} payment - Выбранный способ оплаты
 * @property {string} address - Адрес доставки
 */
export interface IOrderAddressFormState extends FormFields {
	/** Выбранный способ оплаты */
	payment: string;
	/** Адрес доставки */
	address: string;
}

/**
 * Интерфейс для состояния формы с контактными данными
 * @interface IOrderContactFormState
 * @extends {FormFields}
 * @property {string} email - Электронная почта пользователя
 * @property {string} phone - Телефон пользователя
 */
export interface IOrderContactFormState extends FormFields {
	email: string;
	phone: string;
}

/**
 * Интерфейс, описывающий данные заказа
 * @interface IOrder
 * @extends {IOrderAddressFormState}
 * @extends {IOrderContactFormState}
 * @property {string[]} items - Массив идентификаторов товаров в заказе
 * @property {number} [total] - Общая сумма заказа (опционально)
 * @property {unknown} [key: string] - Дополнительные поля заказа
 */
export interface IOrder extends IOrderAddressFormState, IOrderContactFormState {
	items: string[];
	total?: number;
	[key: string]: unknown;
}

/**
 * Тип, представляющий возможные ошибки формы заказа
 * @typedef {Partial<Record<keyof IOrder | 'items', string>>} FormErrors
 */
export type FormErrors = Partial<Record<keyof IOrder | 'items', string>>;

/**
 * Интерфейс, описывающий результат оформления заказа
 * @interface IOrderResult
 * @property {string} id - Уникальный идентификатор оформленного заказа
 * @property {number} total - Итоговая сумма заказа
 */
export interface IOrderResult {
	id: string;
	total: number;
}

/**
 * Интерфейс, описывающий состояние приложения
 * @interface IAppState
 * @property {IProduct[]} catalog - Каталог доступных товаров
 * @property {string[]} basket - Массив идентификаторов товаров в корзине
 * @property {string|null} preview - Идентификатор товара в режиме предпросмотра, или null если предпросмотр не активен
 * @property {IOrder|null} order - Текущий заказ, или null если заказ не создан
 * @property {boolean} loading - Флаг загрузки данных
 */
export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}