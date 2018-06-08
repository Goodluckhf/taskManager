// @flow
import mongoose from 'mongoose';
import { type TaskDocumentT, type TaskPropsType }  from '../model/Task';

export const list = async (): Promise<Array<TaskDocumentT>> => {
	return mongoose.model('Task').find().exec();
};

export const create = async ({ title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task = mongoose.model('Task').createInstance({ title });
	return task.save();
};
