import mongoose from '../../../../lib/mongoose';

const commentsTaskSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	commentsCount: {
		type    : Number,
		required: true,
	},
	
	service: {
		type    : String,
		required: true,
	},
});

/**
 * @property {String} postLink
 * @property {Number} commentsCount
 * @property {String} service
 * @property {TaskDocument} parentTask
 */
export class CommentsTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @param {String} opts.service
	 * @param {TaskDocument} opts.parentTask
	 * @return {CommentsTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.commentsCount = opts.commentsCount;
		baseTask.postLink      = opts.postLink;
		baseTask.service       = opts.service;
		baseTask.parentTask    = opts.parentTask || null;
		return baseTask;
	}
}

commentsTaskSchema.loadClass(CommentsTaskDocument);

export default commentsTaskSchema;
