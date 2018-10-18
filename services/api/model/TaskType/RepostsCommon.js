import mongoose from '../../../../lib/mongoose';

const repostsCommonTaskSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	repostsCount: {
		type    : Number,
		required: true,
	},
});

/**
 * @extends TaskDocument
 * @property {String} postLink
 * @property {Number} repostsCount
 */
export class RepostsCommonTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.repostsCount
	 * @param {String} opts.postLink
	 * @param {TaskDocument} opts.parentTask
	 * @return {RepostsCommonTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.repostsCount  = opts.repostsCount;
		baseTask.postLink      = opts.postLink;
		baseTask.parentTask    = opts.parentTask || null;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.repostsCount
	 * @param {String} opts.postLink
	 * @return {RepostsCommonTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ repostsCount, postLink }) {
		if (repostsCount) {
			this.repostsCount = repostsCount;
		}
		
		if (postLink) {
			this.postLink = postLink;
		}
		
		return this;
	}
}

repostsCommonTaskSchema.loadClass(RepostsCommonTaskDocument);

export default repostsCommonTaskSchema;
