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
 * Перечисление событий, используемых в приложении
 * для организации взаимодействия между компонентами
 */
enum AppEvents {
    /** Изменение списка товаров */
    ItemsChanged = 'items:changed',
    /** Выбор карточки товара */
    CardSelect = 'card:select',
    /** Открытие корзины */
    BasketOpen = 'basket:open',
    /** Изменение состояния корзины */
    BasketChanged = 'basket:changed',
    /** Клик по корзине */
    BasketClick = 'basket:click',
    /** Переход к оформлению заказа из корзины */
    BasketCheckout = 'basket:checkout',
    /** Открытие формы заказа */
    OrderOpen = 'order:open',
    /** Отправка формы адреса доставки */
    OrderAddressSubmit = 'orderAddress:submit',
    /** Отправка формы контактных данных */
    OrderContactSubmit = 'orderContact:submit',
    /** Финальная отправка заказа */
    OrderSubmit = 'order:submit',
    /** Открытие модального окна */
    ModalOpen = 'modal:open',
    /** Закрытие модального окна */
    ModalClose = 'modal:close',
}

/**
 * Инициализация основных компонентов приложения
 */
const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

/**
 * Шаблоны компонентов интерфейса
 */
const templates = {
    /** Шаблон карточки в каталоге */
    cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
    /** Шаблон превью карточки товара */
    cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
    /** Шаблон карточки товара в корзине */
    cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
    /** Шаблон корзины */
    basket: ensureElement<HTMLTemplateElement>('#basket'),
    /** Шаблон формы адреса доставки */
    orderAddress: ensureElement<HTMLTemplateElement>('#order'),
    /** Шаблон формы контактных данных */
    orderContact: ensureElement<HTMLTemplateElement>('#contacts'),
    /** Шаблон уведомления об успешном оформлении заказа */
    success: ensureElement<HTMLTemplateElement>('#success'),
};

/**
 * Основные компоненты пользовательского интерфейса
 */
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(templates.basket), events);

/**
 * Компоненты форм для оформления заказа
 */
const orderContactForm = new OrderContactForm(cloneTemplate(templates.orderContact), events);
orderContactForm.init();
const orderAddressForm = new OrderAddressForm(cloneTemplate(templates.orderAddress), events);
orderAddressForm.init();

/**
 * Регистрирует обработчики событий для взаимодействия компонентов приложения
 */
function registerEventHandlers(): void {
    // События каталога
    events.on<CatalogChangeEvent>(AppEvents.ItemsChanged, handleItemsChanged);

    // События деталей товаров
    events.on<ProductItem>(AppEvents.CardSelect, handleCardSelect);

    // События корзины
    events.on(AppEvents.BasketOpen, handleBasketOpen);
    events.on(AppEvents.BasketChanged, handleBasketChanged);

    // События заказа
// События заказа

// События заказа
	// События заказа
	// События заказа
	events.on(AppEvents.OrderOpen, () => {
		// Сохраняем текущие значения перед открытием формы
		const currentPayment = appData.order?.payment || '';
		const currentAddress = appData.order?.address || '';

		console.log('Открываем форму адреса с данными:', { payment: currentPayment, address: currentAddress });

		orderAddressForm.reset();

		modal.render({
			content: orderAddressForm.render({
				payment: currentPayment,
				address: currentAddress,
				valid: true,
				errors: []
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

/**
 * Обрабатывает изменение списка товаров в каталоге
 */
function handleItemsChanged(): void {
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

/**
 * Обрабатывает выбор карточки товара в каталоге
 * @param {ProductItem} item - Выбранный товар
 */
function handleCardSelect(item: ProductItem): void {
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

/**
 * Обрабатывает открытие корзины
 */
function handleBasketOpen(): void {
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

/**
 * Обрабатывает изменение состояния корзины
 */
function handleBasketChanged(): void {
    page.counter = appData.getBasketItems().length;
    if (modal.isOpen) {
        events.emit(AppEvents.BasketOpen);
    }
    events.emit(AppEvents.ItemsChanged);
}

/**
 * Обрабатывает отправку формы адреса доставки
 * @param {IOrderAddressFormState} formData - Данные формы адреса
 */

function handleOrderAddressSubmit(formData: IOrderAddressFormState): void {
	if (formData.address.trim() && formData.payment) {
		appData.setOrderField('payment', formData.payment);
		appData.setOrderField('address', formData.address);

		console.log('Данные заказа после сохранения адреса:', {...appData.order});

		orderContactForm.reset();

		modal.render({
			content: orderContactForm.render({
				email: appData.order.email || '',
				phone: appData.order.phone || '',
				valid: true,
				errors: []
			}),
		});
	} else {
		console.error('Форма адреса содержит некорректные данные');
	}
}




/**
 * Валидирует данные формы контактов
 * @param {IOrderContactFormState} formData - Данные формы для проверки
 * @returns {string[]} Массив сообщений об ошибках или пустой массив, если ошибок нет
 */
function validateContactForm(formData: IOrderContactFormState): string[] {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.push('Некорректный email');
    }
    
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
        errors.push('Некорректный формат телефона');
    }

    return errors;
}

/**
 * Обрабатывает отправку формы контактных данных и оформление заказа
 * @param {IOrderContactFormState} formData - Данные формы контактов
 */
function handleOrderContactSubmit(formData: IOrderContactFormState): void {
    console.log('Получены данные формы контактов:', formData);

    const validationErrors = validateContactForm(formData);
    if (validationErrors.length === 0) {
        // Сохраняем данные контактов в appData
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

/**
 * Инициализирует приложение, загружая данные с сервера
 */
function initApp(): void {
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

// Запуск приложения
registerEventHandlers();
initApp();