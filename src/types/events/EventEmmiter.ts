export class EventEmitter<Events extends Record<string, unknown[]>> {
	private events: Partial<Record<keyof Events, Array<(...args: Events[keyof Events]) => void>>> = {};

	// Подписаться на событие
	on<EventName extends keyof Events>(
		eventName: EventName,
		callback: (...args: Events[EventName]) => void
	): void {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName]!.push(callback);
	}

	// Вызвать (emit) событие
	emit<EventName extends keyof Events>(eventName: EventName, ...args: Events[EventName]): void {
		const listeners = this.events[eventName];
		if (listeners) {
			listeners.forEach((callback) => callback(...args));
		}
	}

	// Удалить обработчик события
	off<EventName extends keyof Events>(
		eventName: EventName,
		callback: (...args: Events[EventName]) => void
	): void {
		if (!this.events[eventName]) return;

		this.events[eventName] = this.events[eventName]!.filter((listener) => listener !== callback);
	}
}