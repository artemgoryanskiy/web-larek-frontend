import { FormErrors, IAppState, IOrder, IProduct, ProductCategory } from '../types';
import { Model } from './base/Model';

export type CatalogChangeEvent = {
	catalog: IProduct[];
};

export class ProductItem extends Model<IProduct> {
	id: string;
	title: string;
	description: string;
	price: number;
	category: ProductCategory;
	image: string;
}

export class AppState extends Model<IAppState> {
	basket: string[];
	catalog: IProduct[];
	loading: boolean;
	order: IOrder = {
		payment: '',
		address: '',
		buttonDisabled: true,
		email: '',
		phone: '',
		items: []
	};

	preview: string | null = null;
	formErrors: FormErrors = {};

	// Добавление уникального элемента в массив
	private addUniqueItem(items: string[], id: string): string[] {
		return items.includes(id) ? items : [...items, id];
	}

	// Удаление элемента из массива
	private removeItem(items: string[], id: string): string[] {
		return items.filter(item => item !== id);
	}

	// Переключение статуса заказа
	toggleOrderedProduct(id: string, isIncluded: boolean) {
		this.order.items = isIncluded
			? this.addUniqueItem(this.order.items, id)
			: this.removeItem(this.order.items, id);
	}

	// Добавление товара в корзину
	addToBasket(item: ProductItem): void {
		this.order.items.push(item.id);
		this.emitChanges('basket:changed', { basket: this.order.items });
	}


	removeFromBasket(id: string) {
		this.order.items = this.removeItem(this.order.items, id);
		this.emitChanges('basket:changed', { basket: this.order.items });
	}

	getBasketItems(): ProductItem[] {
		return this.order.items
			.map(id => this.catalog.find(item => item.id === id))
			.filter(item => item !== undefined) as ProductItem[];
	}

	// Очистка корзины
	clearBasket() {
		this.order.items = [];
	}

	isInBasket(itemId: string): boolean {
		return Boolean(this.order.items.find(id => id === itemId));
	}




	// Общая сумма заказанных товаров
	getTotal() {
		return this.order.items.reduce((total, itemId) => {
			const item = this.catalog.find(it => it.id === itemId);
			return item ? total + item.price : total;
		}, 0);
	}

	// Установка каталога
	setCatalog(items: IProduct[]) {
		this.catalog = items.map(item => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	// Установка превью
	setPreview(item: ProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	// Валидация заказа (вынос основной логики для переиспользования)
	private validateRequiredField(field: keyof IOrder, errorMessage: string): void {
		if (!this.order[field]) {
			this.formErrors[field] = errorMessage;
		}
	}

	validateOrder(): boolean {
		this.formErrors = {}; // Сброс ошибок перед валидацией
		this.validateRequiredField('email', 'Необходимо указать email');
		this.validateRequiredField('phone', 'Необходимо указать телефон');
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(this.formErrors).length === 0;
	}

	// Если заказ валиден, уведомить об этом
	private emitOrderReadyIfValid() {
		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	// Установка данных для заказа
	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]) {
		this.order[field] = value;
		this.emitOrderReadyIfValid();
	}
}