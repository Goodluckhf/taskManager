import moment from 'moment';
import mongoose from '../../../lib/mongoose';

const statuses = {
	// Ожидает взятия в работу
	waiting: 0,

	// Выполняется
	pending: 1,

	// Задача завершена
	finished: 2,

	// Прорущена
	skipped: 3,

	// Проверяется
	checking: 4,
};

const schema = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: moment.now,
	},

	status: {
		type: Number,
		enum: Object.values(statuses),
		default: statuses.waiting,
	},

	// Задача повторяется по крону
	repeated: {
		type: Boolean,
		default: false,
	},

	deletedAt: {
		type: Date,
		default: null,
	},

	// Задача запланирована на точное время
	startAt: {
		type: Date,
	},

	// Время последнего выполения задачи
	lastHandleAt: {
		type: Date,
		default: null,
	},

	_error: {
		type: Object,
		default: null,
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},

	subTasks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Task',
		},
	],

	// Если задача была создана в ручную будет null
	parentTask: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
	},
});

schema.statics.status = statuses;

/**
 * @property {Date} createdAt
 * @property {Object<*>} status
 * @property {Boolean} repeated
 * @property {Date} startAt
 * @property {Date} lastHandleAt
 * @property {UserDocument} user
 * @property {Object} _error
 * @property {Array.<TaskDocument>} subTasks
 * @property {TaskDocument} parentTask
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
	 * @return {TaskDocument}
	 */
	stop() {
		this.status = statuses.skipped;
		return this;
	}

	get active() {
		return this.status !== statuses.waiting || this.status !== statuses.finished;
	}

	/**
	 * Получить список тасков для крона
	 * Которые готовы к выполнению
	 * @return {Promise.<Array.<TaskDocument>>}
	 */
	static findActive() {
		return this.find({
			status: statuses.waiting,
			deletedAt: null,
			$or: [{ repeated: true }, { startAt: { $lte: new Date() } }],
		})
			.populate('parentTask')
			.populate('user')
			.exec();
	}
}

schema.loadClass(TaskDocument);

export default schema;
