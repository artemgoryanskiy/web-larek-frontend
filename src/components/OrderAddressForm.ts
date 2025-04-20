import { Form } from './common/Form';
import { IOrderAddressFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Типы доступных методов оплаты
 */
export type PaymentMethod = 'card' | 'cash';

/**
 * Класс для обработки формы с выбором способа оплаты и адресом доставки.
 * Управляет выбором метода оплаты и вводом адреса доставки, отслеживает валидность
 * введенных данных и сообщает о событиях формы.
 */
export class OrderAddressForm extends Form<IOrderAddressFormState> {
  /** Выбранный способ оплаты */
  private _payment: PaymentMethod | '' = '';
  
  /** Введенный адрес доставки */
  private _address = '';
  
  /** Кнопка выбора оплаты картой */
  private readonly _cardButton: HTMLButtonElement;
  
  /** Кнопка выбора оплаты наличными */
  private readonly _cashButton: HTMLButtonElement;
  
  /** Поле ввода адреса */
  private readonly _addressInput: HTMLInputElement;
  
  /** Кнопка отправки формы */
  private readonly _submitButton: HTMLButtonElement;
  
  /** Отображение ошибок формы */
  private readonly _errorElement: HTMLElement | null;
  
  /** Список обработчиков событий для последующей очистки */
  private readonly _handlers: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];

  /**
   * Создает экземпляр формы адреса доставки и оплаты.
   * @param {HTMLFormElement} container - HTML элемент формы
   * @param {IEvents} events - Система событий для коммуникации
   */
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
    this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
    this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
    this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    this._errorElement = container.querySelector('.form__errors');
  }

  /**
   * Инициализирует форму, добавляя обработчики событий.
   */
  public init(): void {
    // Обработчики для кнопок оплаты
    this._addHandler(this._cardButton, 'click', this._handlePaymentClick.bind(this));
    this._addHandler(this._cashButton, 'click', this._handlePaymentClick.bind(this));

    // Обработчик для поля ввода адреса
    this._addHandler(this._addressInput, 'input', this._handleAddressInput.bind(this));

    // Обработчик отправки формы
    this._addHandler(this.container as HTMLElement, 'submit', this._handleSubmit.bind(this));
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
   * Обрабатывает клик по кнопке выбора способа оплаты.
   * @param {Event} e - Событие клика
   * @private
   */
  private _handlePaymentClick(e: Event): void {
    e.preventDefault();
    const button = e.currentTarget as HTMLButtonElement;
    if (button.name === 'card' || button.name === 'cash') {
      this._selectPaymentMethod(button.name as PaymentMethod);
    }
  }

  /**
   * Обрабатывает ввод адреса доставки.
   * @private
   */
  private _handleAddressInput(): void {
    const newAddress = this._addressInput.value;
    if (this._address !== newAddress) {
      this._address = newAddress;
      this._updateFormState('address', newAddress);
    }
  }

  /**
   * Обрабатывает отправку формы.
   * @param {Event} e - Событие отправки формы
   * @private
   */
  private _handleSubmit(e: Event): void {
    e.preventDefault();
    if (this.valid) {
      this.events.emit('orderAddress:submit', this.state);
    }
  }

  /**
   * Устанавливает выбранный способ оплаты.
   * @param {PaymentMethod} method - Выбранный способ оплаты
   * @private
   */
  private _selectPaymentMethod(method: PaymentMethod): void {
    // Если метод уже выбран, не делаем ничего
    if (this._payment === method) return;

    // Переключаем классы активности кнопок
    const buttons = { card: this._cardButton, cash: this._cashButton };
    Object.entries(buttons).forEach(([key, button]) => {
      button.classList.toggle('button_alt-active', key === method);
    });

    // Устанавливаем способ оплаты
    this._payment = method;
    this.events.emit('paymentMethodSelected', { paymentMethod: method });
    this._updateFormState('payment', method);
  }

  /**
   * Проверяет валидность формы и обновляет UI соответственно.
   * @returns {boolean} Признак валидности формы
   * @private
   */
  private _validateForm(): boolean {
    const isValid = Boolean(this._payment && this._address);

    // Активируем/деактивируем кнопку отправки
    this._submitButton.disabled = !isValid;

    // Работа с ошибками
    if (this._errorElement) {
      if (!this._payment) {
        this._errorElement.textContent = 'Пожалуйста, выберите способ оплаты!';
      } else if (!this._address) {
        this._errorElement.textContent = 'Пожалуйста, введите адрес доставки!';
      } else {
        this._errorElement.textContent = '';
      }
    }

    // Отправляем событие изменения валидности формы
    this.events.emit('formValidityChanged', { isValid });
    
    return isValid;
  }

  /**
   * Обновляет состояние формы при изменении данных.
   * @param {string} field - Название поля
   * @param {string} value - Новое значение
   * @private
   */
  private _updateFormState(field: string, value: string): void {
    // Проверяем валидность и обновляем UI
    this._validateForm();

    // Отправляем событие изменения состояния
    this.events.emit('formChange', {
      ...this.state,
      [field]: value,
    });
  }

  /**
   * Сбрасывает форму в исходное состояние.
   */
  public reset(): void {
    // Сбрасываем внутренние состояния
    this._payment = '';
    this._address = '';

    // Сбрасываем стили кнопок оплаты
    [this._cardButton, this._cashButton].forEach((button) => {
      button.classList.remove('button_alt-active');
    });

    // Сбрасываем поле ввода адреса
    this._addressInput.value = '';

    // Скрываем сообщения об ошибках
    if (this._errorElement) {
      this._errorElement.textContent = '';
    }

    // Деактивируем кнопку отправки
    this._submitButton.disabled = true;

    // Отправляем событие о сбросе
    this.events.emit('formReset', this.state);
  }

  /**
   * Возвращает текущее состояние формы.
   * @returns {IOrderAddressFormState} Состояние формы
   */
  get state(): IOrderAddressFormState {
    return {
      payment: this._payment,
      address: this._address,
    };
  }

  /**
   * Возвращает выбранный способ оплаты.
   * @returns {PaymentMethod | ''} Способ оплаты или пустая строка
   */
  get payment(): PaymentMethod | '' {
    return this._payment;
  }

  /**
   * Устанавливает способ оплаты.
   * @param {PaymentMethod | ''} value - Способ оплаты
   */
  set payment(value: PaymentMethod | '') {
    if (!value || value === this._payment) return;
    
    if (value === 'card' || value === 'cash') {
      this._selectPaymentMethod(value);
    }
  }

  /**
   * Возвращает текущий адрес доставки.
   * @returns {string} Адрес доставки
   */
  get address(): string {
    return this._address;
  }

  /**
   * Устанавливает адрес доставки.
   * @param {string} value - Адрес доставки
   */
  set address(value: string) {
    if (this._address === value) return;
    
    this._address = value;
    this._updateFormState('address', value);
  }

	/**
	 * Сеттер для свойства valid - обновляет состояние кнопки отправки формы
	 * @param {boolean} value - Новое значение валидности формы
	 */
	set valid(value: boolean) {
		super.valid = value; // Вызываем сеттер родительского класса
	}

	/**
	 * Геттер для свойства valid - возвращает текущее состояние валидности формы
	 * @returns {boolean} - Текущее значение валидности формы
	 */
	get valid(): boolean {
		// Проверяем, что все обязательные поля заполнены
		const addressValid = !!this._addressInput?.value.trim();
		const paymentValid = !!this._payment;
		return addressValid && paymentValid;
	}

  /**
   * Переопределяем метод родительского класса для обработки изменений полей формы.
   * @param {string} field - Название поля
   * @param {string} value - Значение поля
   * @override
   */
	protected onInputChange(field: keyof IOrderAddressFormState, value: string): void {
		// Вызываем родительский метод
		super.onInputChange(field, value);

		// Дополнительная обработка для наших полей
		if (field === 'payment' && (value === 'card' || value === 'cash')) {
			this.payment = value as PaymentMethod;
		} else if (field === 'address') {
			this.address = value;
		}
	}

}