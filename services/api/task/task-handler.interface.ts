import { CommonTask } from './common-task';

export interface TaskHandlerInterface {
	handle(task: CommonTask);
}
