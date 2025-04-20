import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, IProduct } from '../types';

/**
 * Интерфейс для LarekAPI
 * @interface ILarekAPI
 */
export interface ILarekAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

/**
 * Класс для LarekAPI
 * @class LarekAPI
 * @extends Api
 * @implements ILarekAPI
 */
export class LarekAPI extends Api implements ILarekAPI {
	readonly cdn: string;

	/**
	 * Конструктор для LarekAPI
	 * @constructor
	 * @param {string} cdn - Сеть доставки контента
	 * @param {string} baseUrl - Базовый URL для API
	 * @param {RequestInit} [options] - Необязательные параметры запроса
	 */
	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	/**
	 * Получить товар по ID
	 * @param {string} id - ID товара
	 * @returns {Promise<IProduct>} - Обещание, которое разрешается товаром
	 */
	getProductItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then(
			(item: IProduct) => ({
				...item,
				image: this.cdn + item.image,
			})
		);
	}

	/**
	 * Получить список товаров
	 * @returns {Promise<IProduct[]>} - Обещание, которое разрешается массивом товаров
	 */
	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image
			}))
		);
	}

	/**
	 * Заказать товары
	 * @param {IOrder} order - Детали заказа
	 * @returns {Promise<IOrderResult>} - Обещание, которое разрешается результатом заказа
	 */
	orderProducts(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then(
			(data: IOrderResult) => data
		);
	}
}

