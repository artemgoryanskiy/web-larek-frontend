import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

/**
 * @interface ICardActions
 * @description Действия, доступные для карточки товара
 */
interface ICardActions {
  /** Обработчик клика по карточке или кнопке */
  onClick: (event: MouseEvent) => void;
}

/**
 * @interface IBasketCardActions
 * @description Действия, доступные для карточки товара в корзине
 */
interface IBasketCardActions {
  /** Обработчик удаления товара из корзины */
  onRemove: (event: MouseEvent) => void;
}

/**
 * @interface ICard
 * @description Базовые данные карточки товара
 */
export interface ICard {
  /** Уникальный идентификатор */
  id: string;
  /** Название товара */
  title: string;
  /** Цена товара */
  price: number | null;
  /** Категория товара - опционально */
  category?: string;
  /** Описание товара (может быть строкой или массивом строк) - опционально */
  description?: string | string[];
  /** URL изображения - опционально */
  image?: string;
  /** Флаг, показывающий находится ли товар в корзине */
  isInCart: boolean;
}

/**
 * @interface IBasketCardData
 * @extends ICard
 * @description Данные для карточки товара в корзине
 */
export interface IBasketCardData extends ICard {
  /** Порядковый номер товара в корзине */
  index: number;
}

/**
 * @class BaseCard
 * @extends Component<ICard>
 * @description Базовый класс для карточек товаров с основными свойствами
 */
export class BaseCard extends Component<ICard> {
  /** Элемент с названием товара */
  protected _title: HTMLElement;
  
  /** Элемент с ценой товара */
  protected _price: HTMLElement;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий карточку
   */
  constructor(container: HTMLElement) {
    super(container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
  }

  /**
   * Устанавливает идентификатор товара в атрибут data-id
   * @param {string} value - Идентификатор товара
   */
  set id(value: string) {
    this.container.dataset.id = value;
  }

  /**
   * Устанавливает название товара
   * @param {string} value - Название товара
   */
  set title(value: string) {
    this.setText(this._title, value);
  }

  /**
   * Устанавливает цену товара с символом валюты
   * @param {number|null} value - Цена товара или null
   */
  set price(value: number | null) {
    this.setText(this._price, value === null ? '' : `${value} ₽`);
  }

  /**
   * Отображает данные в карточке
   * @param {ICard} data - Данные товара
   * @returns {HTMLElement} DOM-элемент карточки
   */
  render(data: ICard): HTMLElement {
    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    return this.container;
  }
}

/**
 * @class DetailCard
 * @extends BaseCard
 * @description Карточка с детальной информацией о товаре
 */
export class DetailCard extends BaseCard {
  /** Элемент с изображением товара */
  protected _image: HTMLImageElement;
  
  /** Элемент с категорией товара */
  protected _category: HTMLElement;
  
  /** Элемент с описанием товара */
  protected _description: HTMLElement;
  
  /** Кнопка действия */
  protected _button: HTMLButtonElement;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий карточку
   * @param {ICardActions} [actions] - Обработчики действий для карточки
   */
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._category = ensureElement<HTMLElement>('.card__category', container);

    try {
      this._description = ensureElement<HTMLElement>('.card__text', container);
    } catch (e) {
      this._description = document.createElement('p');
      this._description.className = 'card__text';
    }

    this._button = ensureElement<HTMLButtonElement>('.card__button', container);

    if (actions?.onClick) {
      this._button.addEventListener('click', actions.onClick);
    }
  }

  /**
   * Устанавливает изображение товара
   * @param {string} value - URL изображения
   */
  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  /**
   * Устанавливает категорию товара
   * @param {string} value - Название категории
   */
  set category(value: string) {
    this.setText(this._category, value);
  }

  /**
   * Устанавливает описание товара (строку или массив строк)
   * @param {string|string[]} value - Описание товара
   */
  set description(value: string | string[]) {
    if (!this._description) return;
    
    if (Array.isArray(value)) {
      const newDescriptions = value.map((str) => {
        const descTemplate = this._description.cloneNode() as HTMLElement;
        this.setText(descTemplate, str);
        return descTemplate;
      });
      this._description.replaceWith(...newDescriptions);
    } else {
      this.setText(this._description, value);
    }
  }

  /**
   * Отображает детальные данные товара
   * @param {ICard} data - Данные товара
   * @returns {HTMLElement} DOM-элемент карточки
   * @override
   */
  render(data: ICard): HTMLElement {
    super.render(data);
    
    if (data.image) this.image = data.image;
    if (data.category) this.category = data.category;
    if (data.description) this.description = data.description;

    // Установка текста кнопки в зависимости от статуса корзины
    if (data.isInCart !== undefined) {
      this.setText(this._button, data.isInCart ? 'Убрать из корзины' : 'В корзину');
    }

    return this.container;
  }
}

/**
 * @class CatalogItemCard
 * @extends BaseCard
 * @description Карточка товара для каталога
 */
export class CatalogItemCard extends BaseCard {
  /** Элемент с изображением товара */
  protected _image: HTMLImageElement;
  
  /** Элемент с категорией товара */
  protected _category: HTMLElement;
  
  /** Кнопка действия (необязательная) */
  protected _button?: HTMLButtonElement;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий карточку
   * @param {ICardActions} [actions] - Обработчики действий для карточки
   */
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._category = ensureElement<HTMLElement>('.card__category', container);

    try {
      this._button = ensureElement<HTMLButtonElement>('.card__button', container);
      if (actions?.onClick) {
        this._button.addEventListener('click', actions.onClick);
      }
    } catch (e) {
      // Если кнопка не найдена, добавляем обработчик на весь контейнер
      if (actions?.onClick) {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  /**
   * Устанавливает изображение товара
   * @param {string} value - URL изображения
   */
  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  /**
   * Устанавливает категорию товара
   * @param {string} value - Название категории
   */
  set category(value: string) {
    this.setText(this._category, value);
  }

  /**
   * Отображает данные в карточке каталога
   * @param {ICard} data - Данные товара
   * @returns {HTMLElement} DOM-элемент карточки
   * @override
   */
  render(data: ICard): HTMLElement {
    super.render(data);
    
    if (data.image) this.image = data.image;
    if (data.category) this.category = data.category;

    return this.container;
  }
}

/**
 * @class BasketCard
 * @extends BaseCard
 * @description Карточка товара в корзине
 */
export class BasketCard extends BaseCard {
  /** Элемент с порядковым номером */
  protected _index: HTMLElement;
  
  /** Кнопка удаления товара из корзины */
  protected _deleteButton: HTMLButtonElement;

  /**
   * @constructor
   * @param {HTMLElement} container - DOM-элемент, содержащий карточку
   * @param {IBasketCardActions} [actions] - Обработчики действий для карточки корзины
   */
  constructor(container: HTMLElement, actions?: IBasketCardActions) {
    super(container);

    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    if (actions?.onRemove) {
      this._deleteButton.addEventListener('click', actions.onRemove);
    }
  }

  /**
   * Устанавливает порядковый номер товара в корзине
   * @param {number} value - Порядковый номер
   */
  set index(value: number) {
    this.setText(this._index, value.toString());
  }

  /**
   * Устанавливает цену товара с указанием валюты "синапсов"
   * @param {number|null} value - Цена товара или null
   * @override
   */
  set price(value: number | null) {
    this.setText(this._price, value === null ? '' : `${value} синапсов`);
  }

  /**
   * Отображает данные в карточке корзины
   * @param {IBasketCardData} data - Данные товара в корзине
   * @returns {HTMLElement} DOM-элемент карточки
   * @override
   */
  render(data: IBasketCardData): HTMLElement {
    super.render(data);
    this.index = data.index;
    return this.container;
  }
}