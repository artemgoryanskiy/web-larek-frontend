import './scss/styles.scss';


import { LarekAPI } from './components/LarekApli';
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import { Card, CatalogItem } from './components/Card';
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {IOrder} from "./types";
import {Order} from "./components/Order";
import {OrderSuccess} from "./components/common/OrderSuccess";

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
})

// Все шаблоны
const galleryTemplate = ensureElement<HTMLTemplateElement>('.gallery');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('.modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map(item => {
		const card = new CatalogItem(cloneTemplate(galleryTemplate), {
			onClick: () => events.emit('card:select', item)
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category
		});
	});

});

// Отправлена форма заказа
// Отправлена форма заказа
events.on('order:submit', () => {
	api.orderProducts(appData.order)
		.then((result) => {
			const success = new OrderSuccess(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					events.emit('auction:changed');
				}
			});

			modal.render({
				content:  success.render({
					title: result.title || 'Заказ завершён',
					amount: result.total ?? '0',
					currency: result.currency || '₽'
				}),

			});
		})
		.catch(err => {
			console.error(err);
		});
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	order.valid = !email && !phone;
	order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrder, value: string }) => {
	appData.setOrderField(data.field, data.value);
});

// Открыть форму заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			phone: '',
			email: '',
			valid: false,
			errors: []
		})
	});
});

events.on('card:select', (item: ProductItem) => {
	appData.setPreview(item);
});


// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем лоты с сервера
api.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch(err => {
		console.error(err);
	});


