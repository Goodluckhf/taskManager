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
	createdAt: {
		type   : Date,
		default: moment.now,
	},
	
	status: {
		type   : String,
		enum   : Object.values(statuses),
		default: statuses.waiting,
	},
});

schema.statics.status = statuses;

/**
 * @property {Date} createdAt
 * @property {Object<*>} status
 */
export class TaskDocument {
	/**
	 * @param {Function} Constructor
	 * @param {Object.<*>} opts
	 * @return {TaskDocument}
	 */
	static createInstance(Constructor, opts) {
		return new Constructor(opts);
	}
	
	/**
	 * @return {Boolean}
	 */
	get active() {
		return this.status === statuses.waiting
			|| this.status === statuses.pending;
	}
}

schema.loadClass(TaskDocument);

export default schema;
