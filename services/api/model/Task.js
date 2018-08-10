import mongoose from 'mongoose';
import moment   from 'moment';
import { arrayToHash } from '../../../lib/helper';

const statuses   = ['pending', 'finished', 'skipped'];
const statusHash = arrayToHash(statuses);

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
		enum   : statuses,
		default: statusHash.pending,
	},
});

export class TaskDocument {
	/**
	 * @return {Object.<*>}
	 */
	static get status() {
		return statusHash;
	}
	
	/**
	 * @param {Object.<*>} opts
	 * @return {TaskDocument}
	 */
	static createInstance(opts) {
		return new this(opts);
	}
	
	/**
	 * @return {TaskDocument}
	 */
	finish() {
		this.status = TaskDocument.status.finished;
		return this;
	}
}

schema.loadClass(TaskDocument);

export default schema;
