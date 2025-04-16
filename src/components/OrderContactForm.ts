import { Form, IFormState } from './common/Form';
import { IOrderContactFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Класс для обработки формы с контактными данными покупателя
 */
export class OrderContactForm extends Form<IOrderContactFormState> {
	/** Поле ввода email */
	private readonly _emailInput: HTMLInputElement;
	/** Поле ввода телефона */
	private readonly _phoneInput: HTMLInputElement;
	/** Кнопка оплаты */
	private readonly _submitButton: HTMLButtonElement;
	/** Контейнер для отображения ошибок */
	private readonly _errorContainer: HTMLElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		// Инициализируем поля ввода
		this._emailInput = ensureElement<HTMLInputElement>(
			'.form__input[placeholder="Введите Email"]',
			this.container
		);

		this._phoneInput = ensureElement<HTMLInputElement>(
			'.form__input[placeholder="+7 ("]',
			this.container
		);

		// Инициализируем кнопку оплаты
		this._submitButton = ensureElement<HTMLButtonElement>(
			'.modal__actions .button',
			this.container
		);

		// Создаем контейнер для ошибок, если его нет в разметке
		if (!this.container.querySelector('.form__errors')) {
			this._errorContainer = document.createElement('div');
			this._errorContainer.className = 'form__errors';
			this.container.querySelector('.order')?.appendChild(this._errorContainer);
		} else {
			this._errorContainer = ensureElement<HTMLElement>(
				'.form__errors',
				this.container
			);
		}

		// Добавляем обработчики событий для полей ввода
		this._emailInput.addEventListener('input', () => {
			this._validateForm();
		});

		this._phoneInput.addEventListener('input', () => {
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
	 * Проверяет валидность формы и обновляет состояние кнопки
	 */
	private _validateForm(): void {
		// Очищаем сообщение об ошибке
		this._errorContainer.innerHTML = '';
		const errors: string[] = [];

		// Проверяем email
		const emailValue = this._emailInput.value.trim();
		const emailValid = this._validateEmail(emailValue);
		if (!emailValid && emailValue.length > 0) {
			errors.push('Некорректный формат Email');
		} else if (emailValue.length === 0) {
			errors.push('Email не может быть пустым');
		}

		// Проверяем телефон
		const phoneValue = this._phoneInput.value.trim();
		const phoneValid = this._validatePhone(phoneValue);
		if (!phoneValid && phoneValue.length > 0) {
			errors.push('Некорректный формат телефона');
		} else if (phoneValue.length === 0) {
			errors.push('Телефон не может быть пустым');
		}

		// Если есть ошибки, отображаем их
		if (errors.length > 0) {
			this._errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
			this._submitButton.disabled = true;
		} else {
			this._submitButton.disabled = false;
		}

		// Обновляем состояние формы
		this.events.emit('order:formErrors', errors);
	}

	/**
	 * Валидация email
	 */
	private _validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Валидация телефона
	 */
	private _validatePhone(phone: string): boolean {
		// Проверка на наличие российского формата телефона
		const phoneRegex = /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
		return phoneRegex.test(phone);
	}

	/**
	 * Обрабатывает отправку формы
	 */
	private _onSubmit(): void {
		const formData: IOrderContactFormState = {
			email: this._emailInput.value,
			phone: this._phoneInput.value
		};

		// Отправляем событие с данными формы
		this.events.emit('orderContact:submit', formData);
	}

	/**
	 * Устанавливает значение для поля email
	 */
	set email(value: string) {
		this._emailInput.value = value;
		this._validateForm();
	}

	/**
	 * Устанавливает значение для поля телефона
	 */
	set phone(value: string) {
		this._phoneInput.value = value;
		this._validateForm();
	}

	/**
	 * Отображает форму согласно переданному состоянию
	 */
	override render(state: Partial<IOrderContactFormState> & IFormState) {
		if (state.email !== undefined) {
			this.email = state.email;
		}

		if (state.phone !== undefined) {
			this.phone = state.phone;
		}

		// Отображаем ошибки, если они есть
		if (state.errors && state.errors.length > 0) {
			this._errorContainer.innerHTML = state.errors.map(error => `<p>${error}</p>`).join('');
		} else {
			this._errorContainer.innerHTML = '';
		}

		// Устанавливаем состояние кнопки
		if (state.valid !== undefined) {
			this._submitButton.disabled = !state.valid;
		}

		return super.render(state);
	}
}