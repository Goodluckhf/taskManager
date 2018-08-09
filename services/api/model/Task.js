// @flow
import mongoose from 'mongoose';
import moment   from 'moment';
import {
	arrayToHash,
	type ArrayToHashT,
} from '../../../lib/helper';

export type TaskPropsType = {
	title     : string;
	createdAt? : moment;
};

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

export class TaskDocumentT /* :: extends Mongoose$Document */ {
	title     : string;
	createdAt : moment;
	status    : string;
	
	static get status(): ArrayToHashT<string> {
		return statusHash;
	}
	
	static createInstance(opts : $Exact<TaskPropsType>): this {
		return new this(opts);
	}
	
	finish(): this {
		this.status = TaskDocumentT.status.finished;
		return this;
	}
}

schema.loadClass(TaskDocumentT);

export default schema;
