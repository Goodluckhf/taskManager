import mongoose from 'mongoose';
import config   from 'config';

import { NotFoundError } from './errors';
import amqp              from '../../../lib/amqp';

/**
 * @param data
 * @return {Promise<TaskDocument>}
 */
export const createLikes = async (data) => {
	const task = mongoose.model('Task').createInstance(data);
	await task.save();
	
	const message = JSON.stringify({
		id: task.id,
	});
	
	const connection = await amqp;
	const channel = await connection.createChannel();
	await channel.assertQueue(config.get('taskQueue.name'));
	await channel.sendToQueue(config.get('taskQueue.name'), Buffer.from(message));
	
	return task;
};

/**
 * @return {Promise<Array<TaskDocument>>}
 */
export const list = async () => {
	const tasks = await mongoose.model('Task').find().exec();
	if (tasks.length === 0) {
		throw new NotFoundError();
	}
	
	return tasks;
};

/**
 * @param {String} id
 * @return {Promise<TaskDocument>}
 */
export const getById = async (id) => {
	const task = await mongoose.model('Task').findById(id);
	if (!task) {
		throw new NotFoundError();
	}
	
	return task;
};
