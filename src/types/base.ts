// Базовый интерфейс для сущностей
export interface BaseEntity {
	id: string; // Уникальный идентификатор
}

// DTO для общей структуры данных
export interface BaseDto {
	id: string;
}

// Типы для пагинации (Fetch API с использованием страницы)
export interface PaginatedResponse<T> {
	total: number;
	items: T[];
}
