import {BaseView} from './BaseView';

export class HeaderView extends BaseView {
	private basketButton: HTMLElement;
	private basketCounter: HTMLElement;

	constructor(containerSelector: string) {
		super(containerSelector);
		this.basketButton = this.container.querySelector('.header__basket') as HTMLButtonElement;
		this.basketCounter = this.container.querySelector('.header__basket-counter') as HTMLSpanElement;
	}

	setBasketCount(count: number): void {
		this.basketCounter.textContent = count.toString();
	}

	onBasketClick(callback: () => void): void {
		this.basketButton.addEventListener('click', callback);
	}
}