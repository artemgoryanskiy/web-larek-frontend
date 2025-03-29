import { IProduct, ProductCategory } from './products';
import { ICartData, ICartItem } from './cart';
import { IOrderFormData, PaymentMethodType } from './order';

// Базовый интерфейс для работы с DOM
export interface IElement {
	getElement(): HTMLElement | null;

	clear(): void;
}

// Базовый интерфейс представления с обобщенным типом
export interface IView<TData = unknown> {
	/** Выполняет рендеринг представления */
	render(data?: TData): HTMLElement | null;

	/** Уничтожает представление */
	destroy?(): void;

	/** Обновляет какие-либо данные в представлении */
	update?(data: Partial<TData>): void;
}

// Представление галереи товаров
export interface IGalleryView extends IView<IProduct[]> {
	/** Добавляет новый продукт в галерею */
	addProduct(product: IProduct): HTMLElement;

	/** Очищает галерею */
	clear(): void;

	/** Устанавливает список категорий для фильтрации */
	setCategories(categories: ProductCategory[]): void;

	/** Устанавливает обработчик клика на карточке товара */
	setCardClickHandler(handler: (productId: string) => void): void;
}

// Представление карточки товара
export interface IProductCardView extends IView<IProduct>, IElement {
	productId: string;
}

// Представление детальной информации о товаре
export interface IProductDetailsView extends IView<IProduct>, IElement {
	setButtonState(isInCart: boolean): void;

	productId: string;
}

// Данные для представления корзины
export type ICartViewData = Pick<ICartData, 'items' | 'totalPrice'>;

// Представление корзины
export interface ICartView extends IView<ICartViewData> {
	/** Переключает доступность кнопки "Оформить заказ" */
	toggleCheckoutButton(isEnabled: boolean): void;

	/** Показывает сообщение об ошибке корзины */
	showError(message: string): void;

	/** Очищает ошибки корзины */
	clearErrors(): void;

	/** Устанавливает обработчик для нажатия кнопки "Оформить заказ" */
	setCheckoutClickHandler(handler: () => void): void;
}

// Данные для представления элемента корзины
export interface ICartItemViewData {
	item: ICartItem;
	index: number;
}

// Представление элемента корзины
export interface ICartItemView extends IView<ICartItemViewData> {
	/** Обновить количество товаров в элементе корзины */
	updateQuantity(quantity: number): void;

	/** Удалить элемент */
	remove(): void;
}

// Представления форм заказа
export interface IOrderDeliveryView extends IView<Partial<IOrderFormData>> {
	/** Переключает выбранный способ оплаты */
	togglePaymentMethod(method: PaymentMethodType): void;

	/** Показывает ошибку адреса */
	showAddressError(error: string): void;

	/** Скрывает все ошибки формы */
	hideErrors(): void;

	/** Управляет доступностью кнопки перехода */
	toggleNextButton(isEnabled: boolean): void;

	/** Устанавливает значение адреса */
	setAddressValue(address: string): void;

	/** Получает текущее значение адреса */
	getAddressValue(): string;
}

// #### **Представление формы контактов
export interface IOrderContactsView extends IView<Partial<IOrderFormData>> {
	/** Показывает ошибку формы */
	showContactsError(error: string): void;

	/** Скрывает ошибку формы */
	hideError(): void;

	/** Управляет доступностью кнопки отправки */
	toggleSubmitButton(isEnabled: boolean): void;

	/** Получает текущее состояние */
	getCurrentFormData(): IOrderFormData;
}

// Представление кнопки корзины в хэдере
export interface IHeaderBasketView extends IElement {
	/**
	 * Обновляет счетчик количества товаров в корзине
	 * @param count - Количество товаров
	 */
	updateCounter(count: number): void;
}

// Представление модального окна
export interface IModalView extends IView<string>, IElement {
	/** Показать модальное окно */
	show(content: string): void;

	/** Скрыть модальное окно */
	hide(): void;
}

// Представление окна успешного оформления заказа
export interface IOrderConfirmationView extends IElement {
	/**
	 * Отображает сообщение успешного оформления заказа
	 * @param orderId - Идентификатор оформленного заказа
	 */
	render(orderId: string): void;

	/**
	 * Закрывает окно успешного оформления
	 */
	close(): void;
}
