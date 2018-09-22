import mongoose from 'mongoose';

const likesCheckTaskSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	likesCount: {
		type    : Number,
		required: true,
	},
	
	// Если задача была создана в ручную будет null
	parentTask: mongoose.Schema.Types.ObjectId,
});

/**
 * @property {String} postLink
 * @property {Number} likesCount
 */
export class LikesCheckTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @param {Date} opts.startAt
	 * @return {LikesCheckTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.postLink   = opts.postLink;
		baseTask.parentTask = opts.parentTask;
		baseTask.startAt    = opts.startAt;
		return baseTask;
	}
}

likesCheckTaskSchema.loadClass(LikesCheckTaskDocument);

export default likesCheckTaskSchema;
