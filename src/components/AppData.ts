import { Model } from './base/Model';
import { IEvents } from './base/events';

/**
 * Тип, описывающий элемент каталога товаров.
 */
export type ProductItem = {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    category: string;
};

/**
 * Тип, описывающий заказ товара.
 */
export type OrderData = {
    payment: string;
    address: string;
    email: string;
    phone: string;
    items: string[];
    total?: number;
};

/**
 * Тип, возвращаемый методом setCatalog.
 */
export type CatalogChangeEvent = {
    catalog: ProductItem[];
};

/**
 * Класс, представляющий состояние приложения.
 * Управляет каталогом товаров, корзиной и заказом.
 */
export class AppState extends Model<{
    catalog: ProductItem[];
    basket: string[];
    order: Partial<OrderData>;
    formErrors: Record<string, string>;
}> {
    // Прямые свойства класса вместо методов get/set
    catalog: ProductItem[] = [];
    basket: string[] = [];
    order: Partial<OrderData> = {
        payment: '',
        address: '',
        email: '',
        phone: '',
        items: []
    };
    formErrors: Record<string, string> = {};

    constructor(data: Partial<{
        catalog: ProductItem[];
        basket: string[];
        order: Partial<OrderData>;
        formErrors: Record<string, string>;
    }>, events: IEvents) {
        // Инициализируем дефолтные значения
        const defaults: {
            catalog: ProductItem[];
            basket: string[];
            order: Partial<OrderData>;
            formErrors: Record<string, string>;
        } = {
            catalog: [],
            basket: [],
            order: {
                payment: '',
                address: '',
                email: '',
                phone: '',
                items: [] as string[] // явно указываем тип
            },
            formErrors: {}
        };
        
        // Вызываем родительский конструктор с merged данными
        super(Object.assign({}, defaults, data), events);
        
        // Убедимся, что свойства заполнены значениями
        this.catalog = this.catalog || [];
        this.basket = this.basket || [];
        this.order = this.order || defaults.order;
        this.formErrors = this.formErrors || {};
        
        // Подписываемся на события изменения полей заказа
        this.events.on('orderAddress.payment:change', this.handleOrderFieldChange.bind(this));
        this.events.on('orderAddress.address:change', this.handleOrderFieldChange.bind(this));
        this.events.on('orderContact.email:change', this.handleOrderFieldChange.bind(this));
        this.events.on('orderContact.phone:change', this.handleOrderFieldChange.bind(this));
    }
    
    /**
     * Обрабатывает изменения полей заказа
     * @param {object} data - Данные об измененном поле
     * @private
     */
    private handleOrderFieldChange(data: { field: keyof OrderData; value: string }): void {
        if (data && data.field && data.value !== undefined) {
            this.setOrderField(data.field, data.value);
            
            // Валидируем данные в зависимости от типа поля
            if (data.field === 'payment' || data.field === 'address') {
                this.validateOrderAddress();
            } else if (data.field === 'email' || data.field === 'phone') {
                this.validateOrderContact();
            }
        }
    }

    /**
     * Устанавливает каталог товаров.
     * @param {ProductItem[]} items - Список товаров для каталога
     */
    setCatalog(items: ProductItem[]): void {
        this.catalog = items || [];
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    /**
     * Возвращает товар по идентификатору.
     * @param {string} id - Идентификатор товара
     * @returns {ProductItem | undefined} Найденный товар или undefined
     */
    getProductById(id: string): ProductItem | undefined {
        return (this.catalog || []).find(item => item.id === id);
    }

    /**
     * Проверяет, находится ли товар в корзине.
     * @param {string} id - Идентификатор товара
     * @returns {boolean} true, если товар в корзине
     */
    isInBasket(id: string): boolean {
        try {
            // Получаем корзину с защитой от undefined
            const currentBasket = this.basket || [];
            // Проверяем наличие id в корзине
            return Array.isArray(currentBasket) && currentBasket.includes(id);
        } catch (error) {
            console.error('Ошибка при проверке товара в корзине:', error);
            return false;
        }
    }

    /**
     * Добавляет товар в корзину.
     * @param {ProductItem} item - Товар для добавления
     */
    addToBasket(item: ProductItem): void {
        try {
            const currentBasket = this.basket || [];
            if (!this.isInBasket(item.id)) {
                this.basket = [...currentBasket, item.id];
            }
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            // Инициализируем корзину с текущим товаром в случае ошибки
            this.basket = [item.id];
        }
    }

    /**
     * Удаляет товар из корзины.
     * @param {string} id - Идентификатор товара для удаления
     */
    removeFromBasket(id: string): void {
        try {
            const currentBasket = this.basket || [];
            this.basket = currentBasket.filter(item => item !== id);
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            this.basket = [];
        }
    }

    /**
     * Очищает корзину.
     */
    clearBasket(): void {
        this.basket = [];
    }

    /**
     * Возвращает товары из корзины с полной информацией.
     * @returns {ProductItem[]} Список товаров в корзине
     */
    getBasketItems(): ProductItem[] {
        try {
            const currentBasket = this.basket || [];
            return currentBasket
                .map(id => this.getProductById(id))
                .filter((item): item is ProductItem => item !== undefined);
        } catch (error) {
            console.error('Ошибка при получении товаров корзины:', error);
            return [];
        }
    }

    /**
     * Вычисляет общую стоимость товаров в корзине.
     * @returns {number} Общая стоимость
     */
    getTotal(): number {
        try {
            return this.getBasketItems().reduce((total, item) => total + item.price, 0);
        } catch (error) {
            console.error('Ошибка при расчете общей стоимости:', error);
            return 0;
        }
    }

    /**
     * Устанавливает конкретное поле заказа.
     * @param {keyof OrderData} field - Название поля
     * @param {string} value - Новое значение
     */
    setOrderField(field: keyof OrderData, value: string): void {
        // Создаем новый объект, чтобы не мутировать исходный
        this.order = { 
            ...this.order, 
            [field]: value 
        };
		}

    validateOrderAddress(): boolean {
        const errors: Record<string, string> = {};
        const currentOrder = this.order || {};
        
        // Проверка адреса
        if (!currentOrder.address || currentOrder.address.trim().length < 5) {
            errors.address = 'Адрес должен содержать не менее 5 символов';
            console.log('Ошибка валидации адреса:', currentOrder.address);
        }
        
        // Проверка способа оплаты
        if (!currentOrder.payment || !['card', 'cash'].includes(currentOrder.payment)) {
            errors.payment = 'Выберите способ оплаты';
            console.log('Ошибка валидации оплаты:', currentOrder.payment);
        }
        
        // Сохраняем ошибки в состоянии
        this.formErrors = errors;
        
        // Проверяем наличие ошибок
        const isValid = Object.keys(errors).length === 0;
        
        // Отправляем событие о результатах валидации с явным указанием состояния валидности
        this.events.emit('orderAddress:validation', {
            valid: isValid,
            errors: Object.values(errors)
        });
        
        // Дополнительно отправим событие
        this.events.emit('orderAddress:validationErrors', {
            valid: isValid,
            errors: Object.values(errors)
        });

        return isValid;
    }

    /**
     * Валидирует форму контактных данных.
     * @returns {boolean} true, если форма валидна
     */
    validateOrderContact(): boolean {
        const errors: Record<string, string> = {};
        const currentOrder = this.order || {};
        
        // Регулярное выражение для проверки email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Проверка email
        if (!currentOrder.email || !emailRegex.test(currentOrder.email)) {
            errors.email = 'Укажите корректный email';
        }
        
        // Проверка телефона
        if (!currentOrder.phone || currentOrder.phone.trim().length < 10) {
            errors.phone = 'Укажите корректный номер телефона (не менее 10 символов)';
        }
        
        // Сохраняем ошибки в состоянии
        this.formErrors = errors;
        
        // Проверяем наличие ошибок
        const isValid = Object.keys(errors).length === 0;
        
        // Отправляем событие о результатах валидации
        this.events.emit('orderContact:validationResult', {
            valid: isValid,
            errors: Object.values(errors)
        });
        
        return isValid;
    }

    /**
     * Валидирует полный заказ перед отправкой.
     * @returns {boolean} true, если заказ валиден
     */
    validateOrder(): boolean {
        const addressValid = this.validateOrderAddress();
        const contactValid = this.validateOrderContact();
        
        // Проверяем наличие товаров в корзине
        const currentBasket = this.basket || [];
        if (currentBasket.length === 0) {
            this.formErrors = { 
                ...this.formErrors, 
                items: 'Корзина пуста' 
            };
            return false;
        }
        
        return addressValid && contactValid;
    }

    /**
     * Сбрасывает данные заказа после успешного оформления.
     * Очищает все поля заказа и устанавливает их в начальное состояние.
     */
    resetOrder(): void {
        this.order = {
            payment: '',
            address: '',
            email: '',
            phone: '',
            items: []
        };
        
        // Очищаем ошибки форм
        this.formErrors = {};
        
        // Отправляем событие о сбросе заказа
        this.events.emit('order:reset', { order: this.order });
		}
}