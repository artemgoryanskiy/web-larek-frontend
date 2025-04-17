import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IProduct } from '../types';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

interface IBasketCardActions {
	onRemove: (event: MouseEvent) => void;
}

export interface IBasketCardData extends ICard {
	index: number;
}


export interface ICard extends IProduct {
	/** Флаг, показывающий находится ли товар в корзине */
	isInCart: boolean;
}

export class BaseCard extends Component<ICard> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, '');
		} else {
			this.setText(this._price, `${value} ₽`);
		}
	}

	get price(): number | null {
		const value = this._price.textContent?.replace(/[^\d]/g, '');
		return value ? parseInt(value, 10) : null;
	}

	render(data: ICard): HTMLElement {
		this.id = data.id;
		this.title = data.title;
		this.price = data.price;
		return this.container;
	}
}

export class DetailCard extends BaseCard {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;

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

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

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

	get description(): string {
		return this._description?.textContent || '';
	}

	setButtonState(isDisabled: boolean) {
		this._button.disabled = isDisabled;
	}

	setButtonText(text: string) {
		this.setText(this._button, text);
	}

	render(data: ICard): HTMLElement {
		super.render(data);
		if (data.image) this.image = data.image;
		if (data.category) this.category = data.category;
		if (data.description) this.description = data.description;

		// Установка состояния кнопки в зависимости от того, в корзине ли товар
		if (data.isInCart !== undefined) {
			this.setButtonText(data.isInCart ? 'Убрать из корзины' : 'В корзину');
		}

		return this.container;
	}

}

export class CatalogItemCard extends BaseCard {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _button: HTMLButtonElement;

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

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	setButtonState(isDisabled: boolean) {
		if (this._button) {
			this._button.disabled = isDisabled;
		}
	}

	setButtonText(text: string) {
		if (this._button) {
			this.setText(this._button, text);
		}
	}

	render(data: ICard): HTMLElement {
		super.render(data);
		if (data.image) this.image = data.image;
		if (data.category) this.category = data.category;

		return this.container;
	}

}

export class BasketCard extends BaseCard {
	protected _index: HTMLElement;
	protected _deleteButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: IBasketCardActions) {
		super(container);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

		// Добавление обработчика на кнопку удаления
		if (actions?.onRemove) {
			this._deleteButton.addEventListener('click', actions.onRemove);
		}
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}

	get index(): number {
		const value = this._index.textContent;
		return value ? parseInt(value, 10) : 0;
	}

	// Переопределяем метод price, чтобы использовать символ "синапсов" вместо "₽"
	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, '');
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	render(data: IBasketCardData): HTMLElement {
		super.render(data);
		this.index = data.index;
		return this.container;
	}
}
