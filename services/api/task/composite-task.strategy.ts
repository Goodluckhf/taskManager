import { injectable } from 'inversify';
import { TaskStrategyInterface } from './task-strategy.interface';
import { TaskHandlerInterface } from './task-handler.interface';

@injectable()
export class CompositeTaskStrategy implements TaskStrategyInterface {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	handleTask(taskHandler: TaskHandlerInterface) {}
}
