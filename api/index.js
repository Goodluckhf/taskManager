// @flow
import mongoose          from 'mongoose';
import type { TaskPropsType } from '../model/Task';


export const list = async (): Promise<?Mongoose$Document> => {
	return mongoose.model('Task').find().exec();
};

export const create = async ({ title }: TaskPropsType): Promise<Array<Mongoose$Document>> => {
	const task = mongoose.model('Task').createInstance({ title });
	return task.save();
};
