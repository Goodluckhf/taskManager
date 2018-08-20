import mongoose from 'mongoose';

const likesSchema = new mongoose.Schema({
	publicId: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
	},
	
	likesCount: {
		type    : Number,
		required: true,
	},
	
	// Время последнего проставления лайков в этой группе
	lastLikedAt: {
		type   : Date,
		default: null,
	},
});

/**
 * @property {ObjectId} publicId
 * @property {Number} likesCount
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount      = opts.likesCount;
		baseTask.publicId        = opts.publicId;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, publicId }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (publicId) {
			this.publicId = publicId;
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
