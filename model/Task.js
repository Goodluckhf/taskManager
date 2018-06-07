// @flow
import mongoose from 'mongoose';
import moment   from 'moment';

export type TaskPropsType = {
	title     : string;
	createdAt : ?moment;
};

const schema = new mongoose.Schema({
	title: {
		type    : String,
		default : '',
	},
	createdAt: {
		type    : Date,
		default : moment.now,
	},
});

export class TaskDocumentT /* :: extends Mongoose$Document */ {
	title     : string;
	createdAt : ?moment;
	
	static createInstance(opts : $Exact<TaskPropsType>): this {
		return new this(opts);
	}
}

schema.loadClass(TaskDocumentT);

export default schema;
