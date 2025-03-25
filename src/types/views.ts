import { ProductModel } from "./models";

export interface ProductView {
	id: string;
	name: string;
	imageUrl: string;
	price: string;
}

export const transformProductModelToView = (model: ProductModel): ProductView => ({
	id: model.id,
	name: model.title,
	imageUrl: model.image,
	price: model.price ? `${model.price} ₽` : "Цена не указана",
});
