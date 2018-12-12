import mongoose from '../../../../lib/mongoose';

const commentsCommonTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	commentsCount: {
		type: Number,
		required: true,
	},

	count: {
		type: Number,
		required: true,
	},
});

/**
 * @extends TaskDocument
 * @property {String} postLink
 * @property {Number} commentsCount
 */
export class CommentsCommonDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @return {CommentsCommonDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.commentsCount = opts.commentsCount;
		baseTask.postLink = opts.postLink;
		baseTask.parentTask = opts.parentTask || null;
		return baseTask;
	}

	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @return {CommentsCommonDocument}
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

commentsCommonTaskSchema.loadClass(CommentsCommonDocument);

export default commentsCommonTaskSchema;
