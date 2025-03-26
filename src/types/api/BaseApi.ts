// baseApi.ts
import {EventEmitter} from '../events/EventEmmiter';

export class BaseAPI<
	Events extends Record<string, unknown[]> = Record<string, never[]>, // События
	Methods extends Record<string, (...args: never[]) => unknown> = Record<string, () => void> // Методы
> extends EventEmitter<Events> {
	private methods: Methods;

	constructor(methods: Methods) {
		super(); // Наследуемся от EventEmitter
		this.methods = methods;
	}

	// Вызов метода API
	callMethod<MethodName extends keyof Methods>(
		methodName: MethodName,
		...args: Parameters<Methods[MethodName]>
	): ReturnType<Methods[MethodName]> {
		const method = this.methods[methodName];
		if (!method) {
			throw new Error(`Метод "${String(methodName)}" не найден.`);
		}

		return method(...args) as ReturnType<Methods[MethodName]>; // Приведение типа
	}
}