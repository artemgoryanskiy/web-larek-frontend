// Импорты стилей
import './scss/styles.scss';

// Импорты API и констант
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from "./utils/constants";

// Импорты основных компонентов
import { EventEmitter } from "./components/base/events";
import { AppState, CatalogChangeEvent, ProductItem } from "./components/AppData";
import { Page } from "./components/Page";
import { Modal } from "./components/common/Modal";

// Импорты карточек
import {
	DetailCard,
	CatalogItemCard,
	BasketCard
} from './components/Card';

// Импорты форм и связанных компонентов
import { Basket } from "./components/common/Basket";
import { OrderSuccess } from "./components/common/OrderSuccess";
import { OrderAddressForm } from './components/OrderAddressForm';
import { OrderContactForm } from './components/OrderContactForm';

// Импорты типов и утилит
import { IOrderAddressFormState, IOrderContactFormState } from './types';
import { cloneTemplate, ensureElement } from "./utils/utils";

/**
 * Инициализация основных компонентов
 */
const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Логирование для отладки (можно отключить в продакшене)
if (process.env.NODE_ENV !== 'production') {
	events.onAll(({ eventName, data }) => {
		console.log(`[Event] ${eventName}:`, data);
	});
}

/**
 * Получение DOM-элементов шаблонов
 */
const templates = {
	cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
	cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
	cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
	basket: ensureElement<HTMLTemplateElement>('#basket'),
	orderAddress: ensureElement<HTMLTemplateElement>('#order'),
	orderContact: ensureElement<HTMLTemplateElement>('#contacts'),
	success: ensureElement<HTMLTemplateElement>('#success')
};

/**
 * Инициализация состояния приложения
 */
const appData = new AppState({}, events);

/**
 * Инициализация глобальных UI-компонентов
 */
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(templates.basket), events);

/**
 * Инициализация форм
 */
const orderContactForm = new OrderContactForm(
	cloneTemplate(templates.orderContact),
	events
);
orderContactForm.init();

const orderAddressForm = new OrderAddressForm(
	cloneTemplate(templates.orderAddress),
	events
);
orderAddressForm.init();

/**
 * Обработчики событий каталога
 */
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map(item => {
		const card = new CatalogItemCard(cloneTemplate(templates.cardCatalog), {
			onClick: () => events.emit('card:select', item)
		});

		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			isInCart: appData.isInBasket(item.id)
		});
	});
});

/**
 * Обработчики событий деталей товара
 */
events.on('card:select', (item: ProductItem) => {
	modal.render({
		content: new DetailCard(cloneTemplate(templates.cardPreview), {
			onClick: () => {
				appData.addToBasket(item);
				events.emit('basket:changed'); // Разблокировали эту строку!
			}
		}).render({
			id: item.id,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			isInCart: appData.isInBasket(item.id)
		})
	});
});

/**
 * Обработчики событий корзины
 */
events.on('basket:open', () => {
	const basketItems = appData.getBasketItems();

	modal.render({
		content: basket.render({
			items: basketItems.map((item, index) => {
				return new BasketCard(cloneTemplate(templates.cardBasket), {
					onClick: () => {
						// Пустой обработчик, можно использовать при необходимости
					},
					onRemove: () => {
						appData.removeFromBasket(item.id);
						events.emit('basket:changed');
					}
				}).render({
					id: item.id,
					title: item.title,
					image: item.image,
					description: item.description,
					price: item.price,
					category: item.category,
					isInCart: true,
					index: index + 1
				});
			}),
			total: appData.getTotal()
		})
	});
});

events.on('basket:changed', () => {
	page.counter = appData.getBasketItems().length;
	if (modal.isOpen) {
		events.emit('basket:open');
	}
	events.emit('items:changed');
});

events.on('basket:click', () => {
	events.emit('basket:open');
});

events.on('basket:checkout', () => {
	if (appData.getBasketItems().length > 0) {
		events.emit('order:open');
	} else {
		// Обработка случая пустой корзины
		console.warn('Попытка оформить заказ с пустой корзиной');
		// Можно добавить отображение уведомления для пользователя
	}
});

/**
 * Обработчики событий заказа
 */
events.on('order:open', () => {
	modal.render({
		content: orderAddressForm.render({
			payment: appData.order.payment || '',
			address: appData.order.address || '',
			valid: true,
			errors: []
		})
	});
});

events.on<IOrderAddressFormState>('orderAddress:submit', (formData) => {
	// Проверяем валидность данных формы перед сохранением
	if (formData.address.trim() && formData.payment) {
		appData.setOrderField('payment', formData.payment);
		appData.setOrderField('address', formData.address);

		// Переход к форме контактов
		modal.render({
			content: orderContactForm.render({
				email: appData.order.email || '',
				phone: appData.order.phone || '',
				valid: true,
				errors: []
			})
		});
	} else {
		console.error('Форма адреса содержит некорректные данные');
		// Можно отобразить ошибку валидации
	}
});

events.on<IOrderContactFormState>('orderContact:submit', (formData) => {
	// Проверяем валидность данных формы перед сохранением
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

	const errors = [];
	if (!emailRegex.test(formData.email)) {
		errors.push('Некорректный email');
	}
	if (!phoneRegex.test(formData.phone)) {
		errors.push('Некорректный формат телефона');
	}

	if (errors.length === 0) {
		appData.setOrderField('email', formData.email);
		appData.setOrderField('phone', formData.phone);

		// ВАЖНО: проверяем, что все необходимые поля заполнены
		if (!appData.order.payment || !appData.order.address) {
			console.error('Не заполнены обязательные поля заказа:', appData.order);
			// Возвращаемся к форме адреса, если данные не были сохранены
			events.emit('order:open');
			return;
		}

		// Отправка заказа
		events.emit('order:submit');
	} else {
		// Отображение ошибок валидации
		orderContactForm.render({
			...formData,
			valid: false,
			errors
		});
	}
});

events.on('order:submit', () => {
	// Добавляем дополнительную проверку заказа перед отправкой
	if (!appData.order.payment || !appData.order.address || !appData.order.email || !appData.order.phone) {
		console.error('Попытка отправить неполный заказ:', appData.order);
		// Можно показать сообщение пользователю
		return;
	}

	// Добавляем товары из корзины в заказ, если это не делается автоматически
	const items = appData.getBasketItems().map(item => item.id);
	appData.setOrderField('items', items);

	console.log('Отправка заказа на сервер:', appData.order);

	api.orderProducts(appData.order)
		.then((result) => {
			const success = new OrderSuccess(cloneTemplate(templates.success), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					events.emit('basket:changed'); // Обновляем счетчик корзины
					events.emit('items:changed'); // Обновляем каталог
				}
			});

			modal.render({
				content: success.render({
					title: 'Заказ успешно оформлен',
					amount: result.total ?? '0',
					currency: 'синапсов'
				}),
			});
		})
		.catch(error => {
			console.error('Ошибка при оформлении заказа:', error);
			// Отображение ошибки для пользователя
			// Например, можно показать сообщение об ошибке
		});
});


/**
 * Обработчики модального окна
 */
events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

/**
 * Инициализация приложения
 */
function initApp() {
	// Загрузка товаров
	api.getProductList()
		.then(products => {
			if (Array.isArray(products) && products.length > 0) {
				appData.setCatalog(products);
			} else {
				throw new Error('Получен пустой список товаров');
			}
		})
		.catch(error => {
			console.error('Ошибка при загрузке товаров:', error);
			// Отображение ошибки загрузки для пользователя
		});
}

// Запуск приложения
initApp();