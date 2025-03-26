import { BaseView } from './BaseView';

export class ModalView extends BaseView {
	private closeButton: HTMLButtonElement;
	private contentContainer: HTMLElement;

	constructor(containerSelector: string) {
		super(containerSelector);

		this.closeButton = this.container.querySelector('.modal__close') as HTMLButtonElement;
		this.contentContainer = this.container.querySelector('.modal__content') as HTMLElement;
		this.bindEvents();
	}

	// Открыть модальное окно
	open(): void {
		this.container.classList.add('modal_active');
	}

	// Закрыть модальное окно
	close(): void {
		this.container.classList.remove('modal_active');
	}

	// Установить содержимое модального окна
	setContent(content: string): void {
		this.contentContainer.innerHTML = content;
	}

	// Назначить обработчик закрытия модального окна
	onClose(callback: () => void): void {
		this.closeButton.addEventListener('click', () => {
			this.close();
			callback();
		});
	}

	private bindEvents(): void {
		this.container.addEventListener('click', (event: Event) => {
			const target = event.target as HTMLElement;
			if (target === this.container) {
				this.close();
			}
		})
		this.closeButton.addEventListener('click', () => {
			this.close();
		})
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.code === 'Escape') {
				this.close();
			}
		})
	}
}