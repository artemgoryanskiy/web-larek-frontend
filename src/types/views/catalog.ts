import { IView } from './base';

export interface IProductCardProps {
	id: string;
	title: string;
	price: number;
	image: string;
	onSelect: (id: string) => void;
}

export interface ICatalogViewProps {
	products: IProductCardProps[];
	loading: boolean;
	error: string | null;
}

export interface ICatalogView extends IView<ICatalogViewProps> {
	onProductSelect(callback: (id: string) => void): void;
}
