export interface ICreateOrderRequest {
	items: Array<{
		productId: string;
		quantity: number;
	}>;
	address: string;
	payment: 'card' | 'cash';
}
