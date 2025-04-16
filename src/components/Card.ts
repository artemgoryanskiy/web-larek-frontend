import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

/**
 * Возможные категории товаров
 */
export type ProductCategory =
	| 'другое'
	| 'софт-скил'
	| 'хард-скил'
	| 'кнопка'
	| 'дополнительное';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface IProductData {
	/** Уникальный идентификатор товара */
	id: string;
	/** Название товара */
	title: string;
	/** Описание товара */
	description: string;
	/** Цена товара */
	price: number;
	/** Категория товара */
	category: ProductCategory;
	/** Ссылка на изображение товара */
	image: string;
}

export interface ICard extends IProductData {
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

	constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
		this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._description = container.querySelector(`.${blockName}__description`);
		this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
		this._button = container.querySelector(`.${blockName}__button`);

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
		this.setImage(this._image, value, this.title)
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(...value.map(str => {
				const descTemplate = this._description.cloneNode() as HTMLElement;
				this.setText(descTemplate, str);
				return descTemplate;
			}));
		} else {
			this.setText(this._description, value);
		}
	}
}

export type CardCatalog = Pick<ICard, 'category' | 'title' | 'image' | 'price'>

export type CardBasket = Pick<ICard, 'title' | 'price'>