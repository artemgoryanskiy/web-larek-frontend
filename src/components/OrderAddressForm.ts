import { Form, IFormState } from './common/Form';
import { IOrderAddressFormState } from '../types';
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

/**
 * Класс для обработки формы с выбором способа оплаты и адресом доставки
 */
export class OrderAddressForm extends Form<IOrderAddressFormState> {
	/** Кнопки выбора способа оплаты */
	private readonly _paymentButtons: HTMLButtonElement[];
	/** Поле ввода адреса */
	private readonly _addressInput: HTMLInputElement;
	/** Кнопка отправки формы */
	private readonly _submitButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		// Получаем кнопки выбора способа оплаты
		this._paymentButtons = Array.from(
			this.container.querySelectorAll('.order__buttons .button')
		) as HTMLButtonElement[];

		// Инициализируем поле ввода адреса
		this._addressInput = ensureElement<HTMLInputElement>(
			'.form__input[type="text"]',
			this.container
		);

		// Инициализируем кнопку отправки формы
		this._submitButton = ensureElement<HTMLButtonElement>(
			'.modal__actions .button',
			this.container
		);

		// Добавляем обработчики событий для кнопок оплаты
		this._paymentButtons.forEach(button => {
			button.addEventListener('click', () => {
				this._selectPaymentMethod(button);
				this._validateForm();
			});
		});

		// Добавляем обработчик ввода адреса
		this._addressInput.addEventListener('input', () => {
			this._validateForm();
		});

		// Добавляем обработчик отправки формы
		this._submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (!this._submitButton.disabled) {
				this._onSubmit();
			}
		});
	}

	/**
	 * Выбирает способ оплаты
	 */
	private _selectPaymentMethod(selectedButton: HTMLButtonElement): void {
		// Снимаем выделение со всех кнопок
		this._paymentButtons.forEach(button => {
			button.classList.remove('button_alt-active');
		});

		// Выделяем выбранную кнопку
		selectedButton.classList.add('button_alt-active');

		// Устанавливаем значение способа оплаты
		const paymentMethod = selectedButton.textContent?.trim() || '';
		this._onFieldChange('paymentMethod', paymentMethod);
	}

	/**
	 * Обрабатывает изменение значения поля формы
	 */
	private _onFieldChange(field: keyof IOrderAddressFormState, value: string): void {
		this.events.emit(`order:${field}:change`, { [field]: value });
	}

	/**
	 * Проверяет валидность формы и обновляет состояние кнопки
	 */
	private _validateForm(): void {
		const addressValid = this._addressInput.value.trim() !== '';
		const paymentMethodValid = this._paymentButtons.some(
			button => button.classList.contains('button_alt-active')
		);

		// Активируем/деактивируем кнопку в зависимости от валидности
		this._submitButton.disabled = !(addressValid && paymentMethodValid);
	}

	/**
	 * Обрабатывает отправку формы
	 */
	private _onSubmit(): void {
		const formData: IOrderAddressFormState = {
			paymentMethod: this._paymentButtons.find(
				button => button.classList.contains('button_alt-active')
			)?.textContent?.trim() || '',
			address: this._addressInput.value,
			buttonDisabled: this._submitButton.disabled
		};

		// Отправляем событие с данными формы
		this.events.emit('orderAddress:submit', formData);
	}

	/**
	 * Устанавливает значение для поля адреса
	 */
	set address(value: string) {
		this._addressInput.value = value;
		this._validateForm();
	}

	/**
	 * Устанавливает способ оплаты
	 */
	set paymentMethod(value: string) {
		const button = this._paymentButtons.find(
			button => button.textContent?.trim() === value
		);

		if (button) {
			this._selectPaymentMethod(button);
		}
	}

	/**
	 * Отображает форму согласно переданному состоянию
	 */
	override render(state: Partial<IOrderAddressFormState> & IFormState) {
		if (state.address !== undefined) {
			this.address = state.address;
		}

		if (state.paymentMethod !== undefined) {
			this.paymentMethod = state.paymentMethod;
		}

		this._validateForm();
		return super.render(state);
	}
}
