export interface BaseEntity {
	id: string;
}

export interface BaseDto {
	id: string;
}

export interface PaginatedResponse<T> {
	total: number;
	items: T[];
}
