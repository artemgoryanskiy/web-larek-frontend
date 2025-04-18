import { Form } from './common/Form';
import { IOrderAddressFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Типы доступных методов оплаты
 */
export type PaymentMethod = 'card' | 'cash';

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
		this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
		this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
		this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
		this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
	}

	public init(): void {
		// Добавляем обработчики для кнопок оплаты
		[this._cardButton, this._cashButton].forEach(button => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				this._selectPaymentMethod(button.name as PaymentMethod);
			});
		});

		// Обработчик для поля ввода адреса
		this._addressInput.addEventListener('input', () => {
			this.address = this._addressInput.value;
			this._validateForm();
		});

		// Обработчик отправки формы
		this.container.addEventListener('submit', (e) => {
			e.preventDefault();
			if (this.valid) {
				this.events.emit('orderAddress:submit', this.state);
			}
		});
	}

	private _selectPaymentMethod(method: PaymentMethod): void {
		// Используем объект для управления выделением кнопок
		const buttons = { card: this._cardButton, cash: this._cashButton };

		// Переключаем классы активности
		Object.entries(buttons).forEach(([key, button]) => {
			button.classList.toggle('button_alt-active', key === method);
		});

		if (this._payment === method) return;

		// Устанавливаем способ оплаты
		this._payment = method;
		this.events.emit('paymentMethodSelected', { paymentMethod: method });
		this._updateFormState('payment', method);
	}

	private _validateForm(): void {
		// Проверяем, заполнены ли адрес и способ оплаты
		const isValid = Boolean(this._payment && this._address);

		// Активируем/деактивируем кнопку отправки
		this._submitButton.disabled = !isValid;

		// Работа с ошибками
		const errorElement = this.container.querySelector('.form__errors');
		if (errorElement) {
			if (!this._payment) {
				errorElement.textContent = 'Пожалуйста, выберите способ оплаты!';
			} else if (!this._address) {
				errorElement.textContent = 'Пожалуйста, введите адрес доставки!';
			} else {
				errorElement.textContent = ''; // Чистим текст ошибки
			}
		}

		// Отправляем событие изменения валидности формы
		this.events.emit('formValidityChanged', { isValid });
	}


	private _updateFormState(field: keyof IOrderAddressFormState, value: string): void {
		// Обновляем внутреннее состояние
		if (field === 'payment') {
			this._payment = value as PaymentMethod;
		}
		if (field === 'address') {
			this._address = value;
		}

		// Отправляем событие изменения состояния
		this.events.emit('formChange', {
			...this.state,
			[field]: value,
		});

		// Проверяем валидность формы
		this._validateForm();
	}

	public reset(): void {
		// Сбрасываем внутренние состояния
		this._payment = '';
		this._address = '';

		// Сбрасываем стили кнопок оплаты
		[this._cardButton, this._cashButton].forEach((button) => {
			button.classList.remove('button_alt-active'); // Убираем выделение активной кнопки
		});

		// Сбрасываем поле ввода адреса
		this._addressInput.value = '';

		// Скрываем сообщения об ошибках
		const errorElement = this.container.querySelector('.form__errors');
		if (errorElement) {
			errorElement.textContent = ''; // Чистим текст ошибки
		}

		// Деактивируем кнопку отправки
		this._submitButton.disabled = true;

		// Отправляем событие об изменении состояния (опционально)
		this.events.emit('formReset', this.state);
	}

	// Геттер состояния формы
	get state(): IOrderAddressFormState {
		return {
			payment: this._payment,
			address: this._address,
		};
	}

	// Геттер и сеттер для _payment
	get payment(): PaymentMethod | '' {
		return this._payment;
	}

	set payment(value: PaymentMethod | '') {
		if (!value) return;
		this._selectPaymentMethod(value as PaymentMethod);
	}

	// Геттер и сеттер для _address
	get address(): string {
		return this._address;
	}

	set address(value: string) {
		this._address = value;
		this._updateFormState('address', value);
	}

	// Проверка валидности формы
	get valid(): boolean {
		return Boolean(this._payment && this._address);
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}
}