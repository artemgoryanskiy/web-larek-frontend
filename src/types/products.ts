/**
 * Возможные категории товаров
 */
export type ProductCategory = 'другое' | 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное';

/**
 * Интерфейс данных товара, получаемых с сервера
 */
export interface IProductData {
	/** Уникальный идентификатор товара */
	id: string;
	/** Название товара */
	title: string;
	/** Описание товара */
	description: string;
	/** Цена товара */
	price: number;
	/** Категория товара */
	category: ProductCategory;
	/** Ссылка на изображение товара */
	image: string;
}

/**
 * Расширенный интерфейс товара для использования в приложении
 */
export interface IProduct extends IProductData {
	/** Флаг, показывающий находится ли товар в корзине */
	isInCart: boolean;
}