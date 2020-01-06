import 'reflect-metadata';
import { inject } from 'inversify';
import { getModelToken } from './get-model-token';
import { ClassType } from '../internal.types';

export const injectModel = (modelClass: ClassType<any>): ParameterDecorator => {
	return (target, propertyKey, parameterIndex): void => {
		inject(getModelToken(modelClass))(
			target,
			propertyKey && propertyKey.toString(),
			parameterIndex,
		);
	};
};
