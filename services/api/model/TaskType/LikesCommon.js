import mongoose from '../../../../lib/mongoose';

const likesCommonSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	likesCount: {
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
export class LikesCommonDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.count
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @return {LikesCommonDocument}
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
	 * @return {LikesCommonDocument}
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

likesCommonSchema.loadClass(LikesCommonDocument);

export default likesCommonSchema;
