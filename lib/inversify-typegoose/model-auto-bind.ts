import 'reflect-metadata';
import { interfaces } from 'inversify';
import { getModelForClass } from '@typegoose/typegoose';
import { modelMetadataSymbol } from './model.decorator';
import { getModelToken } from './get-model-token';

export const modelAutoBind = (container: interfaces.Container): void => {
	const modelsMetadataClass: [] = Reflect.getMetadata(modelMetadataSymbol, Reflect);
	modelsMetadataClass.forEach(ModelClass => {
		container.bind(getModelToken(ModelClass)).to(getModelForClass(ModelClass));
	});
};
