import { multiInject } from 'inversify';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { TaskHandlerInterface } from './task-handler.interface';
import { CommentsByStrategyTaskHandler } from '../comments-by-strategy/comments-by-strategy-task.handler';
import { ClassType } from '../../../lib/internal.types';

type MapperToInstance = {
	[key: string]: TaskHandlerInterface;
};

type MapperTypeToClass = {
	[key: string]: ClassType<TaskHandlerInterface>;
};

const mapperModelTypeToTaskHandler: MapperTypeToClass = {
	CommentsByStrategyTask: CommentsByStrategyTaskHandler,
};

export class TaskAbstractFactory implements TaskAbstractFactoryInterface {
	private readonly mapper: MapperToInstance;

	constructor(
		@multiInject('TaskHandlerInterface') private readonly taskHandlers: TaskHandlerInterface[],
	) {
		this.mapper = this.transformClassMapperToInstance(taskHandlers);
	}

	createTaskHandler(type: string): TaskHandlerInterface {
		const taskHandler = this.mapper[type];
		if (!taskHandler) {
			throw new Error('There is no registered taskHandler for this type');
		}

		return taskHandler;
	}

	transformClassMapperToInstance(taskHandlers: TaskHandlerInterface[]): MapperToInstance {
		return taskHandlers.reduce((mapper: MapperToInstance, taskHandler) => {
			const mappedTaskEntry = Object.entries(mapperModelTypeToTaskHandler).find(
				([, HandlerClass]) => taskHandler instanceof HandlerClass,
			);

			if (!mappedTaskEntry) {
				throw new Error(
					`There is no registered Handler HandlerClass: ${taskHandler.constructor.name}`,
				);
			}

			return { ...mapper, [mappedTaskEntry[0]]: taskHandler };
		}, {});
	}
}
