import { Component } from '../base/Component';
import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
	total: number;
	selected?: string[]; // Сделали необязательным
}

export class Basket extends Component<IBasketView> {
	private _list: HTMLElement;
	private readonly _total: HTMLElement | null;
	private readonly _button: HTMLElement | null;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		// Инициализация элементов корзины
		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		// Привязка события к кнопке оформления заказа
		this._button?.addEventListener('click', this.handleOrderOpen);

		// Устанавливаем начальное состояние
		this.items = [];
	}

	/**
	 * Открытие формы оформления заказа
	 */
	private handleOrderOpen = (): void => {
		this.events.emit('order:open');
	};

	/**
	 * Установка списка элементов корзины
	 * @param items - массив HTML-элементов
	 */
	set items(items: HTMLElement[]) {
		if (items.length > 0) {
			this._renderItems(items);
		} else {
			this._renderEmptyState();
		}
	}

	/**
	 * Установка доступности кнопки оформления заказа
	 * @param items - массив выбранных товаров
	 */
	set selected(items: string[]) {
		this.setDisabled(this._button, items.length === 0);
	}

	/**
	 * Установка общей суммы корзины
	 * @param total - итоговая сумма
	 */
	set total(total: number) {
		this.setText(this._total, formatNumber(total));
	}

	/**
	 * Рендер содержимого корзины
	 * @param items - массив HTML-элементов товаров
	 */
	private _renderItems(items: HTMLElement[]): void {
		this._list.replaceChildren(...items);
	}

	/**
	 * Рендер пустого состояния корзины
	 */
	private _renderEmptyState(): void {
		this._list.replaceChildren(
			createElement<HTMLParagraphElement>('p', {
				textContent: 'Корзина пуста',
			})
		);
	}

	public reset(): void {
		this.items = [];
		this.container.innerHTML = ''; // Очищаем HTML корзины
	}

}