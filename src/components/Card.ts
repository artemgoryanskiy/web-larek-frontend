import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IProduct } from '../types';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard extends IProduct {
	/** Флаг, показывающий находится ли товар в корзине */
	isInCart: boolean;
}

export class Card extends Component<ICard> {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._image = ensureElement<HTMLImageElement>(
			`.${blockName}__image`,
			container
		);
		this._category = ensureElement<HTMLElement>(
			`.${blockName}__category`,
			container
		);
		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._description = ensureElement<HTMLElement>(
			`.${blockName}__description`,
			container
		);
		this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
		this._button = ensureElement<HTMLButtonElement>(
			`.${blockName}__button`,
			container
		);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
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

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (!this._description) return; // Если описание элемента отсутствует
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
}

export class CatalogItem extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}
}


