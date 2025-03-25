import { ProductModel } from "./models";

export interface ProductView {
	id: string;
	name: string;
	imageUrl: string;
	price: string; // Цена в виде строки для UI
}

export const transformProductModelToView = (model: ProductModel): ProductView => ({
	id: model.id,
	name: model.title,
	imageUrl: model.image,
	price: model.price ? `${model.price} ₽` : "Цена не указана",
});
