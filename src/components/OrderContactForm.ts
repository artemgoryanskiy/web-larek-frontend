import { Form } from './common/Form';
import { IOrderContactFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

export class OrderContactForm extends Form<IOrderContactFormState> {
	private _emailInput: HTMLInputElement;
	private _phoneInput: HTMLInputElement;
	private _submitButton: HTMLButtonElement;
	private _errorContainer: HTMLElement;

	// Регулярные выражения для валидации
	private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	private static readonly phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);
	}

	public init(): void {
		// Инициализируем все элементы формы
		this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
		this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
		this._submitButton = ensureElement<HTMLButtonElement>('.modal__actions .button', this.container);
		this._errorContainer = ensureElement<HTMLElement>('.form__errors', this.container);

		// Обработчики ввода для полей email и телефона
		[this._emailInput, this._phoneInput].forEach(input => {
			input.addEventListener('input', () => this._validateForm());
		});

		// Обработчик клика по кнопке отправки
		this._submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (!this._submitButton.disabled) {
				this._onSubmit();
			}
		});
	}

	// Метод валидации формы
	private _validateForm(): void {
		const errors: string[] = [];
		const email = this._emailInput.value.trim();
		const phone = this._phoneInput.value.trim();

		// Проверяем email
		if (!email) errors.push('Email не может быть пустым');
		else if (!OrderContactForm.emailRegex.test(email)) errors.push('Некорректный формат Email');

		// Проверяем телефон
		if (!phone) errors.push('Телефон не может быть пустым');
		else if (!OrderContactForm.phoneRegex.test(phone)) errors.push('Некорректный формат телефона');

		// Переключаем состояние ошибки
		this._toggleErrorState(errors);

		// Обновляем событие и текущее состояние формы
		this.events.emit('order:formErrors', errors);
		this.events.emit('orderContact:stateChange', { email, phone, valid: errors.length === 0 });
	}

	// Переключение состояния ошибок и блокировка кнопки
	private _toggleErrorState(errors: string[]): void {
		this._errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
		this._submitButton.disabled = errors.length > 0;
	}

	// Отправка данных формы
	private _onSubmit(): void {
		this.events.emit('orderContact:submit', {
			email: this._emailInput.value.trim(),
			phone: this._phoneInput.value.trim(),
		});
	}

	// Сброс состояния формы
	public reset(): void {
		// Сбрасываем поля формы
		this._emailInput.value = '';
		this._phoneInput.value = '';

		// Деактивируем кнопку отправки
		this._submitButton.disabled = true;

		// Сбрасываем ошибки
		this._errorContainer.innerHTML = '';

		// Отправляем событие сброса
		this.events.emit('formReset', { email: '', phone: '', valid: false });
	}

	public showErrors(errors: string[]): void {
		this._toggleErrorState(errors);
		this._validateForm(); // Перепроверка состояния кнопки
	}


	// Сеттеры для email и телефона
	public set email(value: string) {
		this._emailInput.value = value;
		this._validateForm();
	}

	public set phone(value: string) {
		this._phoneInput.value = value;
		this._validateForm();
	}
}