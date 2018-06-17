// @flow
import mongoose from 'mongoose';
import moment   from 'moment';
import {
	arrayToHash,
	type ArrayToHashT,
} from '../lib/helper';

export type TaskPropsType = {
	title     : string;
	createdAt? : moment;
};

const statuses = ['pending', 'finished', 'skipped'];
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
		type: String,
		enum: statuses,
	},
});

export class TaskDocumentT /* :: extends Mongoose$Document */ {
	title     : string;
	createdAt : moment;
	status    : string;
	
	static get status(): ArrayToHashT<string> {
		return arrayToHash(statuses);
	}
	
	static createInstance(opts : $Exact<TaskPropsType>): this {
		return new this(opts);
	}
}

schema.loadClass(TaskDocumentT);

export default schema;
