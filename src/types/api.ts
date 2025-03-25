export interface ProductApi {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
	price: number | null;
}

export interface ProductListApi {
	total: number;
	items: ProductApi[];
}

export interface OrderApi {
	id: string;
	total: number;
}

export interface ApiError {
	statusCode: number;
	message: string;
	details?: string;
}