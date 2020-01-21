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
		return instances.reduce((mapper: MapperToInstance<InstanceType>, instance) => {
			const mappedTaskEntry = Object.entries(mapperTypeToClass).find(
				([, HandlerClass]) => instance instanceof HandlerClass,
			);

			if (!mappedTaskEntry) {
				throw new Error(
					`There is no registered instance Class: ${instance.constructor.name}`,
				);
			}

			return { ...mapper, [mappedTaskEntry[0]]: instance };
		}, {});
	}
}
