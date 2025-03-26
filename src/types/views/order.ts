import { IView } from './base';

export interface IOrderViewProps {
	step: 'address' | 'payment' | 'confirmation';
	address: string;
	payment: 'card' | 'cash';
	loading: boolean;
	error: string | null;
}

export interface IOrderView extends IView<IOrderViewProps> {
	onAddressSubmit(callback: (address: string) => void): void;
	onPaymentSubmit(callback: (payment: 'card' | 'cash') => void): void;
	onConfirm(callback: () => void): void;
}
