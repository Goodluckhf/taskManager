import mongoose from '../../../../lib/mongoose';

const taskInvoiceSchema = new mongoose.Schema({
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task',
	},
});

/**
 * @extends InvoiceDocument
 * @property {TaskDocument} task
 */
class TaskInvoiceDocument {
	/**
	 * @param {TaskDocument} task
	 * @return {InvoiceDocument}
	 */
	static createInstance({ task, ...args }) {
		const invoice = mongoose.model('Invoice').createInstance(this, args);
		invoice.task = task;
		return invoice;
	}
}

taskInvoiceSchema.loadClass(TaskInvoiceDocument);

export default taskInvoiceSchema;
