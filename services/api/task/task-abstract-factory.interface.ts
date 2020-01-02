import { TaskHandlerInterface } from './task-handler.interface';

export interface TaskAbstractFactoryInterface {
	createTaskHandler(type: string): TaskHandlerInterface;
}
