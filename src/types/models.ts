import { BaseEntity } from "./base";
import { ProductApi, ProductListApi } from './api';

export interface ProductModel extends BaseEntity {
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;
}

export interface ProductListModel {
	total: number;
	items: ProductModel[];
}

export interface OrderModel extends BaseEntity {
	total: number;
}

export const transformProductApiToModel = (api: ProductApi): ProductModel => ({
	id: api.id,
	title: api.title,
	description: api.description,
	category: api.category,
	image: api.image,
	price: api.price,
});

export const transformProductListApiToModel = (
	apiResponse: ProductListApi
): ProductListModel => ({
	total: apiResponse.total,
	items: apiResponse.items.map(transformProductApiToModel),
});