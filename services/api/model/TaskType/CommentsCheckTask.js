import mongoose from '../../../../lib/mongoose';

const commentsCheckTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	commentsCount: {
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
 * @property {Number} commentsCount
 */
export class CommentsCheckTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @param {Date} opts.startAt
	 * @param {Number} opts.serviceIndex
	 * @return {CommentsCheckTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.commentsCount = opts.commentsCount;
		baseTask.postLink = opts.postLink;
		baseTask.parentTask = opts.parentTask;
		baseTask.startAt = opts.startAt;
		baseTask.serviceIndex = opts.serviceIndex;
		return baseTask;
	}
}

commentsCheckTaskSchema.loadClass(CommentsCheckTaskDocument);

export default commentsCheckTaskSchema;
