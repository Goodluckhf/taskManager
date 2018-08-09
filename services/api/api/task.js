// @flow
import mongoose from 'mongoose';
import config   from 'config';
import {
	type TaskDocumentT,
	type TaskPropsType,
} from '../model/Task';

import { NotFoundError } from './errors';
import amqp              from '../../../lib/amqp';

export const create = async ({ title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task: TaskDocumentT = mongoose.model('Task').createInstance({ title });
	await task.save();
	
	const message: string = JSON.stringify({
		id: task.id,
	});
	
	const connection = await amqp;
	const channel = await connection.createChannel();
	await channel.assertQueue(config.get('taskQueue.name'));
	await channel.sendToQueue(config.get('taskQueue.name'), Buffer.from(message));
	
	return task;
};

export const list = async (): Promise<Array<TaskDocumentT>> => {
	const tasks: Array<TaskDocumentT> = await mongoose.model('Task').find().exec();
	if (tasks.length === 0) {
		throw new NotFoundError();
	}
	
	return tasks;
};

export const getById = async (id: string): Promise<TaskDocumentT> => {
	const task: TaskDocumentT = await mongoose.model('Task').findById(id);
	if (!task) {
		throw new NotFoundError();
	}
	
	return task;
};

export const finish = async (id: string): Promise<TaskDocumentT> => {
	const task: TaskDocumentT = await mongoose.model('Task').findById(id);
	if (!task) {
		throw new NotFoundError();
	}
	
	return task.finish().save();
};

export const update = async (id: string, { title }: TaskPropsType): Promise<TaskDocumentT> => {
	const task: TaskDocumentT = await mongoose.model('Task').findOne({ _id: id });
	
	if (!task) {
		throw NotFoundError();
	}
	
	task.title = title;
	return task.save();
};


export type removePropsT = {
	id: string
};
