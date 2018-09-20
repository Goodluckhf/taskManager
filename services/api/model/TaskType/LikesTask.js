import mongoose from 'mongoose';

const likesTaskSchema = new mongoose.Schema({
	postLink: {
		type    : String,
		required: true,
	},
	
	likesCount: {
		type    : Number,
		required: true,
	},
	
	repeated: {
		type   : Boolean,
		default: false,
	},
	
	service: {
		type    : String,
		required: true,
	},
});

/**
 * @property {String} postLink
 * @property {Number} likesCount
 * @property {String} service
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @param {String} opts.service
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.postLink   = opts.postLink;
		baseTask.service    = opts.service;
		return baseTask;
	}
}

likesTaskSchema.loadClass(LikesTaskDocument);

export default likesTaskSchema;
