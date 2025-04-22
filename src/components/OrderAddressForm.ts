import { Form, IFormState } from './common/Form';
import { IOrderAddressFormState } from '../types';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

/**
 * Типы доступных методов оплаты
 */
export type PaymentMethod = 'card' | 'cash';

/**
 * Класс для обработки формы с выбором способа оплаты и адресом доставки.
 * Управляет выбором метода оплаты и вводом адреса доставки.
 */
export class OrderAddressForm extends Form<IOrderAddressFormState> {
  /** Кнопка выбора оплаты картой */
  private readonly _cardButton: HTMLButtonElement;
  
  /** Кнопка выбора оплаты наличными */
  private readonly _cashButton: HTMLButtonElement;
  
  /** Список обработчиков событий для последующей очистки */
  private readonly _handlers: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];

  /** Выбранный способ оплаты */
  private _payment: PaymentMethod | '' = '';

  /**
   * Создает экземпляр формы адреса доставки и оплаты.
   * @param {HTMLFormElement} container - HTML элемент формы
   * @param {IEvents} events - Система событий для коммуникации
   */
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
    this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
  }

  /**
   * Инициализирует форму, добавляя обработчики событий.
   */
  public init(): void {
    // Обработчики для кнопок оплаты
    this._addHandler(this._cardButton, 'click', this._handlePaymentClick.bind(this));
    this._addHandler(this._cashButton, 'click', this._handlePaymentClick.bind(this));
    
    // Добавим обработчик изменения поля адреса
    const addressInput = this.container.elements.namedItem('address') as HTMLInputElement;
    if (addressInput) {
      this._addHandler(addressInput, 'input', this._handleAddressInput.bind(this));
    }
    
    // Подписываемся на события валидации от модели
    this.events.on('orderAddress:validationErrors', this._handleValidationResult.bind(this));
    this.events.on('orderAddress:validation', this._handleValidationResult.bind(this));
    
    // Добавляем обработчик отправки формы
    this._addHandler(this.container, 'submit', this._handleFormSubmit.bind(this));
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
   * Устанавливает выбранный способ оплаты и отправляет событие.
   * @param {PaymentMethod} method - Выбранный способ оплаты
   * @private
   */
  private _selectPaymentMethod(method: PaymentMethod): void {
    // Переключаем классы активности кнопок
    this._cardButton.classList.toggle('button_alt-active', method === 'card');
    this._cashButton.classList.toggle('button_alt-active', method === 'cash');
    
    // Сохраняем выбранный метод
    this._payment = method;
    
    // Отправляем событие об изменении способа оплаты
    this.events.emit('orderAddress.payment:change', {
      field: 'payment',
      value: method
    });
  }

  /**
   * Обрабатывает изменение поля адреса.
   * @param {Event} e - Событие ввода
   * @private
   */
  private _handleAddressInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    
    // Отправляем событие об изменении адреса
    this.events.emit('orderAddress.address:change', {
      field: 'address',
      value: input.value
    });
  }

  /**
   * Обрабатывает результат валидации от модели
   * @param {object} result - Результат валидации
   * @private
   */
  private _handleValidationResult(result: { valid: boolean; errors: string[] }): void {
    // Обновляем состояние формы через базовый класс
    this.valid = result.valid;
    this.errors = result.errors.join(', ');
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} e - Событие отправки формы
   * @private
   */
  private _handleFormSubmit(e: Event): void {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = new FormData(this.container);
    const address = formData.get('address') as string;
    
    // Определяем выбранный способ оплаты
    const payment = this._payment;
    
    // Подготавливаем данные формы
    const data = { payment, address };

    // Отправляем событие с данными формы
    this.events.emit('orderAddress:submit', data);
  }

  /**
   * Добавляет обработчик события с возможностью последующей очистки
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
   * Отображает ошибки валидации в форме
   * @param {string[]} errors - Массив сообщений об ошибках
   */
  public showErrors(errors: string[]): void {
    this.valid = false;
    this.errors = errors.join(', ');
  }

  /**
   * Сбрасывает форму в исходное состояние
   */
  public reset(): void {
    // Сбрасываем стили кнопок оплаты
    [this._cardButton, this._cashButton].forEach((button) => {
      button.classList.remove('button_alt-active');
    });
    
    // Сбрасываем сохраненный метод оплаты
    this._payment = '';
    
    // Очищаем поле адреса
    const addressInput = this.container.elements.namedItem('address') as HTMLInputElement;
    if (addressInput) {
      addressInput.value = '';
    }
    
    // Сбрасываем состояние через базовый класс
    this.valid = false;
    this.errors = '';
  }

  /**
   * Расширенный метод рендеринга для обработки специфических полей
   * @param {Partial<IOrderAddressFormState> & IFormState} state - Состояние формы
   * @returns {HTMLFormElement} HTML-элемент формы
   * @override
   */
  render(state: Partial<IOrderAddressFormState> & IFormState): HTMLFormElement {
    // Обрабатываем способ оплаты, если он указан
    if (state.payment) {
      const payment = state.payment as PaymentMethod;
      this._cardButton.classList.toggle('button_alt-active', payment === 'card');
      this._cashButton.classList.toggle('button_alt-active', payment === 'cash');
      this._payment = payment;
    }
    
    // Обрабатываем адрес, если он указан
    if (state.address !== undefined) {
      const addressInput = this.container.elements.namedItem('address') as HTMLInputElement;
      if (addressInput && addressInput.value !== state.address) {
        addressInput.value = state.address;
      }
    }
    
    // Устанавливаем состояние валидности
    if (state.valid !== undefined) {
      this.valid = state.valid;
    }
    
    // Устанавливаем ошибки
    if (state.errors !== undefined) {
      this.errors = state.errors.join(', ');
    }

    return this.container;
  }
}