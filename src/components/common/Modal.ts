import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

/**
 * @interface IModalData
 * @description Интерфейс данных для модального окна
 */
interface IModalData {
  /** HTML-элемент с содержимым модального окна */
  content: HTMLElement;
}

/**
 * @class Modal
 * @extends Component<IModalData>
 * @description Класс для управления модальным окном
 */
export class Modal extends Component<IModalData> {
  /** Кнопка закрытия модального окна */
  private readonly _closeButton: HTMLButtonElement;
  
  /** Контейнер для содержимого модального окна */
  private readonly _content: HTMLElement;
  
  /** Флаг состояния открытия модального окна */
  private _isOpen = false;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий модальное окно
   * @param {IEvents} events - Объект для работы с событиями
   */
  constructor(container: HTMLElement, protected readonly events: IEvents) {
    super(container);

    this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this._content = ensureElement<HTMLElement>('.modal__content', container);

    // Привязка обработчиков событий
    this._closeButton.addEventListener('click', this.handleClose);
    this.container.addEventListener('click', this.handleClose);
    this._content.addEventListener('click', this.handleContentClick);
  }

  /**
   * Устанавливает содержимое модального окна
   * @param {HTMLElement | null} value - Элемент для отображения или null для очистки
   */
  set content(value: HTMLElement | null) {
    this._content.replaceChildren(value || '');
  }

  /**
   * Возвращает состояние открытия модального окна
   * @returns {boolean} true, если окно открыто
   */
  get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Обработчик клика по кнопке закрытия или области вне содержимого
   * @private
   */
  private handleClose = (): void => {
    this.close();
  };

  /**
   * Обработчик клика по содержимому модального окна
   * Предотвращает всплытие события для предотвращения закрытия модального окна
   * @param {Event} event - Объект события
   * @private
   */
  private handleContentClick = (event: Event): void => {
    event.stopPropagation();
  };

  /**
   * Открывает модальное окно
   * @public
   */
  public open(): void {
    this.container.classList.add('modal_active');
    this._isOpen = true;
    this.events.emit('modal:open');
  }

  /**
   * Закрывает модальное окно и очищает его содержимое
   * @public
   */
  public close(): void {
    this.container.classList.remove('modal_active');
    this.content = null;
    this._isOpen = false;
    this.events.emit('modal:close');
  }

  /**
   * Рендерит модальное окно с заданными данными и открывает его
   * @param {IModalData} data - Данные для рендеринга
   * @returns {HTMLElement} Контейнер модального окна
   * @override
   */
  render(data: IModalData): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}