import { Types } from 'mongoose';
import { ObjectableInterface } from '../../../lib/internal.types';
import { User } from '../users/user';
import { CommonTask } from './common-task';

export interface TaskServiceInterface {
	getActive(count: number): Promise<CommonTask[]>;

	deleteOwnedByUser(user: User, id: string);

	setPending(id: string);

	finish(id: string);

	finishWithError(id: string, error: ObjectableInterface);

	addSubTasksError(id: Types.ObjectId | string, error: ObjectableInterface);

	skipAllSubTasks(parentTaskId: Types.ObjectId | string);
}
