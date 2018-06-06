// @flow
import mongoose from 'mongoose';
import moment   from 'moment';

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

export type TaskPropsType = {
	title     : string;
	createdAt : ?moment;
};

class Task {
	title     : string;
	createdAt : moment;
	
	static createInstance(opts : TaskPropsType) {
		return new this(opts);
	}
}

schema.loadClass(Task);

export default schema;
