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
 * Интерфейс для результатов валидации
 */
interface ValidationResult {
    valid: boolean;
    errors: string[];
}

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
    /** Результаты валидации контактной формы */
    OrderContactValidationResult = 'orderContact:validationResult',
    /** Результаты валидации формы адреса */
    OrderAddressValidationErrors = 'orderAddress:validationErrors',
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
    // Существующие обработчики событий...
    
    // Добавляем обработчик события сброса заказа
    events.on('order:reset', (data) => {
        // Сбрасываем формы
        orderAddressForm.reset();
        orderContactForm.reset();
    });
    
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

        // Устанавливаем текущие значения в модель, если они еще не установлены
        if (currentPayment) appData.setOrderField('payment', currentPayment);
        if (currentAddress) appData.setOrderField('address', currentAddress);

        // Валидируем данные через модель
        const isValid = appData.validateOrderAddress();
        
        // Получаем ошибки из модели для формы адреса
        const addressErrors = [
            appData.formErrors.address, 
            appData.formErrors.payment
        ].filter(Boolean) as string[];

        orderAddressForm.reset();

        modal.render({
            content: orderAddressForm.render({
                payment: currentPayment,
                address: currentAddress,
                valid: isValid,
                errors: addressErrors
            }),
        });
    });

    events.on<IOrderAddressFormState>(AppEvents.OrderAddressSubmit, handleOrderAddressSubmit);
    events.on<IOrderContactFormState>(AppEvents.OrderContactSubmit, handleOrderContactSubmit);
    
    // Подписываемся на результаты валидации от модели
    events.on<ValidationResult>(AppEvents.OrderAddressValidationErrors, (validationResult) => {
        // Отображаем ошибки в форме адреса
        if (!validationResult.valid && validationResult.errors.length > 0) {
            orderAddressForm.showErrors(validationResult.errors);
        }
    });
    
    events.on<ValidationResult>(AppEvents.OrderContactValidationResult, (validationResult) => {
        // Отображаем ошибки в форме контактов
        if (!validationResult.valid && validationResult.errors.length > 0) {
            orderContactForm.showErrors(validationResult.errors);
        }
    });

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
    try {
        // Проверяем, что каталог существует и не пуст
        if (!appData.catalog || appData.catalog.length === 0) {
            console.log('Каталог пуст или не загружен');
            page.catalog = []; // Очищаем страницу, если каталог пуст
            return;
        }
        
        // Создаем карточки товаров
        const catalogItems = appData.catalog.map((item) => {
            try {
                const card = new CatalogItemCard(cloneTemplate(templates.cardCatalog), {
                    onClick: () => events.emit(AppEvents.CardSelect, item),
                });
                
                // Безопасно проверяем, находится ли товар в корзине
                let isInCart = false;
                try {
                    isInCart = appData.isInBasket(item.id);
                } catch (e) {
                    console.error(`Ошибка при проверке товара ${item.id} в корзине:`, e);
                }
                
                return card.render({
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    isInCart: isInCart,
                });
            } catch (cardError) {
                console.error(`Ошибка при создании карточки для товара ${item.id}:`, cardError);
                return null; // Возвращаем null при ошибке, чтобы отфильтровать позже
            }
        }).filter(item => item !== null) as HTMLElement[]; // Фильтруем null-значения
        
        // Обновляем каталог на странице
        page.catalog = catalogItems;
    } catch (error) {
        console.error('Критическая ошибка при обновлении каталога:', error);
        page.catalog = []; // В случае ошибки очищаем каталог
    }
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
    // Обновляем поля в модели
    appData.setOrderField('payment', formData.payment);
    appData.setOrderField('address', formData.address);

    // Проверяем валидность формы адреса через модель
    if (appData.validateOrderAddress()) {
        // Переходим к форме контактов
        orderContactForm.reset();

        // При открытии формы контактов проверяем валидность текущих данных
        const currentEmail = appData.order.email || '';
        const currentPhone = appData.order.phone || '';
        
        // Если есть данные, проверяем их валидность
        let isContactValid = true;
        let contactErrors: string[] = [];
        
        if (currentEmail || currentPhone) {
            isContactValid = appData.validateOrderContact();
            contactErrors = [
                appData.formErrors.email,
                appData.formErrors.phone
            ].filter(Boolean) as string[];
        }

        modal.render({
            content: orderContactForm.render({
                email: currentEmail,
                phone: currentPhone,
                valid: isContactValid,
                errors: contactErrors
            }),
        });
    }
}

/**
 * Обрабатывает отправку формы контактных данных и оформление заказа
 * @param {IOrderContactFormState} formData - Данные формы контактов
 */
function handleOrderContactSubmit(formData: IOrderContactFormState): void {
    // Обновляем поля в модели
    appData.setOrderField('email', formData.email);
    appData.setOrderField('phone', formData.phone);
    
    // Проверяем валидность формы контактов через модель
    if (appData.validateOrderContact()) {
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

                // Проверяем полноту заказа через модель данных
                if (!appData.validateOrder()) {
                    console.error('Заказ не прошел валидацию:', appData.formErrors);
                    return;
                }

                // В конце обработчика успешного заказа
                api.orderProducts(finalOrder)
                    .then((result) => {
                        console.log('Успешный ответ сервера:', result);
                        
                        const success = new OrderSuccess(cloneTemplate(templates.success), {
                            onClick: () => {
                                modal.close();
                                // Очищаем корзину
                                appData.clearBasket();
                                // Сбрасываем данные заказа для следующего заказа
                                appData.resetOrder();
                                
                                basket.reset();
                                events.emit(AppEvents.BasketChanged);
                                events.emit(AppEvents.ItemsChanged);
                            },
                        });
                        
                        modal.render({
                            content: success.render({
                                title: 'Заказ успешно оформлен',
                                amount: `${result.total}`,
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
    }
}

/**
 * Инициализирует приложение, загружая данные с сервера
 */
function initApp(): void {
    // Инициализируем корзину, чтобы избежать undefined
    appData.basket = appData.basket || [];
    
    api.getProductList()
        .then((products) => {
            if (Array.isArray(products) && products.length > 0) {
                appData.setCatalog(products);
            } else {
                throw new Error('Получен пустой список товаров');
            }
        })
        .catch((error) => {
            console.error('Ошибка при загрузке товаров:', error);
            // В случае ошибки инициализируем пустой каталог
            appData.setCatalog([]);
        });
}

// Запуск приложения
registerEventHandlers();
initApp();