import { Form, IFormState } from './common/Form';
import { IOrderContactFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Класс для работы с формой контактных данных заказа.
 * Управляет вводом email и телефона пользователя.
 */
export class OrderContactForm extends Form<IOrderContactFormState> {
	/** Поле для ввода email */
	private _emailInput: HTMLInputElement;
	
	/** Поле для ввода телефона */
	private _phoneInput: HTMLInputElement;
	
	/** Список обработчиков событий для последующей очистки */
	private readonly _handlers: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];
	
	/** Функция обработчика валидации */
	private _validationHandler: ((result: { valid: boolean, errors: string[] }) => void) | null = null;

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
		// Инициализируем поля формы
		this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
		this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
		
		// Добавляем обработчики ввода для полей
		this._addHandler(this._emailInput, 'input', this._handleEmailInput.bind(this));
		this._addHandler(this._phoneInput, 'input', this._handlePhoneInput.bind(this));
		
		// Добавляем обработчик отправки формы
		this._addHandler(this.container, 'submit', this._handleSubmit.bind(this));
		
		// Создаем и сохраняем обработчик для возможности отписки
		this._validationHandler = this.handleValidationResult.bind(this);
		
		// Подписываемся на события от модели через презентер
		this.events.on('orderContact:validationResult', this._validationHandler);
	}

	/**
	 * Обрабатывает ввод email
	 * @param {Event} e - Событие ввода
	 * @private
	 */
	private _handleEmailInput(e: Event): void {
		const input = e.target as HTMLInputElement;
		
		// Отправляем событие для обновления модели
		this.events.emit('orderContact.email:change', {
			field: 'email',
			value: input.value
		});
	}

	/**
	 * Обрабатывает ввод телефона
	 * @param {Event} e - Событие ввода
	 * @private
	 */
	private _handlePhoneInput(e: Event): void {
		const input = e.target as HTMLInputElement;
		
		// Отправляем событие для обновления модели
		this.events.emit('orderContact.phone:change', {
			field: 'phone',
			value: input.value
		});
	}

	/**
	 * Обрабатывает отправку формы
	 * @param {Event} e - Событие отправки формы
	 * @private
	 */
	private _handleSubmit(e: Event): void {
		e.preventDefault();
		
		// Получаем данные формы
		const formData = new FormData(this.container);
		const email = formData.get('email') as string;
		const phone = formData.get('phone') as string;
		
		// Подготавливаем данные формы
		const data = { email, phone };

		// Отправляем событие с данными формы
		this.events.emit('orderContact:submit', data);
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
	 * Обрабатывает результаты валидации от модели
	 * @param {IFormState} validationResult - Результаты валидации
	 */
	private handleValidationResult(validationResult: { valid: boolean, errors: string[] }): void {
		// Обновляем состояние формы через базовый класс
		this.valid = validationResult.valid;
		this.errors = validationResult.errors.join(', ');
	}

  /**
   * Отображает ошибки валидации в форме
   * @param {string[]} errors - Массив сообщений об ошибках
   */
  public showErrors(errors: string[]): void {
    // Обновляем состояние кнопки отправки и ошибки через базовый класс
    this.valid = false;
    this.errors = errors.join(', ');
  }

	/**
	 * Сбрасывает форму в исходное состояние.
	 */
	public reset(): void {
		// Сбрасываем поля формы
		this._emailInput.value = '';
		this._phoneInput.value = '';

		// Сбрасываем ошибки и состояние валидности
		this.valid = false;
		this.errors = '';

		// Отправляем событие о сбросе
		this.events.emit(`${this.container.name}:reset`);
	}

	/**
	 * Расширенный метод рендеринга для обновления полей формы
	 * @param {Partial<IOrderContactFormState> & IFormState} state - Состояние формы
	 * @returns {HTMLFormElement} HTML-элемент формы
	 * @override
	 */
	render(state: Partial<IOrderContactFormState> & IFormState): HTMLFormElement {
		// Обновляем поля формы, если они указаны в состоянии
		if (state.email !== undefined && this._emailInput) {
			this._emailInput.value = state.email;
			
			// Отправляем событие для обновления модели
			this.events.emit('orderContact.email:change', {
				field: 'email',
				value: state.email
			});
		}
		
		if (state.phone !== undefined && this._phoneInput) {
			this._phoneInput.value = state.phone;
			
			// Отправляем событие для обновления модели
			this.events.emit('orderContact.phone:change', {
				field: 'phone',
				value: state.phone
			});
		}
		
		// Обновляем состояние валидности, если оно указано
		if (state.valid !== undefined) {
			this.valid = state.valid;
		}
		
		// Обновляем ошибки, если они указаны
		if (state.errors !== undefined) {
			this.errors = state.errors.join(', ');
		}
		
		// Вызываем родительский метод для обработки общих свойств формы
		return this.container;
	}
}