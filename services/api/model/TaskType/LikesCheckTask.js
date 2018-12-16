import mongoose from '../../../../lib/mongoose';

const likesCheckTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	count: {
		type: Number,
		required: true,
	},

	serviceIndex: {
		type: Number,
		required: true,
	},
});

/**
 * @extends TaskDocument
 * @property {String} postLink
 * @property {Number} count
 * @property {Number} serviceIndex
 */
export class LikesCheckTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.count
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @param {Date} opts.startAt
	 * @param {Number} opts.serviceIndex
	 * @return {LikesCheckTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.count = opts.count;
		baseTask.postLink = opts.postLink;
		baseTask.parentTask = opts.parentTask;
		baseTask.startAt = opts.startAt;
		baseTask.serviceIndex = opts.serviceIndex;
		return baseTask;
	}
}

likesCheckTaskSchema.loadClass(LikesCheckTaskDocument);

export default likesCheckTaskSchema;
