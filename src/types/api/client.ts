import { ApiOrderResponse, ApiProductResponse, ApiProductsResponse } from './responses';
import { ICreateOrderRequest } from './requests';

export interface IApiClient {
	getProducts(): Promise<ApiProductsResponse>;
	getProduct(id: string): Promise<ApiProductResponse>;
	createOrder(data: ICreateOrderRequest): Promise<ApiOrderResponse>;
}
