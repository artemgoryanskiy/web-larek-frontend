// Импорты
import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';

import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';

import { DetailCard, CatalogItemCard, BasketCard } from './components/Card';
import { Basket } from './components/common/Basket';
import { OrderSuccess } from './components/common/OrderSuccess';
import { OrderAddressForm } from './components/OrderAddressForm';
import { OrderContactForm } from './components/OrderContactForm';

import { IOrderAddressFormState, IOrderContactFormState } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';

/**
 * Список событий в приложении
 */
enum AppEvents {
	ItemsChanged = 'items:changed',
	CardSelect = 'card:select',
	BasketOpen = 'basket:open',
	BasketChanged = 'basket:changed',
	BasketClick = 'basket:click',
	BasketCheckout = 'basket:checkout',
	OrderOpen = 'order:open',
	OrderAddressSubmit = 'orderAddress:submit',
	OrderContactSubmit = 'orderContact:submit',
	OrderSubmit = 'order:submit',
	ModalOpen = 'modal:open',
	ModalClose = 'modal:close',
}

/**
 * Инициализация
 */
const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

// Шаблоны
const templates = {
	cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
	cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
	cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
	basket: ensureElement<HTMLTemplateElement>('#basket'),
	orderAddress: ensureElement<HTMLTemplateElement>('#order'),
	orderContact: ensureElement<HTMLTemplateElement>('#contacts'),
	success: ensureElement<HTMLTemplateElement>('#success'),
};

// Глобальные UI-компоненты
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(templates.basket), events);

// Формы
const orderContactForm = new OrderContactForm(cloneTemplate(templates.orderContact), events);
orderContactForm.init()
const orderAddressForm = new OrderAddressForm(cloneTemplate(templates.orderAddress), events);
orderAddressForm.init()

// Основные обработчики событий
function registerEventHandlers() {
	// События каталога
	events.on<CatalogChangeEvent>(AppEvents.ItemsChanged, handleItemsChanged);

	// События деталей товаров
	events.on<ProductItem>(AppEvents.CardSelect, handleCardSelect);

	// События корзины
	events.on(AppEvents.BasketOpen, handleBasketOpen);
	events.on(AppEvents.BasketChanged, handleBasketChanged);

	// События заказа
	events.on(AppEvents.OrderOpen, () => {
		orderAddressForm.reset();
		modal.render({
			content: orderAddressForm.render({
				payment: '',
				address: '',
				valid: false,
				errors: [],
			}),
		});
	});

	events.on<IOrderAddressFormState>(AppEvents.OrderAddressSubmit, handleOrderAddressSubmit);
	events.on<IOrderContactFormState>(AppEvents.OrderContactSubmit, handleOrderContactSubmit);
	events.on(AppEvents.OrderSubmit, handleOrderSubmit);

	// События модального окна
	events.on(AppEvents.ModalOpen, () => (page.locked = true));
	events.on(AppEvents.ModalClose, () => {
		page.locked = false;
		orderAddressForm.reset();
		orderContactForm.reset();
	});
}

// Обработчики
function handleItemsChanged() {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItemCard(cloneTemplate(templates.cardCatalog), {
			onClick: () => events.emit(AppEvents.CardSelect, item),
		});

		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			isInCart: appData.isInBasket(item.id),
		});
	});
}

function handleCardSelect(item: ProductItem) {
	modal.render({
		content: new DetailCard(cloneTemplate(templates.cardPreview), {
			onClick: () => {
				appData.addToBasket(item);
				events.emit(AppEvents.BasketChanged);
			},
		}).render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			isInCart: appData.isInBasket(item.id),
		}),
	});
}

function handleBasketOpen() {
	const basketItems = appData.getBasketItems();
	modal.render({
		content: basket.render({
			items: basketItems.map((item, index) =>
				new BasketCard(cloneTemplate(templates.cardBasket), {
					onRemove: () => {
						appData.removeFromBasket(item.id);
						events.emit(AppEvents.BasketChanged);
					},
				}).render({
					id: item.id,
					title: item.title,
					image: item.image,
					description: item.description,
					price: item.price,
					category: item.category,
					isInCart: true,
					index: index + 1,
				})
			),
			total: appData.getTotal(),
		}),
	});
}

function handleBasketChanged() {
	page.counter = appData.getBasketItems().length;
	if (modal.isOpen) {
		events.emit(AppEvents.BasketOpen);
	}
	events.emit(AppEvents.ItemsChanged);
}

function handleOrderAddressSubmit(formData: IOrderAddressFormState) {
	if (formData.address.trim() && formData.payment) {
		appData.setOrderField('payment', formData.payment);
		appData.setOrderField('address', formData.address);

		orderContactForm.reset();

		modal.render({
			content: orderContactForm.render({
				email: '',
				phone: '',
				valid: false,
				errors: [],
			}),
		});
	} else {
		console.error('Форма адреса содержит некорректные данные');
	}
}

function handleOrderContactSubmit(formData: IOrderContactFormState) {
	const validationErrors = validateContactForm(formData);
	if (validationErrors.length === 0) {
		appData.setOrderField('email', formData.email);
		appData.setOrderField('phone', formData.phone);

		if (!appData.order.email || !appData.order.phone) {
			events.emit(AppEvents.OrderOpen);
			return;
		}

		events.emit(AppEvents.OrderSubmit);
	} else {
		orderContactForm.showErrors(validationErrors)
		}
}

function handleOrderSubmit() {
	// Проверяем обязательные поля заказа
	if (!appData.order.payment || !appData.order.address || !appData.order.email || !appData.order.phone) {
		console.error('Попытка отправить неполный заказ:', appData.order);
		return;
	}

	// Проверяем наличие товаров в корзине
	const basketItems = appData.getBasketItems();
	if (basketItems.length === 0) {
		console.error('Корзина пуста. Оформление заказа невозможно.');
		return;
	}

	// Рассчитываем сумму заказа. Если item.quantity отсутствует, то используем значение по умолчанию 1.
	const total = basketItems.reduce(
		(sum, item) => sum + item.price * (item.quantity ?? 1), // quantity по умолчанию = 1
		0
	);

	// Устанавливаем данные заказа
	appData.setOrderField('items', basketItems.map((item) => item.id)); // Отправляем ID товаров
	appData.setOrderField('total', total); // Устанавливаем общую сумму заказа

	// Лог данных перед отправкой заказа
	console.log('Отправляем данные заказа:', appData.order);

	// Отправка через API
	api.orderProducts(appData.order)
		.then((result) => {
			// Успешное оформление заказа
			console.log('Ответ сервера:', result);

			const success = new OrderSuccess(cloneTemplate(templates.success), {
				onClick: () => {
					modal.close();
					appData.clearBasket(); // Очищаем корзину после успешного заказа
					events.emit(AppEvents.BasketChanged); // Обновляем события корзины
					events.emit(AppEvents.ItemsChanged); // Обновляем каталог
				},
			});

			modal.render({
				content: success.render({
					title: 'Заказ успешно оформлен',
					amount: `${result.total || total}`, // Используем ответ сервера или локально рассчитанный total
					currency: 'синапсов',
				}),
			});
		})


	appData.setOrderField('items', appData.getBasketItems().map((item) => item.id));
	appData.setOrderField('total', total)

	api.orderProducts(appData.order)
		.then((result) => {
			const success = new OrderSuccess(cloneTemplate(templates.success), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					basket.reset()
					events.emit(AppEvents.BasketChanged);
					events.emit(AppEvents.ItemsChanged);
				},
			});

			modal.render({
				content: success.render({
					title: 'Заказ успешно оформлен',
					amount: `${result.total}` ?? '0',
					currency: 'синапсов',
				}),
			});
		})
		.catch((error) => console.error('Ошибка при оформлении заказа:', error));
}

// Валидация
function validateContactForm(formData: IOrderContactFormState): string[] {
	const errors = [];
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

	if (!emailRegex.test(formData.email)) errors.push('Некорректный email');
	if (!phoneRegex.test(formData.phone)) errors.push('Некорректный формат телефона');

	return errors;
}

// Запуск приложения
function initApp() {
	api.getProductList()
		.then((products) => {
			if (Array.isArray(products) && products.length > 0) {
				appData.setCatalog(products);
			} else {
				throw new Error('Получен пустой список товаров');
			}
		})
		.catch((error) => console.error('Ошибка при загрузке товаров:', error));
}

registerEventHandlers();
initApp();