// @flow
import mongoose                                   from 'mongoose';
import { type TaskDocumentT, type TaskPropsType } from '../model/Task';
import { NotFoundError }                          from './errors';

export const create = async ({ title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task = mongoose.model('Task').createInstance({ title });
	return task.save();
};

export const list = async (): Promise<Array<TaskDocumentT>> => {
	const tasks = await mongoose.model('Task').find().exec();
	if (tasks.length === 0) {
		throw new NotFoundError();
	}
	
	return tasks;
};

export const update = async (id: string, { title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task = await mongoose.model('Task').findOne({ _id: id });
	
	if (!task) {
		throw NotFoundError();
	}
	
	task.title = title;
	return task.save();
};


export type removePropsT = {
	id: string
};

export const remove = async ({ id }: removePropsT): Promise<void> => {
	await mongoose.model('Task').deleteOne({ _id: id });
};

