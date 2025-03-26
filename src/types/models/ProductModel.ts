export interface ProductData {
	id: string;
	title: string;
	description: string;
	category: string;
	image?: string;
	price: number;
}

export class ProductModel {
	id: string;
	title: string;
	description: string;
	category: string;
	image?: string;
	price: number;

	constructor(data: ProductData) {
		this.id = data.id;
		this.title = data.title;
		this.description = data.description;
		this.category = data.category;
		this.image = data.image;
		this.price = data.price;
	}

	get priceFormatted() {
		return `${this.price.toLocaleString('ru-RU')} синапсов`
	}
}