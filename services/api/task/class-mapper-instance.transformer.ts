import { injectable } from 'inversify';
import { ClassType } from '../../../lib/internal.types';

export type MapperToInstance<T> = {
	[key: string]: T;
};

export type MapperTypeToClass<T> = {
	[key: string]: ClassType<T>;
};

@injectable()
export class ClassMapperInstanceTransformer {
	public transform<InstanceType>(
		instances: InstanceType[],
		mapperTypeToClass: MapperTypeToClass<InstanceType>,
	): MapperToInstance<InstanceType> {
		return Object.entries(mapperTypeToClass).reduce(
			(mapper: MapperToInstance<InstanceType>, [key, HandlerClass]) => {
				const foundInstance = instances.find(instance => instance instanceof HandlerClass);

				if (!foundInstance) {
					throw new Error(`There is no registered instance Class: ${HandlerClass.name}`);
				}

				return { ...mapper, [key]: foundInstance };
			},
			{},
		);
	}
}
