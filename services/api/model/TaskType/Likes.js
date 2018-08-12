import mongoose from 'mongoose';

const likesSchema = new mongoose.Schema({
	publicId: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
	},
	
	// Ссылка которая будет искаться в тексте поста
	targetLink: {
		type    : String,
		required: true,
	},
	
	likesCount: {
		type    : Number,
		required: true,
	},
});

/**
 * @property {ObjectId} publicId
 * @property {String} targetLink
 * @property {Number} likesCount
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetLink
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.targetLink = opts.targetLink;
		baseTask.publicId   = opts.publicId;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetLink
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, targetLink, publicId }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (targetLink) {
			this.targetLink = targetLink;
		}
		
		if (publicId) {
			this.publicId = publicId;
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
