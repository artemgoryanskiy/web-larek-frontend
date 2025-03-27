type EventName = string | RegExp; // Имя события может быть строкой или регулярным выражением.
type Subscriber = Function; // Тип для описания подписчиков на события.
type EmitterEvent = {
    eventName: string, // Имя события, которое произошло.
    data: unknown // Данные, передаваемые с событием.
};

// Интерфейс, описывающий базовую структуру API событий.
export interface IEvents {
    /**
     * Метод для подписки на событие.
     * @param event Имя события или шаблон (строка/регулярное выражение).
     * @param callback Функция-обработчик, вызываемая при возникновении события.
     */
    on<T extends object>(event: EventName, callback: (data: T) => void): void;

    /**
     * Метод для инициирования события.
     * @param event Имя события (строка).
     * @param data Дополнительные данные, передаваемые с событием.
     */
    emit<T extends object>(event: string, data?: T): void;

    /**
     * Метод для создания связанного события, которое будет генерироваться
     * при вызове возвращённой функции.
     * @param event Имя события.
     * @param context Контекст или дополнительные данные, которые будут добавлены к событию.
     * @returns Функция-обработчик, которая при вызове инициализирует событие.
     */
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

/**
 * Классическая реализация брокера событий.
 * Реализовано управление подписчиками на события, инициирование событий с данными,
 * поддержка шаблонов событий (например, регулярные выражения),
 * а также возможность подписаться на все события.
 */
export class EventEmitter implements IEvents {
    // Внутреннее хранилище для событий и их подписчиков.
    _events: Map<EventName, Set<Subscriber>>;

    constructor() {
        // Инициализация пустой коллекции для хранения событий.
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    /**
     * Метод для установки обработчика на событие.
     * @param eventName Имя события или регулярное выражение.
     * @param callback Функция-обработчик, вызываемая при возникновении события.
     */
    on<T extends object>(eventName: EventName, callback: (event: T) => void) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, new Set<Subscriber>());
        }
        this._events.get(eventName)?.add(callback);
    }

    /**
     * Метод для удаления обработчика с события.
     * @param eventName Имя события, с которого нужно удалить обработчик.
     * @param callback Функция-обработчик, которую нужно удалить.
     */
    off(eventName: EventName, callback: Subscriber) {
        if (this._events.has(eventName)) {
            this._events.get(eventName)!.delete(callback);
            // Удаляем событие из коллекции, если у него больше нет обработчиков.
            if (this._events.get(eventName)?.size === 0) {
                this._events.delete(eventName);
            }
        }
    }

    /**
     * Метод для инициирования события.
     * @param eventName Имя события (строка).
     * @param data Дополнительные данные, передаваемые с событием.
     */
    emit<T extends object>(eventName: string, data?: T) {
        this._events.forEach((subscribers, name) => {
            // Поддержка подключения на любые события через символ '*'.
            if (name === '*') subscribers.forEach(callback => callback({
                eventName,
                data
            }));
            // Если событие совпадает (по имени или регулярному выражению), вызываем всех подписчиков.
            if (name instanceof RegExp && name.test(eventName) || name === eventName) {
                subscribers.forEach(callback => callback(data));
            }
        });
    }

    /**
     * Подписка на все события сразу.
     * @param callback Функция-обработчик, вызываемая при любом событии.
     */
    onAll(callback: (event: EmitterEvent) => void) {
        this.on("*", callback);
    }

    /**
     * Удаление всех обработчиков из коллекции событий.
     */
    offAll() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    /**
     * Метод для создания триггера (обработчика), который при вызове
     * будет генерировать указанное событие.
     * @param eventName Имя события.
     * @param context Дополнительные данные, которые должны быть добавлены к событию.
     * @returns Функция-триггер, которая инициирует событие с переданным контекстом.
     */
    trigger<T extends object>(eventName: string, context?: Partial<T>) {
        return (event: object = {}) => {
            this.emit(eventName, {
                ...(event || {}),
                ...(context || {})
            });
        };
    }
}