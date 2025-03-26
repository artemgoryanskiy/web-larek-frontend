import { BaseView } from './BaseView';
import { ProductData } from './models/ProductModel';

export class BasketView extends BaseView {
	private basketList: HTMLElement;
	private basketPrice: HTMLElement;

	constructor(containerSelector: string) {
		super(containerSelector);

		this.basketList = this.container.querySelector('.basket__list') as HTMLElement;
		this.basketPrice = this.container.querySelector('.basket__price') as HTMLElement;
	}

	// Рендер списка товаров в корзине
	renderBasketItems(items: { product: ProductData; quantity: number }[]): void {
		const content = items
			.map(
				(item, index) => `
        <li class="basket__item" data-id="${item.product.id}">
          <span class="basket__item-index">${index + 1}</span>
          <span class="card__title">${item.product.title}</span>
          <span class="card__price">${item.product.price * item.quantity} синапсов</span>
          <button class="basket__item-delete">Удалить</button>
        </li>
      `
			)
			.join('');
		this.basketList.innerHTML = content;
	}

	// Установить общую стоимость корзины
	setTotalPrice(price: number): void {
		this.basketPrice.textContent = `${price} синапсов`;
	}

	// Назначить обработчик удаления товара из корзины
	onRemoveItem(callback: (itemId: string) => void): void {
		this.on('click', '.basket__item-delete', (event) => {
			const item = (event.target as HTMLElement).closest('.basket__item');
			const itemId = item?.dataset.id || '';
			callback(itemId);
		});
	}
}