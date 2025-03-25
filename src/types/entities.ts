import { BaseEntity } from './base';

export interface ProductDto extends BaseEntity {
	description: string; // Описание продукта
	image: string;       // Ссылка на изображение продукта
	title: string;       // Название продукта
	category: string;    // Категория продукта
	price: number | null; // Цена (может быть null, если не указана)
}

// DTO для создания заказа
export interface CreateOrderDto {
	payment: "online" | "offline"; // Тип оплаты (онлайн или офлайн)
	email: string;                 // Электронный адрес покупателя
	phone: string;                 // Номер телефона покупателя
	address: string;               // Адрес доставки
	total: number;                 // Общая сумма заказа
	items: string[];               // Список ID продуктов
}