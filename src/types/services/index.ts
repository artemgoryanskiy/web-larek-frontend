export interface IStorage {
	get<T>(key: string): T | null;
	set<T>(key: string, value: T): void;
	remove(key: string): void;
}

export interface IValidator {
	validate<T>(data: T, rules: ValidationRules): ValidationResult;
}

export interface ValidationRules {
	[key: string]: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	};
}

export interface ValidationResult {
	isValid: boolean;
	errors: {
		[key: string]: string[];
	};
}