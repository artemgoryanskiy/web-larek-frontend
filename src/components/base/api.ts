// Тип, описывающий общий формат ответа от API для запросов списка элементов.
// Поле `total` — общее количество элементов, 
// `items` — массив с элементами указанного типа.
export type ApiListResponse<Type> = {
    total: number, // Общее количество элементов.
    items: Type[] // Список элементов заданного типа.
};

// Тип, задающий разрешённые HTTP-методы для операций изменения данных.
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

/**
 * Базовый класс для взаимодействия с API.
 * Реализован с использованием стандартного API fetch.
 * Поддерживает базовые методы `GET` и `POST` (также PUT/DELETE для изменения данных).
 */
export class Api {
    readonly baseUrl: string; // Базовый URL для всех запросов.
    protected options: RequestInit; // Опции для передачи в fetch-запрос.

    /**
     * Конструктор класса API.
     * @param baseUrl Базовый URL API (например, 'https://api.example.com').
     * @param options Настройки запросов, такие как заголовки или другие параметры (необязательно).
     */
    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl;
        // Инициализация базовых опций с добавлением заголовка `Content-Type: application/json`.
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as object ?? {}) // Добавляем дополнительные заголовки при наличии.
            }
        };
    }

    /**
     * Обработка ответа от API.
     * Метод обрабатывает успешные и ошибочные ответы сервера.
     * @param response Объект ответа от fetch.
     * @returns Если запрос успешен, возвращает JSON данных (Promise).
     *          В случае ошибки reject с сообщением об ошибке.
     */
    protected handleResponse(response: Response): Promise<object> {
        if (response.ok) {
            // Если ответ успешный (2XX), парсим JSON.
            return response.json();
        } else {
            // Если ошибка, пытаемся прочитать сообщение об ошибке из тела ответа.
            return response.json()
              .then(data => Promise.reject(data.error ?? response.statusText));
        }
    }

    /**
     * Выполнить GET-запрос.
     * Используется для получения данных.
     * @param uri URI для выполнения запроса относительно базового URL.
     * @returns Promise с результатами в формате JSON.
     */
    get(uri: string) {
        return fetch(this.baseUrl + uri, {
            ...this.options, // Используем предустановленные опции.
            method: 'GET' // Устанавливаем метод GET.
        }).then(this.handleResponse); // Обрабатываем результат запроса.
    }

    /**
     * Выполнить POST/PUT/DELETE-запрос.
     * Используется для отправки данных на сервер.
     * @param uri URI для выполнения запроса относительно базового URL.
     * @param data Объект с данными, которые необходимо отправить на сервер.
     * @param method HTTP-метод, который используется для вызова (по умолчанию 'POST').
     * @returns Promise с результатами в формате JSON.
     */
    post(uri: string, data: object, method: ApiPostMethods = 'POST') {
        return fetch(this.baseUrl + uri, {
            ...this.options, // Используем предустановленные опции.
            method, // Указываем метод (POST, PUT, DELETE).
            body: JSON.stringify(data) // Преобразуем переданные данные в формат JSON.
        }).then(this.handleResponse); // Обрабатываем результат запроса.
    }
}
