import { IView } from './base';

export interface ICartItemProps {
	id: string;
	title: string;
	price: number;
	quantity: number;
	image: string;
	onRemove: (id: string) => void;
	onQuantityChange: (id: string, quantity: number) => void;
}

export interface ICartViewProps {
	items: ICartItemProps[];
	total: number;
	count: number;
}

export interface ICartView extends IView<ICartViewProps> {
	onItemRemove(callback: (id: string) => void): void;
	onItemQuantityChange(callback: (id: string, quantity: number) => void): void;
	onCheckout(callback: () => void): void;
}
