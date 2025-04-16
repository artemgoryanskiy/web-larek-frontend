// Экспортируем все типы и интерфейсы для использования в приложении

// Базовые интерфейсы
import { ProductCategory } from './products';

export * from './base';

// API интерфейсы
export * from './api';

// Модели данных
export * from './model';
export * from './products';
export * from './cart';
export * from './order';

// Представления
export * from './view';

// Презентеры
export * from './presenter';

// События
export * from './events';

// Трансформеры
export * from './transformers';

export interface IProduct {
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

export interface IOrderResult {
	id: string;
	total: string;
}
