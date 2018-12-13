import mongoose from '../../../../lib/mongoose';

const commentsCommonTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	commentsCount: {
		type: Number,
	},

	count: {
		type: Number,
		required: true,
	},
});

/**
 * @extends TaskDocument
 * @property {String} postLink
 * @property {Number} count
 */
export class CommentsCommonDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.count
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @return {CommentsCommonDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.count = opts.count;
		baseTask.postLink = opts.postLink;
		baseTask.parentTask = opts.parentTask || null;
		return baseTask;
	}

	/**
	 * @param {Object} opts
	 * @param {Number} opts.count
	 * @param {String} opts.postLink
	 * @return {CommentsCommonDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ count, postLink }) {
		if (count) {
			this.count = count;
		}

		if (postLink) {
			this.postLink = postLink;
		}

		return this;
	}
}

commentsCommonTaskSchema.loadClass(CommentsCommonDocument);

export default commentsCommonTaskSchema;
