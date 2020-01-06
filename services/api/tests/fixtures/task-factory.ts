import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { CommonTask } from '../../task/common-task';
import { statuses } from '../../task/status.constant';

export function createTask(opts: Partial<CommonTask> = {}): CommonTask {
	const taskPlain: CommonTask = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		user: opts.user || { _id: new Types.ObjectId() },
		__t: 'type',
		__v: 0,
		_error: undefined,
		_id: new Types.ObjectId(),
		createdAt: new Date(),
		deletedAt: undefined,
		lastHandleAt: undefined,
		status: opts.status || statuses.waiting,
	};

	return plainToClass(CommonTask, taskPlain);
}
