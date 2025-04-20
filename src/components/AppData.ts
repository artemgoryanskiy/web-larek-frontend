import { FormErrors, IAppState, IOrder, IProduct, ProductCategory } from '../types';
import { Model } from './base/Model';

/**
 * @typedef {Object} CatalogChangeEvent
 * @description Событие изменения каталога товаров
 * @property {IProduct[]} catalog - Обновленный список товаров каталога
 */
export type CatalogChangeEvent = {
	catalog: IProduct[];
};

/**
 * @class ProductItem
 * @extends Model<IProduct>
 * @description Модель представления товара с расширенной функциональностью
 */
export class ProductItem extends Model<IProduct> {
	/** Уникальный идентификатор товара */
	id: string;
	
	/** Название товара */
	title: string;
	
	/** Описание товара */
	description: string;
	
	/** Цена товара */
	price: number;
	
	/** Категория товара */
	category: ProductCategory;
	
	/** URL изображения товара */
	image: string;
}

/**
 * @class AppState
 * @extends Model<IAppState>
 * @description Главная модель состояния приложения, управляющая каталогом,
 * корзиной и процессом оформления заказа
 */
export class AppState extends Model<IAppState> {
	/** Идентификаторы товаров в корзине */
	basket: string[];
	
	/** Каталог доступных товаров */
	catalog: IProduct[];
	
	/** Информация о текущем заказе */
	order: IOrder = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		items: []
	};

	/** Ошибки валидации формы заказа */
	formErrors: FormErrors = {};

	/**
	 * Удаляет элемент из массива
	 * 
	 * @param {string[]} items - Исходный массив идентификаторов
	 * @param {string} id - Идентификатор для удаления
	 * @returns {string[]} Новый массив без указанного элемента
	 * @private
	 */
	private removeItem(items: string[], id: string): string[] {
		return items.filter(item => item !== id);
	}

	/**
	 * Добавляет товар в корзину
	 * 
	 * @param {ProductItem} item - Товар для добавления в корзину
	 */
	addToBasket(item: ProductItem): void {
		this.order.items.push(item.id);
		this.emitChanges('basket:changed', { basket: this.order.items });
	}

	/**
	 * Удаляет товар из корзины
	 * 
	 * @param {string} id - Идентификатор товара для удаления
	 */
	removeFromBasket(id: string): void {
		this.order.items = this.removeItem(this.order.items, id);
		this.emitChanges('basket:changed', { basket: this.order.items });
	}

	/**
	 * Получает список товаров в корзине
	 * 
	 * @returns {ProductItem[]} Массив товаров в корзине
	 */
	getBasketItems(): ProductItem[] {
		return this.order.items
			.map(id => this.catalog.find(item => item.id === id))
			.filter(Boolean) as ProductItem[];
	}

	/**
	 * Очищает корзину
	 */
	clearBasket(): void {
		this.order.items = [];
	}

	/**
	 * Проверяет, находится ли товар в корзине
	 * 
	 * @param {string} itemId - Идентификатор товара для проверки
	 * @returns {boolean} true, если товар в корзине
	 */
	isInBasket(itemId: string): boolean {
		return this.order.items.includes(itemId);
	}

	/**
	 * Вычисляет общую сумму товаров в корзине
	 * 
	 * @returns {number} Общая стоимость товаров в корзине
	 */
	getTotal(): number {
		return this.order.items.reduce((total, itemId) => {
			const item = this.catalog.find(it => it.id === itemId);
			return item ? total + item.price : total;
		}, 0);
	}

	/**
	 * Устанавливает каталог товаров
	 * 
	 * @param {IProduct[]} items - Массив товаров для каталога
	 */
	setCatalog(items: IProduct[]): void {
		this.catalog = items.map(item => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	/**
	 * Валидирует обязательное поле и добавляет ошибку, если поле пустое
	 * 
	 * @param {keyof IOrder} field - Ключ поля для валидации
	 * @param {string} errorMessage - Сообщение об ошибке
	 * @private
	 */
	private validateRequiredField(field: keyof IOrder, errorMessage: string): void {
		if (!this.order[field]) {
			this.formErrors[field] = errorMessage;
		}
	}

	/**
	 * Валидирует поля заказа
	 * 
	 * @returns {boolean} true, если заказ валиден (нет ошибок)
	 */
	validateOrder(): boolean {
		this.formErrors = {}; // Сброс ошибок перед валидацией
		
		this.validateRequiredField('email', 'Необходимо указать email');
		this.validateRequiredField('phone', 'Необходимо указать телефон');
		
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(this.formErrors).length === 0;
	}

	/**
	 * Отправляет событие готовности заказа, если он валиден
	 * 
	 * @private
	 */
	private emitOrderReadyIfValid(): void {
		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	/**
	 * Устанавливает значение поля заказа и проверяет готовность заказа
	 * 
	 * @param {K} field - Ключ поля заказа
	 * @param {IOrder[K]} value - Значение для установки
	 * @template K - Тип ключа заказа
	 */
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void {
		this.order[field] = value;
		this.emitOrderReadyIfValid();
	}
}