import { ApiProduct, ApiCartItem, ApiOrder } from './api';
import {IProduct, ProductCategory} from './products';
import {ICartItem, ICartData} from './cart';
import {IOrderFormData} from './order';

export class ProductTransformer {
	/**
	 * Из API в модель приложения
	 */
	static fromApi(apiProduct: ApiProduct): IProduct {
		return {
			id: apiProduct.id,
			title: apiProduct.title,
			description: apiProduct.description,
			price: apiProduct.price,
			category: apiProduct.category as ProductCategory,
			image: apiProduct.image,
			isInCart: false // По умолчанию товар не в корзине
		};
	}

	/**
	 * Из модели обратно в API формат
	 */
	static toApi(product: IProduct): Omit<ApiProduct, 'id'> {
		return {
			title: product.title,
			description: product.description,
			price: product.price,
			category: product.category,
			image: product.image
		};
	}
}

export class CartTransformer {
	/**
	 * Преобразует элемент корзины из API в модель приложения
	 */
	static itemFromApi(apiCartItem: ApiCartItem, productMap: Map<string, IProduct>): ICartItem | null {
		const product = productMap.get(apiCartItem.productId);

		if (!product) {
			console.error(`Product with id ${apiCartItem.productId} not found`);
			return null;
		}

		return {
			product: { ...product, isInCart: true },
			quantity: apiCartItem.quantity,
			price: product.price * apiCartItem.quantity
		};
	}

	/**
	 * Преобразует элемент корзины из модели приложения в формат API
	 */
	static itemToApi(cartItem: ICartItem): ApiCartItem {
		return {
			productId: cartItem.product.id,
			quantity: cartItem.quantity
		};
	}

	/**
	 * Создает объект данных корзины на основе элементов корзины
	 */
	static createCartData(items: ICartItem[]): ICartData {
		return {
			items,
			totalPrice: items.reduce((sum, item) => sum + item.price, 0),
			totalCount: items.reduce((count, item) => count + item.quantity, 0)
		};
	}

	/**
	 * Обновляет статус наличия товаров в корзине
	 */
	static updateProductsInCartStatus(products: IProduct[], cartItems: ICartItem[]): IProduct[] {
		const inCartIds = new Set(cartItems.map(item => item.product.id));

		return products.map(product => ({
			...product,
			isInCart: inCartIds.has(product.id)
		}));
	}
}

export class OrderTransformer {
	/**
	 * Преобразует данные формы заказа в формат API для отправки на сервер
	 */
	static toApi(orderData: IOrderFormData, cartItems: ICartItem[]): ApiOrder {
		return {
			payment: orderData.payment,
			address: orderData.address,
			email: orderData.email,
			phone: orderData.phone,
			items: cartItems.map(CartTransformer.itemToApi),
			total: cartItems.reduce((sum, item) => sum + item.price, 0)
		};
	}

	/**
	 * Создает первоначальный объект данных формы заказа
	 */
	static createEmptyFormData(): IOrderFormData {
		return {
			payment: 'online', // или 'cash', в зависимости от требований
			address: '',
			email: '',
			phone: '',
			valid: {
				address: false,
				email: false,
				phone: false
			}
		};
	}

	/**
	 * Объединяет частичные данные формы с существующими данными
	 */
	static mergeFormData(existingData: IOrderFormData, newData: Partial<IOrderFormData>): IOrderFormData {
		return {
			...existingData,
			...newData,
			valid: {
				...existingData.valid,
				...(newData.valid || {})
			}
		};
	}

	/**
	 * Проверяет валидность всей формы заказа
	 */
	static isFormValid(formData: IOrderFormData): boolean {
		return Object.values(formData.valid).every(isValid => isValid);
	}

	/**
	 * Преобразует данные формы в формат для отображения в UI
	 */
	static formatDataForDisplay(formData: IOrderFormData): Record<string, string> {
		return {
			address: formData.address,
			email: formData.email,
			phone: formData.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')
		};
	}
}