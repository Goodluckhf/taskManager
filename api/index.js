// @flow
import db                from 'lib/db';
import { TaskPropsType } from 'model/Task';


export const list = async (): Promise<any> => {
	return db.models.Task.find().exec();
};

export const create = async ({ title }: TaskPropsType): Promise<any> => {
	const task = db.models.Task.createInstance({ title });
	return await task.save();
};