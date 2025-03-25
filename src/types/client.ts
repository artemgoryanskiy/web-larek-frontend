import {
	ProductListApi,
	OrderApi,
	ApiError,
} from "./api";

export interface ApiClient {
	// Получение списка продуктов
	fetchProducts(): Promise<ProductListApi>;

	// Получение детальной информации о заказе
	fetchOrder(id: string): Promise<OrderApi>;

	// Обработка ошибок
	handleError(error: ApiError): void;
}