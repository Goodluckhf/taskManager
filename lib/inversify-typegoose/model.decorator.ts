import 'reflect-metadata';

export const modelMetadataSymbol = Symbol('modelMetadataSymbol');

export type ModelDecoratorConfig<T> = {
	discriminatorClass?: ClassType<T>;
};

export interface ClassType<T> extends Function {
	new (...args: any[]): T;
}

export type ModelMetadata<T> = {
	modelClass: ClassType<T>;
	discriminatorBaseClass?: ClassType<T>;
};

export function model<T>(config: ModelDecoratorConfig<T> = {}) {
	return (target: ClassType<any>): void => {
		if (!Reflect.hasMetadata(modelMetadataSymbol, Reflect)) {
			Reflect.defineMetadata(modelMetadataSymbol, [], Reflect);
		}

		const models: ModelMetadata<any>[] = Reflect.getMetadata(modelMetadataSymbol, Reflect);
		models.push({
			modelClass: target as ClassType<any>,
			discriminatorBaseClass: (config.discriminatorClass as ClassType<any>) || undefined,
		});
		Reflect.defineMetadata(modelMetadataSymbol, models, Reflect);
	};
}
