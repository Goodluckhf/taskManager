import { injectable, multiInject } from 'inversify';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { TaskHandlerInterface } from './task-handler.interface';
import { CommentsByStrategyTaskHandler } from '../comments-by-strategy/comments-by-strategy-task.handler';
import { ClassType } from '../../../lib/internal.types';
import { CheckAndAddUserTaskHandler } from '../vk-users/check-and-add-user-task.handler';

type MapperToInstance = {
	[key: string]: TaskHandlerInterface;
};

export type MapperTypeToClass = {
	[key: string]: ClassType<TaskHandlerInterface>;
};

@injectable()
export class TaskAbstractFactory implements TaskAbstractFactoryInterface {
	private mapper: MapperToInstance;

	private readonly mapperModelTypeToTaskHandler: MapperTypeToClass = {
		CommentsByStrategyTask: CommentsByStrategyTaskHandler,
		CheckAndAddUserTask: CheckAndAddUserTaskHandler,
	};

	constructor(
		@multiInject('TaskHandlerInterface') private readonly taskHandlers: TaskHandlerInterface[],
	) {}

	createTaskHandler(type: string): TaskHandlerInterface {
		if (!this.mapper) {
			this.mapper = this.transformClassMapperToInstance(this.taskHandlers);
		}
		const taskHandler = this.mapper[type];
		if (!taskHandler) {
			throw new Error('There is no registered taskHandler for this type');
		}

		return taskHandler;
	}

	private transformClassMapperToInstance(taskHandlers: TaskHandlerInterface[]): MapperToInstance {
		return taskHandlers.reduce((mapper: MapperToInstance, taskHandler) => {
			const mappedTaskEntry = Object.entries(this.mapperModelTypeToTaskHandler).find(
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
