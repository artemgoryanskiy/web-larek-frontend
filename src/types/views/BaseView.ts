export abstract class BaseView {
	protected container: HTMLElement;

	constructor(containerSelector: string) {
		const element = document.querySelector(containerSelector);
		if (!element) {
			throw new Error(`Element with selector ${containerSelector} not found`);
		}
		this.container = element as HTMLElement;
	}

	protected render(content: string): void {
		this.container.innerHTML = content;
	}

	protected on(event: string, selector: string, callback: (event: Event) => void): void {
		this.container.addEventListener(event, (e: Event) => {
			if (e.target instanceof HTMLElement && e.target.matches(selector)) {
				callback(e);
			}
		})
	}
}