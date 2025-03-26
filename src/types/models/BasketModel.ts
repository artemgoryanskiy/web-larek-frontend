import {ProductData} from './ProductModel';

export class BasketModel {
	private items: Map<string, {product: ProductData; quantity: number}> = new Map();

	addItem(product: ProductData, quantity: number) {
		if (this.items.has(product.id)) {
			const existingItem = this.items.get(product.id)!;
			existingItem.quantity += quantity;
		} else {
			this.items.set(product.id, {product, quantity});
		}
	}

	removeItem(productID: string): void {
		this.items.delete(productID);
	}

	getItems(): { product: ProductData; quantity: number }[] {
		return Array.from(this.items.values());
	}


	getTotalPrice(): number {
		return Array.from(this.items.values()).reduce((acc, item) => acc + item.product.price * item.quantity, 0);
	}

	clear(): void {
		this.items.clear();
	}
}