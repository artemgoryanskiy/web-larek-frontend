export interface IView<T = unknown> {
	render(state: T): void;
	mount(container: HTMLElement): void;
	unmount(): void;
}
