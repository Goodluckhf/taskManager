import { TaskHandlerInterface } from './task-handler.interface';
import { CommonTask } from './common-task';

export interface TaskStrategyInterface {
	handleTask(taskHandler: TaskHandlerInterface, task: CommonTask);
}
