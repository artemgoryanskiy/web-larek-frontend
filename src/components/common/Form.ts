import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

/**
 * @interface IFormState
 * @description Интерфейс, описывающий состояние формы
 */
export interface IFormState {
	/** Флаг валидности формы */
	valid: boolean;
	/** Массив сообщений об ошибках */
	errors: string[];
}

/**
 * @interface FormFields
 * @description Базовый интерфейс для полей формы
 */
export interface FormFields {
	[key: string]: unknown;
}

/**
 * @class Form
 * @extends Component<IFormState>
 * @description Базовый класс для создания и управления HTML-формами
 * @template T - Тип, описывающий структуру данных формы
 * @typeParam T - Объект, представляющий поля и их значения в форме
 */
export class Form<T extends FormFields> extends Component<IFormState> {
	/**
	 * Кнопка отправки формы
	 * @protected
	 */
	protected _submit: HTMLButtonElement;

	/**
	 * Элемент для отображения ошибок формы
	 * @protected
	 */
	protected _errors: HTMLElement;

	/**
	 * @constructor
	 * @param {HTMLFormElement} container - HTML-элемент формы
	 * @param {IEvents} events - Экземпляр системы событий
	 */
	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		// Используем делегирование событий вместо множества обработчиков
		this.container.addEventListener('input', this.handleInput);
		this.container.addEventListener('submit', this.handleSubmit);
	}

	/**
	 * Обработчик события ввода в поля формы
	 * @private
	 * @param {Event} e - Объект события
	 */
	private handleInput = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		if (target.name) {
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		}
	};

	/**
	 * Обработчик события отправки формы
	 * @private
	 * @param {Event} e - Объект события
	 */
	private handleSubmit = (e: Event): void => {
		e.preventDefault();
		this.events.emit(`${this.container.name}:submit`);
	};

	/**
	 * Метод, вызываемый при изменении значения в поле формы
	 * @protected
	 * @param {keyof T} field - Имя поля формы
	 * @param {string} value - Новое значение поля
	 */
	protected onInputChange(field: keyof T, value: string): void {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	/**
	 * Устанавливает состояние доступности кнопки отправки формы
	 * @param {boolean} value - Флаг валидности формы
	 */
	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	/**
	 * Устанавливает текст сообщения об ошибках
	 * @param {string} value - Сообщение об ошибке
	 */
	set errors(value: string) {
		this.setText(this._errors, value);
	}

	/**
	 * Рендерит форму на основе переданного состояния
	 * @param {Partial<T> & IFormState} state - Состояние формы, включающее
	 * флаг валидности, ошибки и значения полей
	 * @returns {HTMLFormElement} HTML-элемент формы
	 */
	render(state: Partial<T> & IFormState): HTMLFormElement {
		const { valid, errors, ...inputs } = state;

		// Обновляем, только если данные действительно переданы
		if (valid !== undefined) {
			this.valid = valid;
		}

		if (errors !== undefined) {
			this.errors = errors.join(', ');
		}

		// Применяем остальные поля к экземпляру
		if (Object.keys(inputs).length > 0) {
			Object.assign(this, inputs);
		}

		return this.container;
	}
}
