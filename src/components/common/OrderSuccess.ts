import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { ensureElement, formatNumber } from "../../utils/utils";

/**
 * Интерфейс для состояния компонента успешного заказа
 */
interface IOrderSuccessState {
	/** Заголовок сообщения об успешном заказе */
	title: string;
	/** Сумма списанных средств */
	amount: number;
	/** Валюта (синапсы, рубли и т.д.) */
	currency: string;
}

/**
 * Компонент для отображения успешного оформления заказа
 */
export class OrderSuccess extends Component<IOrderSuccessState> {
	/** Заголовок сообщения */
	protected _title: HTMLElement;
	/** Элемент для отображения списанной суммы */
	protected _description: HTMLElement;
	/** Кнопка закрытия */
	protected _closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Находим необходимые элементы в DOM
		this._title = ensureElement<HTMLElement>('.film__title', this.container);
		this._description = ensureElement<HTMLElement>('.film__description', this.container);
		this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

		// Добавляем обработчик клика по кнопке закрытия
		this._closeButton.addEventListener('click', () => {
			this.events.emit('order-success:close');
		});
	}

	/**
	 * Отрисовывает компонент согласно переданному состоянию
	 */
	render(state: IOrderSuccessState): HTMLElement {
		// Обновляем заголовок
		this.setText(this._title, state.title);

		// Формируем текст с суммой и валютой
		const amountText = `Списано ${formatNumber(state.amount)} ${state.currency}`;
		this.setText(this._description, amountText);

		return this.container;
	}
}