import mongoose from '../../../../lib/mongoose';

// Предположим что пока задачи только по накрутки
const taskInvoiceSchema = new mongoose.Schema({
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
	},

	taskType: {
		type: String,
		required: true,
	},

	postLink: {
		type: String,
		required: true,
	},

	count: {
		type: Number,
		required: true,
	},
});

/**
 * @extends InvoiceDocument
 * @property {String} taskType
 * @property {String} postLink
 * @property {Number} count
 */
class TaskInvoiceDocument {
	/**
	 * @param {TaskDocument} task
	 * @return {InvoiceDocument}
	 */
	static createInstance({ task, ...args }) {
		const invoice = mongoose.model('Invoice').createInstance(this, args);
		invoice.task = task;
		invoice.taskType = task.__t;
		invoice.postLink = task.postLink;
		invoice.count = task.count;
		return invoice;
	}
}

taskInvoiceSchema.loadClass(TaskInvoiceDocument);

export default taskInvoiceSchema;
