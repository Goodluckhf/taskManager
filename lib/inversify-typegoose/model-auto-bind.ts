import 'reflect-metadata';
import { interfaces } from 'inversify';
import { getDiscriminatorModelForClass, getModelForClass } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { ModelMetadata, modelMetadataSymbol } from './model.decorator';
import { getModelToken } from './get-model-token';

export const modelAutoBind = (container: interfaces.Container): void => {
	const modelsMetadataClass: ModelMetadata<any>[] = Reflect.getMetadata(
		modelMetadataSymbol,
		Reflect,
	);
	modelsMetadataClass.forEach(modelMetadata => {
		let modelClass;
		if (modelMetadata.discriminatorBaseClass) {
			modelClass = getDiscriminatorModelForClass(
				getModelForClass(modelMetadata.discriminatorBaseClass as AnyParamConstructor<any>),
				modelMetadata.modelClass,
			);
		} else {
			modelClass = getModelForClass(modelMetadata.modelClass as AnyParamConstructor<any>);
		}

		container.bind(getModelToken(modelMetadata.modelClass)).toConstantValue(modelClass);
	});
};
