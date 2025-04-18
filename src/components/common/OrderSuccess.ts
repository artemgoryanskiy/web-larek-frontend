import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

/**
 * @interface IOrderSuccessState
 * @description Интерфейс для состояния компонента успешного заказа
 */
interface IOrderSuccessState {
  /** Заголовок сообщения об успешном заказе */
  title: string;
  /** Сумма списанных средств */
  amount: string;
  /** Валюта (синапсы, рубли и т.д.) */
  currency: string;
}

/**
 * @interface ISuccessActions
 * @description Интерфейс для определения обработчиков событий компонента
 */
interface ISuccessActions {
  /** Функция-обработчик нажатия на кнопку закрытия */
  onClick: () => void;
}

/**
 * @class OrderSuccess
 * @extends Component<IOrderSuccessState>
 * @description Компонент для отображения успешного оформления заказа
 */
export class OrderSuccess extends Component<IOrderSuccessState> {
  /** Элемент заголовка сообщения */
  private readonly _title: HTMLElement;
  
  /** Элемент для отображения списанной суммы */
  private readonly _description: HTMLElement;
  
  /** Кнопка закрытия компонента */
  private readonly _closeButton: HTMLButtonElement;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий компонент
   * @param {ISuccessActions} actions - Объект с обработчиками событий
   */
  constructor(container: HTMLElement, private readonly actions: ISuccessActions) {
    super(container);

    // Находим необходимые элементы в DOM
    this._title = ensureElement<HTMLElement>('.order-success__title', this.container);
    this._description = ensureElement<HTMLElement>('.order-success__description', this.container);
    this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
    
    // Привязываем обработчик события к кнопке закрытия
    this._closeButton.addEventListener('click', this.handleCloseClick);
  }

  /**
   * Обработчик клика по кнопке закрытия
   * @private
   */
  private handleCloseClick = (): void => {
    this.actions.onClick();
  };

  /**
   * Отрисовывает компонент согласно переданному состоянию
   * @param {IOrderSuccessState} state - Состояние компонента для отображения
   * @returns {HTMLElement} Корневой DOM-элемент компонента
   * @override
   */
  render(state: IOrderSuccessState): HTMLElement {
    // Обновляем заголовок
    this.setText(this._title, state.title);

    // Формируем текст с суммой и валютой
    const amountText = `Списано ${state.amount} ${state.currency}`;
    this.setText(this._description, amountText);

    return this.container;
  }
}