export interface IApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export class ApiError extends Error {
	constructor(message: string, public readonly code: number) {
		super(message);
		this.name = 'ApiError';
	}
}

export abstract class BaseAPI {
	protected constructor(
		protected readonly baseUrl: string,
		protected readonly options: RequestInit = {}
	) {}

	protected getRequestOptions(options: RequestInit = {}): RequestInit {
		return {
			headers: {
				'Content-Type': 'application/json',
				...this.options.headers,
				...options.headers,
			},
			...this.options,
			...options,
		};
	}

	protected async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			throw new ApiError(
				`${response.status} ${response.statusText}`,
				response.status
			);
		}

		const data: IApiResponse<T> = await response.json();

		if (!data.success) {
			throw new ApiError(data.error || 'Unknown error', response.status);
		}

		return data.data as T;
	}

	protected async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
		try {
			const response = await fetch(
				`${this.baseUrl}${endpoint}`,
				this.getRequestOptions({
					...options,
					method: 'GET',
				})
			);
			return await this.handleResponse<T>(response);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	protected async post<T>(
		endpoint: string,
		data: unknown,
		options?: RequestInit
	): Promise<T> {
		try {
			const response = await fetch(
				`${this.baseUrl}${endpoint}`,
				this.getRequestOptions({
					...options,
					method: 'POST',
					body: JSON.stringify(data),
				})
			);
			return await this.handleResponse<T>(response);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	protected async put<T>(
		endpoint: string,
		data: unknown,
		options?: RequestInit
	): Promise<T> {
		try {
			const response = await fetch(
				`${this.baseUrl}${endpoint}`,
				this.getRequestOptions({
					...options,
					method: 'PUT',
					body: JSON.stringify(data),
				})
			);
			return await this.handleResponse<T>(response);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	protected async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
		try {
			const response = await fetch(
				`${this.baseUrl}${endpoint}`,
				this.getRequestOptions({
					...options,
					method: 'DELETE',
				})
			);
			return await this.handleResponse<T>(response);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	private handleError(error: unknown): Error {
		if (error instanceof ApiError) {
			return error;
		}
		if (error instanceof Error) {
			return new ApiError(error.message, 0);
		}
		return new ApiError('Unknown error', 0);
	}
}