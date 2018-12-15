import mongoose from '../../../../lib/mongoose';

const repostsTaskSchema = new mongoose.Schema({
	postLink: {
		type: String,
		required: true,
	},

	repostsCount: {
		type: Number,
	},

	count: {
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
 * @property {Number} count
 * @property {String} service
 * @property {TaskDocument} parentTask
 */
export class RepostsTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.count
	 * @param {String} opts.postLink
	 * @param {String} opts.service
	 * @param {TaskDocument} opts.parentTask
	 * @return {RepostsTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.count = opts.count;
		baseTask.postLink = opts.postLink;
		baseTask.service = opts.service;
		baseTask.parentTask = opts.parentTask || null;
		return baseTask;
	}
}

repostsTaskSchema.loadClass(RepostsTaskDocument);

export default repostsTaskSchema;
