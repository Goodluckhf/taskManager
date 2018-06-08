// @flow
import mongoose                                   from 'mongoose';
import { type TaskDocumentT, type TaskPropsType } from '../model/Task';
import { NotFoundError }                          from './errors';

export const list = async (): Promise<Array<TaskDocumentT>> => {
	const tasks = await mongoose.model('Task').find().exec();
	if (tasks.length === 0) {
		throw new NotFoundError();
	}
	
	return tasks;
};

export const create = async ({ title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task = mongoose.model('Task').createInstance({ title });
	return task.save();
};
