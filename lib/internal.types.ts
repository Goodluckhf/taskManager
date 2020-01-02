export interface ClassType<T> extends Function {
	new (...args: any[]): T;
}

export interface ObjectableInterface {
	toObject(): object;
}

export interface FormattableInterface {
	toFormattedString(): string;
}

export interface HttpStatusableInterface {
	readonly status: number;
}
