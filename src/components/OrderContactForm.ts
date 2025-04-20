import { Form } from './common/Form';
import { IOrderContactFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Класс для работы с формой контактных данных заказа.
 * Управляет вводом и валидацией email и телефона пользователя.
 */
export class OrderContactForm extends Form<IOrderContactFormState> {
	/** Поле для ввода email */
	private _emailInput: HTMLInputElement;
	
	/** Поле для ввода телефона */
	private _phoneInput: HTMLInputElement;
	
	/** Кнопка отправки формы */
	private _submitButton: HTMLButtonElement;
	
	/** Контейнер для отображения ошибок */
	private _errorContainer: HTMLElement;
	
	/** Список обработчиков событий для последующей очистки */
	private readonly _handlers: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];

	/** Регулярное выражение для проверки корректности email */
	private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	/** Регулярное выражение для проверки корректности телефона (+7 или 8, затем 10 цифр) */
	private static readonly phoneRegex = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

	/**
	 * Создает экземпляр формы контактных данных.
	 * @param {HTMLFormElement} container - HTML-элемент формы
	 * @param {IEvents} events - Система событий для коммуникации
	 */
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	/**
	 * Инициализирует форму: находит элементы DOM и устанавливает обработчики событий.
	 */
	public init(): void {
		// Инициализируем все элементы формы
		this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
		this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
		this._submitButton = ensureElement<HTMLButtonElement>('.modal__actions .button', this.container);
		this._errorContainer = ensureElement<HTMLElement>('.form__errors', this.container);

		// Обработчики ввода для полей email и телефона
		this._addHandler(this._emailInput, 'input', this._handleInput.bind(this));
		this._addHandler(this._phoneInput, 'input', this._handleInput.bind(this));

		// Обработчик клика по кнопке отправки
		this._addHandler(this._submitButton, 'click', this._handleSubmit.bind(this));
	}

	/**
	 * Добавляет обработчик события с возможностью последующей очистки.
	 * @param {HTMLElement} element - Элемент, к которому добавляется обработчик
	 * @param {string} event - Название события
	 * @param {EventListener} handler - Функция обработчик
	 * @private
	 */
	private _addHandler(element: HTMLElement, event: string, handler: EventListener): void {
		element.addEventListener(event, handler);
		this._handlers.push({ element, event, handler });
	}

	/**
	 * Обрабатывает ввод данных в поля формы.
	 * @private
	 */
	private _handleInput(): void {
		this._validateForm();
	}

	/**
	 * Обрабатывает отправку формы.
	 * @param {Event} e - Событие клика
	 * @private
	 */
	private _handleSubmit(e: Event): void {
		e.preventDefault();
		if (!this._submitButton.disabled) {
			this._onSubmit();
		}
	}

	/**
	 * Валидирует данные формы и обновляет UI в соответствии с результатами.
	 * @private
	 */
	private _validateForm(): void {
		const errors: string[] = [];
		const email = this._emailInput.value.trim();
		const phone = this._phoneInput.value.trim();

		// Проверяем email
		if (!email) {
			errors.push('Email не может быть пустым');
		} else if (!OrderContactForm.emailRegex.test(email)) {
			errors.push('Некорректный формат Email');
		}

		// Проверяем телефон
		if (!phone) {
			errors.push('Телефон не может быть пустым');
		} else if (!OrderContactForm.phoneRegex.test(phone)) {
			errors.push('Некорректный формат телефона');
		}

		// Переключаем состояние ошибки
		this._toggleErrorState(errors);

		// Обновляем события и текущее состояние формы
		this.events.emit('order:formErrors', errors);
		this.events.emit('orderContact:stateChange', { 
			email, 
			phone, 
			valid: errors.length === 0 
		});
	}

	/**
	 * Обновляет отображение ошибок и состояние кнопки отправки.
	 * @param {string[]} errors - Массив сообщений об ошибках
	 * @private
	 */
	private _toggleErrorState(errors: string[]): void {
		this._errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
		this._submitButton.disabled = errors.length > 0;
	}

	/**
	 * Отправляет данные формы через систему событий.
	 * @private
	 */
	private _onSubmit(): void {
		this.events.emit('orderContact:submit', {
			email: this._emailInput.value.trim(),
			phone: this._phoneInput.value.trim(),
		});
	}

	/**
	 * Сбрасывает форму в исходное состояние.
	 */
	public reset(): void {
		// Сбрасываем поля формы
		this._emailInput.value = '';
		this._phoneInput.value = '';

		// Деактивируем кнопку отправки
		this._submitButton.disabled = true;

		// Сбрасываем ошибки
		this._errorContainer.innerHTML = '';

		// Отправляем событие сброса
		this.events.emit('formReset', { 
			email: '', 
			phone: '', 
			valid: false 
		});
	}

	/**
	 * Отображает переданные ошибки и обновляет состояние формы.
	 * @param {string[]} errors - Массив сообщений об ошибках
	 */
	public showErrors(errors: string[]): void {
		this._toggleErrorState(errors);
		this._validateForm(); // Перепроверка состояния кнопки
	}

	/**
	 * Устанавливает значение email в форме.
	 * @param {string} value - Новое значение email
	 */
	public set email(value: string) {
		if (this._emailInput) {
			this._emailInput.value = value;
			this._validateForm();
		}
	}

	/**
	 * Устанавливает значение телефона в форме.
	 * @param {string} value - Новое значение телефона
	 */
	public set phone(value: string) {
		if (this._phoneInput) {
			this._phoneInput.value = value;
			this._validateForm();
		}
	}

	/**
	 * Переопределяем метод родительского класса для обработки изменений полей формы.
	 * @param {string} field - Название поля
	 * @param {string} value - Значение поля
	 * @override
	 */
	protected onInputChange(field: keyof IOrderContactFormState, value: string): void {
		// Вызываем родительский метод для обеспечения стандартного поведения
		super.onInputChange(field, value);

		// Дополнительная обработка для наших полей
		if (field === 'email') {
			this.email = value;
		} else if (field === 'phone') {
			this.phone = value;
		}
	}
	}