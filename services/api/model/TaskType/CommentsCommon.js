import mongoose from 'mongoose';

const commentsCommonTaskSchema = new mongoose.Schema({
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
	
	subTasks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Task',
	}],
	
	// Если задача была создана в ручную будет null
	parentTask: mongoose.Schema.Types.ObjectId,
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
	 * @return {CommentsCommonTaskDocument}
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
