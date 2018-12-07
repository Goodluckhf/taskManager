import mongoose from '../../../../lib/mongoose';

const likesTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	likesCount: {
		type: Number,
		required: true,
	},

	service: {
		type: String,
		required: true,
	},
});

/**
 * @extends TaskDocument
 * @property {String} postLink
 * @property {Number} likesCount
 * @property {String} service
 * @property {TaskDocument} parentTask
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @param {String} opts.service
	 * @param {TaskDocument} opts.parentTask
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.postLink = opts.postLink;
		baseTask.service = opts.service;
		baseTask.parentTask = opts.parentTask || null;
		return baseTask;
	}
}

likesTaskSchema.loadClass(LikesTaskDocument);

export default likesTaskSchema;
