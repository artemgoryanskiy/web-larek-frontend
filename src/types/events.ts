/**
 * Интерфейс брокера событий
 * Позволяет подписываться на события и публиковать их
 */
export interface IEvents {
	/**
	 * Подписка на событие
	 * @param event Название события или регулярное выражение для фильтрации событий
	 * @param callback Функция-обработчик события
	 */
	on<T extends object>(event: string | RegExp, callback: (data: T) => void): void;

	/**
	 * Публикация события
	 * @param event Название события
	 * @param data Данные, передаваемые с событием
	 */
	emit<T extends object>(event: string, data?: T): void;

	/**
	 * Создание триггера события
	 * @param event Название события
	 * @param context Контекст, который будет добавлен к данным события
	 */
	trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
