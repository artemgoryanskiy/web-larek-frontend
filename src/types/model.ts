import { IProduct } from './products';
import { ICartItem, ICartData } from './cart';
import { IOrderFormData } from './order';

/**
 * Интерфейс модели каталога товаров
 */
export interface ICatalogModel {
	/** Список товаров */
	products: IProduct[];
	/** Выбранный товар для детального просмотра */
	selectedProduct: IProduct | null;

	/**
	 * Загрузить список товаров с сервера
	 */
	loadProducts(): Promise<void>;

	/**
	 * Выбрать товар для детального просмотра
	 * @param id идентификатор товара
	 */
	selectProduct(id: string): void;

	/**
	 * Обновить статус товара в корзине
	 * @param id идентификатор товара
	 * @param isInCart статус товара в корзине
	 */
	updateProductInCartStatus(id: string, isInCart: boolean): void;
}

/**
 * Интерфейс модели корзины
 */
export interface ICartModel {
	/** Данные корзины */
	cartData: ICartData;

	/**
	 * Добавить товар в корзину
	 * @param product товар для добавления
	 */
	addToCart(product: IProduct): void;

	/**
	 * Удалить товар из корзины
	 * @param id идентификатор товара
	 */
	removeFromCart(id: string): void;

	/**
	 * Очистить корзину
	 */
	clearCart(): void;
}

/**
 * Интерфейс модели заказа
 */
export interface IOrderModel {
	/** Данные формы заказа */
	formData: IOrderFormData;

	/**
	 * Установить способ оплаты
	 * @param method способ оплаты
	 */
	setPaymentMethod(method: string): void;

	/**
	 * Установить адрес доставки
	 * @param address адрес доставки
	 */
	setAddress(address: string): void;

	/**
	 * Установить email покупателя
	 * @param email email покупателя
	 */
	setEmail(email: string): void;

	/**
	 * Установить телефон покупателя
	 * @param phone телефон покупателя
	 */
	setPhone(phone: string): void;

	/**
	 * Проверить валидность формы
	 */
	validateForm(): boolean;

	/**
	 * Отправить заказ на сервер
	 * @param cartItems товары в корзине
	 */
	submitOrder(cartItems: ICartItem[]): Promise<string>;
}

/**
 * Интерфейс модели приложения
 */
export interface IAppModel {
	catalog: ICatalogModel;
	cart: ICartModel;
	order: IOrderModel;
}