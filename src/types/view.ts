// src/types/view.ts
import { IProduct } from './products';
import { ICartItem, ICartData } from './cart';
import { IOrderFormData } from './order';
import { PaymentMethodType } from './order';

// Базовый интерфейс для работы с DOM
export interface IElement {
	getElement(): HTMLElement | null;

	clear(): void;
}

// Базовый интерфейс представления с обобщенным типом
export interface IView<T = unknown> {
	render(data?: T): HTMLElement | null;

	destroy?(): void;
}

// Представление галереи товаров
export interface IGalleryView extends IView<IProduct[]>, IElement {
	addProduct(product: IProduct): HTMLElement;
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
export interface ICartView extends IView<ICartViewData>, IElement {
	updateCounter(count: number): void;

	toggleCheckoutButton(isEnabled: boolean): void;
}

// Данные для представления элемента корзины
export interface ICartItemViewData {
	item: ICartItem;
	index: number;
}

// Представление элемента корзины
export interface ICartItemView extends IView<ICartItemViewData>, IElement {
	itemId: string;
}

// Представления форм заказа
export interface IOrderDeliveryView
	extends IView<Partial<IOrderFormData>>,
		IElement {
	togglePaymentMethod(method: PaymentMethodType): void;

	showAddressError(error: string): void;

	hideErrors(): void;

	toggleNextButton(isEnabled: boolean): void;
}

export interface IOrderContactsView
	extends IView<Partial<IOrderFormData>>,
		IElement {
	showContactsError(field: string, error: string): void;

	hideErrors(): void;

	toggleSubmitButton(isEnabled: boolean): void;
}
