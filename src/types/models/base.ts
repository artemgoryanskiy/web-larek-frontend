export interface IModel<T = unknown> {
	getState(): T;
	subscribe(callback: (state: T) => void): void;
	unsubscribe(callback: (state: T) => void): void;
}
