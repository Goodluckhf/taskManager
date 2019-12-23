import 'reflect-metadata';

export const modelMetadataSymbol = Symbol('modelMetadataSymbol');

export const model = (): ClassDecorator => {
	return (target): void => {
		if (!Reflect.hasMetadata(modelMetadataSymbol, Reflect)) {
			Reflect.defineMetadata(modelMetadataSymbol, [], Reflect);
		}

		const models: [Function] = Reflect.getMetadata(modelMetadataSymbol, Reflect);
		models.push(target);
		Reflect.defineMetadata(modelMetadataSymbol, models, Reflect);
	};
};
