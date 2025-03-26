import { IApiProduct } from '../api/responses';
import { IModel } from './base';

export interface ICatalogState {
	products: IApiProduct[];
	loading: boolean;
	error: string | null;
	selected: string | null;
}

export interface ICatalogModel extends IModel<ICatalogState> {
	loadProducts(): Promise<void>;
	selectProduct(id: string): void;
	getProduct(id: string): IApiProduct | undefined;
}
