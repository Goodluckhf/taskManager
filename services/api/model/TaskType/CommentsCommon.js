import mongoose from '../../../../lib/mongoose';

const commentsCommonTaskSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	commentsCount: {
		type    : Number,
		required: true,
	},
});

/**
 * @property {String} postLink
 * @property {Number} commentsCount
 */
export class CommentsCommonTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @return {CommentsCommonTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.commentsCount = opts.commentsCount;
		baseTask.postLink      = opts.postLink;
		baseTask.parentTask    = opts.parentTask || null;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @return {CommentsCommonTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ commentsCount, postLink }) {
		if (commentsCount) {
			this.commentsCount = commentsCount;
		}
		
		if (postLink) {
			this.postLink = postLink;
		}
		
		return this;
	}
}

commentsCommonTaskSchema.loadClass(CommentsCommonTaskDocument);

export default commentsCommonTaskSchema;
