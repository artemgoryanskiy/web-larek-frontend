import { Component } from "./base/Component";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

/**
 * Интерфейс, описывающий состояние страницы
 */
interface IPage {
	/** Количество товаров в корзине */
	counter: number;
	/** Массив HTML-элементов для каталога */
	catalog: HTMLElement[];
	/** Флаг блокировки страницы */
	locked: boolean;
}

/**
 * Класс управления основной страницей приложения
 */
export class Page extends Component<IPage> {
	/** Элемент счетчика товаров в корзине */
	protected _counter: HTMLElement;

	/** Контейнер каталога товаров */
	protected _catalog: HTMLElement;

	/** Основная обертка страницы */
	protected _wrapper: HTMLElement;

	/** Кнопка корзины */
	protected _basket: HTMLButtonElement;

	/** Обработчик клика по корзине */
	private _basketClickHandler: () => void;

	/**
	 * Создает экземпляр класса Page
	 * @param {HTMLElement} container - Контейнер страницы
	 * @param {IEvents} events - Система событий
	 */
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Получаем необходимые элементы страницы
		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLButtonElement>('.header__basket');

		// Создаем обработчик с привязкой к текущему контексту
		this._basketClickHandler = this._handleBasketClick.bind(this);

		// Добавляем обработчик клика по корзине
		this._basket.addEventListener('click', this._basketClickHandler);
	}

	/**
	 * Обработчик клика по кнопке корзины
	 * @private
	 */
	private _handleBasketClick(): void {
		this.events.emit('basket:open');
	}

	/**
	 * Устанавливает значение счетчика товаров в корзине
	 * @param {number} value - Новое значение счетчика
	 */
	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	/**
	 * Обновляет элементы каталога товаров
	 * @param {HTMLElement[]} items - Массив элементов для отображения в каталоге
	 */
	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	/**
	 * Управляет блокировкой страницы
	 * @param {boolean} value - true для блокировки, false для разблокировки
	 */
	set locked(value: boolean) {
		this._wrapper.classList.toggle('page__wrapper_locked', value);
	}

	/**
	 * Освобождает ресурсы при уничтожении компонента
	 */
	public destroy(): void {
		// Удаляем обработчик события при уничтожении компонента
		this._basket.removeEventListener('click', this._basketClickHandler);
	}
}