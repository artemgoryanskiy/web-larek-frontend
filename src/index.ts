// Импорты
import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';

import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, ProductItem } from './components/AppData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';

import { PaymentMethod } from './components/OrderAddressForm';

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
		// Сохраняем текущие значения перед открытием формы
		const currentPayment = appData.order?.payment || '';
		const currentAddress = appData.order?.address || '';
		
		console.log('Открываем форму адреса с данными:', { payment: currentPayment, address: currentAddress });
		
		orderAddressForm.reset();
		
		// Отображаем форму без задержки
		modal.render({
			content: orderAddressForm.render({
				payment: currentPayment,
				address: currentAddress,
				valid: false,
				errors: [],
			}),
		});
	});

	events.on<IOrderAddressFormState>(AppEvents.OrderAddressSubmit, handleOrderAddressSubmit);
	events.on<IOrderContactFormState>(AppEvents.OrderContactSubmit, handleOrderContactSubmit);

	// События модального окна
	events.on(AppEvents.ModalOpen, () => (page.locked = true));
	events.on(AppEvents.ModalClose, () => {
		page.locked = false;
		
		// Сбрасываем формы, но сохраняем данные заказа
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
	
	// Проверяем существование объекта order
	if (!appData.order) {
		appData.order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
			items: basketItems.map(item => item.id),
		};
	} else {
		// Обновляем только список товаров, сохраняя остальные данные
		appData.order.items = basketItems.map(item => item.id);
	}
	
	console.log('Заказ после открытия корзины:', {...appData.order});

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
		
		console.log('Данные заказа после сохранения адреса:', {...appData.order});

		orderContactForm.reset();

		modal.render({
			content: orderContactForm.render({
				email: appData.order.email || '',
				phone: appData.order.phone || '',
				valid: false,
				errors: [],
			}),
		});
	} else {
		console.error('Форма адреса содержит некорректные данные');
	}
}

function handleOrderContactSubmit(formData: IOrderContactFormState) {
    console.log('Получены данные формы контактов:', formData);

    const validationErrors = validateContactForm(formData);
    if (validationErrors.length === 0) {
        // Сначала сохраняем данные контактов в appData
        appData.setOrderField('email', formData.email);
        appData.setOrderField('phone', formData.phone);
        
        // Получаем актуальные товары с сервера перед отправкой заказа
        api.getProductList()
            .then(freshProducts => {
                // Получаем товары из корзины
                const basketItems = appData.getBasketItems();
                
                // Проверяем наличие товаров в корзине
                if (basketItems.length === 0) {
                    console.error('Корзина пуста. Оформление заказа невозможно.');
                    return;
                }
                
                // Создаем карту актуальных цен товаров с правильной типизацией
                const productPriceMap: Record<string, number> = {};
                freshProducts.forEach(product => {
                    productPriceMap[product.id] = product.price;
                });
                
                // Фильтруем товары, исключая недоступные
                const validBasketItems = basketItems.filter(item => 
                    Object.prototype.hasOwnProperty.call(productPriceMap, item.id)
                );
                
                // Если товары были исключены, обновляем корзину
                if (validBasketItems.length < basketItems.length) {
                    console.warn('Некоторые товары больше недоступны и были исключены из заказа');
                    appData.basket = validBasketItems.map(item => item.id);
                    events.emit(AppEvents.BasketChanged);
                    
                    if (validBasketItems.length === 0) {
                        console.error('В корзине не осталось доступных товаров');
                        modal.close();
                        alert('Все товары в вашей корзине стали недоступны. Пожалуйста, выберите другие товары.');
                        return;
                    }
                }
                
                // Рассчитываем актуальную сумму заказа с актуальными ценами с сервера
                const actualTotal = validBasketItems.reduce(
                    (sum, item) => sum + productPriceMap[item.id], 
                    0
                );
                
                // Создаем финальный заказ с актуальными ценами
                const finalOrder = {
                    payment: appData.order.payment as PaymentMethod,
                    address: appData.order.address || '',
                    email: appData.order.email || '',
                    phone: appData.order.phone || '',
                    items: validBasketItems.map(item => item.id),
                    total: actualTotal // используем актуальную сумму
                };
                
                console.log('Собран финальный заказ для отправки с актуальной суммой:', finalOrder);
                
                // Проверяем полноту заказа
                if (!finalOrder.payment || !finalOrder.address || !finalOrder.email || !finalOrder.phone) {
                    console.error('Заказ все еще неполный:', finalOrder);
                    return;
                }
                
                // Если заказ полный, отправляем его напрямую в API
                console.log('Отправляем полный заказ в API:', finalOrder);
                
                api.orderProducts(finalOrder)
                    .then((result) => {
                        console.log('Успешный ответ сервера:', result);
                        
                        const success = new OrderSuccess(cloneTemplate(templates.success), {
                            onClick: () => {
                                modal.close();
                                appData.clearBasket();
                                basket.reset();
                                events.emit(AppEvents.BasketChanged);
                                events.emit(AppEvents.ItemsChanged);
                            },
                        });
                        
                        modal.render({
                            content: success.render({
                                title: 'Заказ успешно оформлен',
                                amount: `${result.total}`, // всегда используем сумму из ответа сервера
                                currency: 'синапсов',
                            }),
                        });
                    })
                    .catch((error) => {
                        console.error('Ошибка при оформлении заказа:', error);
                        
                        if (error.message && error.message.includes('не продается')) {
                            alert('К сожалению, один из товаров в корзине больше недоступен. Страница будет обновлена для получения актуальных данных.');
                            window.location.reload();
                        } else if (error.message && error.message.includes('Неверная сумма')) {
                            alert('Цена на один или несколько товаров изменилась. Пожалуйста, переоформите заказ.');
                            window.location.reload();
                        } else {
                            alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
                        }
                    });
            })
            .catch(error => {
                console.error('Ошибка при обновлении списка товаров:', error);
                alert('Не удалось проверить актуальность товаров. Пожалуйста, обновите страницу и попробуйте снова.');
            });
    } else {
        orderContactForm.showErrors(validationErrors);
    }
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