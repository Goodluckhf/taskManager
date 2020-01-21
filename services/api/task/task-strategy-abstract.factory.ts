import { inject, injectable, multiInject } from 'inversify';
import { TaskStrategyInterface } from './task-strategy.interface';
import {
	ClassMapperInstanceTransformer,
	MapperToInstance,
	MapperTypeToClass,
} from './class-mapper-instance.transformer';
import { AtomicTaskStrategy } from './atomic-task.strategy';
import { CompositeTaskStrategy } from './composite-task.strategy';

@injectable()
export class TaskStrategyAbstractFactory {
	private mapper: MapperToInstance<TaskStrategyInterface>;

	private readonly mapperTaskTypeToStrategyClass: MapperTypeToClass<TaskStrategyInterface> = {
		CommentsByStrategyTask: CompositeTaskStrategy,
		CheckAndAddUserTask: AtomicTaskStrategy,
		JoinToGroupTask: AtomicTaskStrategy,
		CheckAllUsersTask: AtomicTaskStrategy,
	};

	constructor(
		@multiInject('TaskStrategyInterface')
		private readonly taskStrategies: TaskStrategyInterface[],
		@inject(ClassMapperInstanceTransformer)
		private readonly classMapperInstanceTransformer: ClassMapperInstanceTransformer,
	) {}

	create(type: string): TaskStrategyInterface {
		if (!this.mapper) {
			this.mapper = this.classMapperInstanceTransformer.transform(
				this.taskStrategies,
				this.mapperTaskTypeToStrategyClass,
			);
		}

		const taskStrategy = this.mapper[type];
		if (!taskStrategy) {
			throw new Error('There is no task strategy for this type');
		}

		return taskStrategy;
	}
}
