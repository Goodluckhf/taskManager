import mongoose from 'mongoose';

const likesSchema = new mongoose.Schema({
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
	
	// Если задача была создана в ручную будет null
	parentTaskId: mongoose.Schema.Types.ObjectId,
});

/**
 * @property {String} postLink
 * @property {Number} likesCount
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.postLink   = opts.postLink;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, postLink }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (postLink) {
			this.postLink = postLink;
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
