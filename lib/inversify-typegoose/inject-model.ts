import 'reflect-metadata';
import { inject } from 'inversify';
import { getModelToken } from './get-model-token';

type classType = {
	new (...args: any[]): any;
};

export const injectModel = (modelClass: classType): ParameterDecorator => {
	return (target, propertyKey, parameterIndex): void => {
		inject(getModelToken(modelClass))(target, propertyKey.toString(), parameterIndex);
	};
};
