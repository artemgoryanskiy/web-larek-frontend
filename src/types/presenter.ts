import { IPresenter } from './base';
import { ICatalogModel, ICartModel, IOrderModel } from './model';
import { IGalleryView, IProductDetailsView, ICartView, IOrderDeliveryView, IOrderContactsView } from './view';
import { IEvents } from './events';

/**
 * Презентер каталога товаров
 */
export interface ICatalogPresenter extends IPresenter {
	/**
	 * Модель каталога товаров
	 */
	model: ICatalogModel;

	/**
	 * Представление галереи товаров
	 */
	view: IGalleryView;

	/**
	 * Представление детальной информации о товаре
	 */
	detailsView: IProductDetailsView;

	/**
	 * Брокер событий
	 */
	eventBus: IEvents;
}

/**
 * Презентер корзины
 */
export interface ICartPresenter extends IPresenter {
	/**
	 * Модель корзины
	 */
	model: ICartModel;

	/**
	 * Представление корзины
	 */
	view: ICartView;

	/**
	 * Брокер событий
	 */
	eventBus: IEvents;
}

/**
 * Презентер заказа
 */
export interface IOrderPresenter extends IPresenter {
	/**
	 * Модель заказа
	 */
	model: IOrderModel;

	/**
	 * Представление формы доставки
	 */
	deliveryView: IOrderDeliveryView;

	/**
	 * Представление формы контактов
	 */
	contactsView: IOrderContactsView;

	/**
	 * Модель корзины
	 */
	cartModel: ICartModel;

	/**
	 * Брокер событий
	 */
	eventBus: IEvents;
}

/**
 * Презентер приложения
 */
export interface IAppPresenter extends IPresenter {
	/**
	 * Презентер каталога товаров
	 */
	catalogPresenter: ICatalogPresenter;

	/**
	 * Презентер корзины
	 */
	cartPresenter: ICartPresenter;

	/**
	 * Презентер заказа
	 */
	orderPresenter: IOrderPresenter;

	/**
	 * Брокер событий
	 */
	eventBus: IEvents;
}