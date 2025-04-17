import { Form, IFormState } from './common/Form';
import { IOrderAddressFormState } from '../types';
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

/**
 * Типы доступных методов оплаты
 */
type PaymentMethod = 'card' | 'cash';

/**
 * Класс для обработки формы с выбором способа оплаты и адресом доставки
 */
export class OrderAddressForm extends Form<IOrderAddressFormState> {
	private _payment: PaymentMethod | '' = '';
	private _address = '';
	private readonly _cardButton: HTMLButtonElement;
	private readonly _cashButton: HTMLButtonElement;
	private readonly _addressInput: HTMLInputElement;
	private readonly _submitButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		// Находим все необходимые элементы формы
		this._cardButton = container.querySelector('button[name="card"]') as HTMLButtonElement;
		this._cashButton = container.querySelector('button[name="cash"]') as HTMLButtonElement;

		this._addressInput = container.querySelector(
			'input[name="address"]'
		) as HTMLInputElement;

		this._submitButton = container.querySelector(
			'button[type="submit"]'
		) as HTMLButtonElement;
	}

	public init(): void {
		// Добавляем обработчики для кнопок оплаты
		if (this._cardButton) {
			this._cardButton.addEventListener('click', (e) => {
				e.preventDefault();
				this._selectPaymentMethod('card');
			});
		}

		if (this._cashButton) {
			this._cashButton.addEventListener('click', (e) => {
				e.preventDefault();
				this._selectPaymentMethod('cash');
			});
		}

		// Обработчик для поля ввода адреса
		this._addressInput.addEventListener('input', () => {
			this.address = this._addressInput.value;
		});

		// Обработчик для формы
		this.container.addEventListener('submit', (e) => {
			e.preventDefault();
			if (this.valid) {
				this.events.emit('orderFormSubmit', this.state);
			}
		});
	}

	private _selectPaymentMethod(method: PaymentMethod): void {
		// Сбрасываем выделение обеих кнопок
		this._cardButton?.classList.remove('button_alt-active');
		this._cashButton?.classList.remove('button_alt-active');

		// Выделяем нужную кнопку
		if (method === 'card' && this._cardButton) {
			this._cardButton.classList.add('button_alt-active');
		} else if (method === 'cash' && this._cashButton) {
			this._cashButton.classList.add('button_alt-active');
		}
		// Устанавливаем значение способа оплаты
		this._payment = method;
		// Отправляем событие выбора способа оплаты
		this.events.emit('paymentMethodSelected', { paymentMethod: method });
		// Обновляем состояние формы
		this._onFieldChange('payment', method);
		this._validateForm();
	}

	private _validateForm(): void {
		const isValid = Boolean(this._payment && this._address);

		// Активируем/деактивируем кнопку отправки
		if (this._submitButton) {
			this._submitButton.disabled = !isValid;
		}
		// Отправляем событие изменения валидности формы
		this.events.emit('formValidityChanged', { isValid });
	}


	private _onFieldChange(field: string, value: string): void {
		this.events.emit('formChange', {
			...this.state,
			[field]: value
		});
	}

	get state(): IOrderAddressFormState {
		return {
			payment: this._payment,
			address: this._address,
			buttonDisabled: Boolean(this._payment && this._address)
		};
	}

	get payment(): PaymentMethod | '' {
		return this._payment;
	}

	set payment(value: PaymentMethod | '') {
		if (!value) return;
		// Устанавливаем метод оплаты через выделенный метод
		this._selectPaymentMethod(value as PaymentMethod);
	}


	get address(): string {
		return this._address;
	}

	set address(value: string) {
		this._address = value;
		this._onFieldChange('address', value);
		this._validateForm();
	}

	get valid(): boolean {
		return Boolean(this._payment && this._address);
	}

	set valid(value: boolean) {
		// Обновляем состояние кнопки отправки
		if (this._submitButton) {
			this._submitButton.disabled = !value;
		}
	}

	// Метод для очистки формы
	public reset(): void {
		// Сбрасываем выбор метода оплаты
		this._payment = '';
		this._cardButton?.classList.remove('button_alt-active');
		this._cashButton?.classList.remove('button_alt-active');

		// Сбрасываем адрес
		this._address = '';
		if (this._addressInput) {
			this._addressInput.value = '';
		}

		// Обновляем состояние формы
		this._validateForm();
	}


	// Метод для отображения ошибок формы
	public showErrors(errors: Record<string, string>): void {
		const errorContainer = this.container.querySelector('.form__errors');
		if (errorContainer) {
			errorContainer.textContent = Object.values(errors).join(', ');
		}
	}

	// Метод для скрытия ошибок формы
	public clearErrors(): void {
		const errorContainer = this.container.querySelector('.form__errors');
		if (errorContainer) {
			errorContainer.textContent = '';
		}
	}
}
