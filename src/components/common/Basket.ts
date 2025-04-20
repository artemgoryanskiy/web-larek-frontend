import { Component } from '../base/Component';
import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/events';

/**
 * @interface IBasketView
 * @description Интерфейс, описывающий состояние представления корзины
 */
interface IBasketView {
  /** Массив HTML-элементов товаров в корзине */
  items: HTMLElement[];
  /** Общая сумма товаров в корзине */
  total: number;
  /** Необязательный массив идентификаторов выбранных товаров */
  selected?: string[];
}

/**
 * @class Basket
 * @extends Component<IBasketView>
 * @description Класс для управления представлением корзины товаров
 */
export class Basket extends Component<IBasketView> {
  /**
   * Контейнер для списка товаров в корзине
   * @private
   */
  private _list: HTMLElement;
  
  /**
   * Элемент для отображения общей суммы заказа
   * @private
   * @readonly
   */
  private readonly _total: HTMLElement | null;
  
  /**
   * Кнопка оформления заказа
   * @private
   * @readonly
   */
  private readonly _button: HTMLElement | null;

  /**
   * @constructor
   * @param {HTMLElement} container - Корневой элемент компонента корзины
   * @param {EventEmitter} events - Эмиттер событий для коммуникации с другими компонентами
   */
  constructor(container: HTMLElement, protected events: EventEmitter) {
    super(container);

    // Инициализация элементов корзины
    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__price');
    this._button = this.container.querySelector('.basket__button');

    // Привязка события к кнопке оформления заказа
    this._button?.addEventListener('click', this.handleOrderOpen);

    // Устанавливаем начальное состояние
    this.clear();
  }

  /**
   * Обработчик клика по кнопке оформления заказа
   * @private
   * @fires Basket#order:open - Событие открытия формы оформления заказа
   */
  private handleOrderOpen = (): void => {
    this.events.emit('order:open');
  };

  /**
   * Устанавливает элементы корзины и обновляет отображение
   * @param {HTMLElement[]} items - Массив HTML-элементов товаров для отображения в корзине
   */
  set items(items: HTMLElement[]) {
    if (items.length > 0) {
      this._renderItems(items);
      this.setDisabled(this._button, false);
    } else {
      this.clear();
    }
  }

  /**
   * Отображает корзину с товарами и общей суммой
   * @param {IBasketView} state - Данные для отображения в корзине
   * @returns {HTMLElement} Элемент корзины
   */
  render(state: IBasketView): HTMLElement {
    if (state.items.length > 0) {
      this._renderItems(state.items);
      this.setText(this._total, formatNumber(state.total));
      this.setDisabled(this._button, false);
    } else {
      this.clear();
    }
    return this.container;
  }

  /**
   * Отображает список товаров в корзине
   * @private
   * @param {HTMLElement[]} items - Массив HTML-элементов товаров
   */
  private _renderItems(items: HTMLElement[]): void {
    this._list.replaceChildren(...items);
  }

  /**
   * Очищает корзину и устанавливает пустое состояние
   * @private
   */
  private clear(): void {
    this._renderEmptyState();
    this.setDisabled(this._button, true);
    this.setText(this._total, formatNumber(0));
  }

  /**
   * Отображает состояние пустой корзины
   * @private
   */
  private _renderEmptyState(): void {
    this._list.replaceChildren(
      createElement<HTMLParagraphElement>('p', {
        textContent: 'Корзина пуста',
      })
    );
  }

  /**
   * Сбрасывает состояние корзины в начальное (пустое)
   * @public
   */
  public reset(): void {
    this.clear();
  }
}