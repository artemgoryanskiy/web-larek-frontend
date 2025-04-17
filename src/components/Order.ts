import { IOrder, IOrderAddressFormState, IOrderContactFormState } from '../types';
import { IEvents } from './base/events';

/**
 * Класс для управления данными заказа
 */
export class Order implements IOrder {
	items: string[] = [];
	address = '';
	payment = '';
	email = '';
	phone = '';
	private _valid = false;
	private _errors = '';

	constructor(private template: HTMLTemplateElement, private events: IEvents) {
		this.events.on('orderAddress:submit', this.setAddress.bind(this));
		this.events.on('orderContact:submit', this.setContact.bind(this));
	}

	addItem(id: string): void {
		if (this.hasItem(id)) return;
		this.items = [...this.items, id];
		this.emitEvent('order:items:changed', { items: this.items });
	}

	removeItem(id: string): void {
		this.items = this.items.filter(item => item !== id);
		this.emitEvent('order:items:changed', { items: this.items });
	}

	hasItem(id: string): boolean {
		return this.items.includes(id);
	}

	clear(): void {
		this.items = [];
		this.emitEvent('order:items:changed', { items: this.items });
	}

	setContact(contactData: IOrderContactFormState): void {
		const { email, phone } = contactData;
		this.email = email;
		this.phone = phone;
		this.emitEvent('order:contact:changed', { email, phone });
	}

	setAddress(addressData: IOrderAddressFormState): void {
		const { address, payment } = addressData;
		this.address = address;
		this.payment = payment;
		this.emitEvent('order:address:changed', { address, payment });
	}

	set valid(value: boolean) {
		this._valid = value;
		this.emitEvent('order:validationChange', { valid: value });
	}

	get valid(): boolean {
		return this._valid;
	}

	set errors(value: string) {
		this._errors = value;
		this.emitEvent('order:errorsChange', { errors: value });
	}

	get errors(): string {
		return this._errors;
	}

	get count(): number {
		return this.items.length;
	}

	toJSON(): IOrder {
		return {
			items: this.items,
			address: this.address,
			payment: this.payment,
			email: this.email,
			phone: this.phone,
		};
	}

	private emitEvent(event: string, data: object): void {
		this.events.emit(event, data);
	}
}