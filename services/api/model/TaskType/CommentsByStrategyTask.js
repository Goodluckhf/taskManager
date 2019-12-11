import mongoose from '../../../../lib/mongoose';

const commentsStrategy = new mongoose.Schema({
	userFakeId: { type: Number, required: true },
	replyToCommentNumber: { type: Number },
	text: { type: String, required: true },
	imageURL: { type: String },
	likesCount: { type: Number, default: 0 },
});

const commentsByStrategyTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},
	commentsStrategy: [commentsStrategy],
});

/**
 * @property {GroupDocument} group
 * @property {Number} postCount
 */
export class CommentsByStrategyTask {
	/**
	 * @param {Object} opts
	 * @param {String} opts.postLink
	 * @param {Array<Object>} opts.commentsStrategy
	 * @return {CommentsByStrategyTask}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.postLink = opts.postLink;
		baseTask.commentsStrategy = opts.commentsStrategy;
		return baseTask;
	}
}

commentsByStrategyTaskSchema.loadClass(CommentsByStrategyTask);

export default commentsByStrategyTaskSchema;
