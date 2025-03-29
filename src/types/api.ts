/**
 * Интерфейс для базового API-клиента
 */
export interface IApiBase {
	/**
	 * Получить данные по указанному пути
	 * @param uri путь к ресурсу
	 */
	get(uri: string): Promise<object>;

	/**
	 * Отправить данные на указанный путь
	 * @param uri путь к ресурсу
	 * @param data данные для отправки
	 * @param method метод запроса
	 */
	post(uri: string, data: object, method?: ApiPostMethods): Promise<object>;
}

/**
 * Методы для отправки данных на сервер
 */
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

/**
 * Интерфейс ответа сервера со списком сущностей
 */
export interface ApiListResponse<T> {
	/** Полное количество сущностей */
	total: number;
	/** Список сущностей */
	items: T[];
}

/**
 * Интерфейс данных товара, получаемых с сервера
 */
export interface ApiProduct {
	/** Уникальный идентификатор товара */
	id: string;
	/** Название товара */
	title: string;
	/** Описание товара */
	description: string;
	/** Цена товара */
	price: number | null;
	/** Категория товара */
	category: string;
	/** Ссылка на изображение товара */
	image: string;
}

/**
 * Интерфейс элемента корзины для отправки на сервер
 */
export interface ApiCartItem {
	/** Идентификатор товара */
	productId: string;
}

/**
 * Интерфейс заказа для отправки на сервер
 */
export interface ApiOrder {
	/** Способ оплаты */
	payment: string;
	/** Адрес доставки */
	address: string;
	/** Email покупателя */
	email: string;
	/** Телефон покупателя */
	phone: string;
	/** Товары в заказе */
	items: string[];
	/** Общая стоимость заказа */
	total: number;
}

/**
 * Интерфейс ответа сервера при успешном создании заказа
 */
export interface ApiOrderResponse {
	/** Идентификатор заказа */
	orderId: string;
	/** Общая стоимость заказа */
	total: number;
}

/**
 * Интерфейс для API-клиента магазина
 */
export interface IApi extends IApiBase {
	/**
	 * Получить список всех товаров
	 */
	getProducts(): Promise<ApiListResponse<ApiProduct>>;

	/**
	 * Получить информацию о товаре по ID
	 * @param id идентификатор товара
	 */
	getProduct(id: string): Promise<ApiProduct>;

	/**
	 * Создать заказ
	 * @param order данные заказа
	 */
	createOrder(order: ApiOrder): Promise<ApiOrderResponse>;
}
