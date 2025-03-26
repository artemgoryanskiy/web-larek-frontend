import { BaseView } from './BaseView';
import { ProductData } from './models/ProductModel';

export class GalleryView extends BaseView {
	constructor(containerSelector: string) {
		super(containerSelector);
	}

	renderProducts(products: ProductData[]): void {
		const content = products
			.map(
				(product) => `
        <div class="card" data-id="${product.id}">
          <img class="card__image" src="${product.image || ''}" alt="${product.title}" />
          <div class="card__column">
            <span class="card__category">${product.category}</span>
            <h2 class="card__title">${product.title}</h2>
            <p class="card__text">${product.description}</p>
            <div class="card__row">
              <button class="button">В корзину</button>
              <span class="card__price">${product.price} синапсов</span>
            </div>
          </div>
        </div>
      `
			)
			.join('');
		this.render(content);
	}

	onAddToCart(callback: (productId: string) => void): void {
		this.on('click', '.button', (event) => {
			const card = (event.target as HTMLElement).closest('.card');
			const productId = card?.dataset.id || '';
			callback(productId);
		});
	}
}