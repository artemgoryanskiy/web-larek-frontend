// types/base/EventEmitter.ts
export type EventName = string;
export type EventHandler<T = unknown> = (event: T) => void;

export interface IEvents {
	[key: string]: unknown;
}

export class EventEmitter<E extends IEvents> {
	private readonly _events: Map<keyof E, Set<EventHandler<E[keyof E]>>>;

	constructor() {
		this._events = new Map();
	}

	on<T extends keyof E>(eventName: T, callback: EventHandler<E[T]>): void {
		if (!this._events.has(eventName)) {
			this._events.set(eventName, new Set());
		}
		// Используем явное приведение типов через as, так как TypeScript
		// не может вывести, что callback точно подходит для Set
		const handlers = this._events.get(eventName) as Set<EventHandler<E[T]>>;
		handlers.add(callback);
	}

	off<T extends keyof E>(eventName: T, callback: EventHandler<E[T]>): void {
		if (this._events.has(eventName)) {
			const handlers = this._events.get(eventName) as Set<EventHandler<E[T]>>;
			handlers.delete(callback);
			if (handlers.size === 0) {
				this._events.delete(eventName);
			}
		}
	}

	emit<T extends keyof E>(eventName: T, data: E[T]): void {
		if (this._events.has(eventName)) {
			const handlers = this._events.get(eventName) as Set<EventHandler<E[T]>>;
			handlers.forEach((callback) => {
				callback(data);
			});
		}
	}

	onAll(callback: <T extends keyof E>(eventName: T, data: E[T]) => void): void {
		this._events.forEach((_, eventName) => {
			this.on(eventName, (data: E[typeof eventName]) => {
				callback(eventName, data);
			});
		});
	}

	clear(): void {
		this._events.clear();
	}

	// Добавим вспомогательные методы
	hasListeners<T extends keyof E>(eventName: T): boolean {
		return this._events.has(eventName);
	}

	getListenersCount<T extends keyof E>(eventName: T): number {
		return this._events.has(eventName) ? this._events.get(eventName)!.size : 0;
	}
}