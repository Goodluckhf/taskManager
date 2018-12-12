import mongoose from '../../../../lib/mongoose';

// Предположим что пока задачи только по накрутки
const taskInvoiceSchema = new mongoose.Schema({
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
	 * @param {String} taskType
	 * @param {String} postLink
	 * @param {Number} count
	 * @return {InvoiceDocument}
	 */
	static createInstance({ taskType, postLink, count, ...args }) {
		const invoice = mongoose.model('Invoice').createInstance(this, args);
		invoice.taskType = taskType;
		invoice.postLink = postLink;
		invoice.count = count;
		return invoice;
	}
}

taskInvoiceSchema.loadClass(TaskInvoiceDocument);

export default taskInvoiceSchema;
