export interface IApiProduct {
	id: string;
	title: string;
	price: number;
	description: string;
	category: string;
	image: string;
	count: number;
}

export interface IApiOrder {
	id: string;
	items: Array<{
		productId: string;
		quantity: number;
	}>;
	total: number;
	address: string;
	payment: 'card' | 'cash';
	status: 'new' | 'processing' | 'done';
}

export interface IApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

export type ApiProductResponse = IApiResponse<IApiProduct>;
export type ApiProductsResponse = IApiResponse<IApiProduct[]>;
export type ApiOrderResponse = IApiResponse<IApiOrder>;
