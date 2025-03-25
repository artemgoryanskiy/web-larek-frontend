import { BaseEntity } from './base';

export interface ProductDto extends BaseEntity {
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface CreateOrderDto {
	payment: "online" | "offline";
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}