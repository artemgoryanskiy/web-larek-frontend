import {
	ProductListApi,
	OrderApi,
	ApiError,
} from "./api";

export interface ApiClient {
		fetchProducts(): Promise<ProductListApi>;

		fetchOrder(id: string): Promise<OrderApi>;

		handleError(error: ApiError): void;
}