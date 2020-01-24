import { inject, injectable } from 'inversify';
import { CommonTask } from './common-task';
import { TaskAbstractFactory } from './task-abstract.factory';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { TaskStrategyAbstractFactory } from './task-strategy-abstract.factory';

@injectable()
export class TaskExecutor {
	constructor(
		@inject(TaskAbstractFactory)
		private readonly taskHandlerFactory: TaskAbstractFactoryInterface,
		@inject(TaskStrategyAbstractFactory)
		private readonly taskStrategyAbstractFactory: TaskStrategyAbstractFactory,
	) {}

	async execute(task: CommonTask) {
		const taskHandler = this.taskHandlerFactory.createTaskHandler(task.__t as string);
		const taskStrategy = this.taskStrategyAbstractFactory.create(task.__t as string);

		await taskStrategy.handleTask(taskHandler, task);
	}
}
