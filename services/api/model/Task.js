import mongoose from 'mongoose';
import moment   from 'moment';

const statuses = {
	// Ожидает взятия в работу
	waiting: 0,
	
	// Выполняется
	pending: 1,
	
	// Задача завершена
	finished: 2,
	
	// Прорущена
	skipped: 3,
};

const schema = new mongoose.Schema({
	title: {
		type   : String,
		default: '',
	},
	
	createdAt: {
		type   : Date,
		default: moment.now,
	},
	
	status: {
		type   : String,
		enum   : Object.keys(statuses),
		default: statuses.waiting,
	},
});

export class TaskDocument {
	/**
	 * @return {Object.<*>}
	 */
	static get status() {
		return statuses;
	}
	
	/**
	 * @param {Object.<*>} opts
	 * @return {TaskDocument}
	 */
	static createInstance(opts) {
		return new this(opts);
	}
}

schema.loadClass(TaskDocument);

export default schema;
