import { BaseView } from './BaseView';

export class OrderView extends BaseView {
	private addressInput: HTMLInputElement;
	private paymentButtons: NodeListOf<HTMLButtonElement>;

	constructor(containerSelector: string) {
		super(containerSelector);

		this.addressInput = this.container.querySelector('.form__input') as HTMLInputElement;
		this.paymentButtons = this.container.querySelectorAll('.order__buttons .button') as NodeListOf<HTMLButtonElement>;
	}

	getAddress(): string {
		return this.addressInput.value;
	}

	onPaymentSelect(callback: (method: string) => void): void {
		this.paymentButtons.forEach((button: HTMLButtonElement) =>
			button.addEventListener('click', () => {
				callback(button.textContent || '');
			})
		);
	}

	onSubmit(callback: (address: string) => void): void {
		this.on('submit', '.form', (event) => {
			event.preventDefault();
			callback(this.getAddress());
		});
	}
}