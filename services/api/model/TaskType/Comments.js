import mongoose from 'mongoose';

const commentsSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	commentsCount: {
		type    : Number,
		required: true,
	},
	
	repeated: {
		type   : Boolean,
		default: false,
	},
	
	// Если задача была создана в ручную будет null
	parentTask: mongoose.Schema.Types.ObjectId,
});

/**
 * @property {String} postLink
 * @property {Number} commentsCount
 */
export class CommentsTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @return {CommentsTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.commentsCount = opts.commentsCount;
		baseTask.postLink      = opts.postLink;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.commentsCount
	 * @param {String} opts.postLink
	 * @return {CommentsTaskDocument}
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

commentsSchema.loadClass(CommentsTaskDocument);

export default commentsSchema;
