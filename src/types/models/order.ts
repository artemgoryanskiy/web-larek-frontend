import { IModel } from './base';

export interface IOrderState {
	step: 'address' | 'payment' | 'confirmation';
	address: string;
	payment: 'card' | 'cash';
	loading: boolean;
	error: string | null;
	orderId: string | null;
}

export interface IOrderModel extends IModel<IOrderState> {
	setAddress(address: string): void;
	setPayment(payment: 'card' | 'cash'): void;
	submit(): Promise<void>;
}
