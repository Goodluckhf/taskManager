import mongoose from 'mongoose';

const likesSchema = new mongoose.Schema({
	publicId: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
	},
	
	// Ссылка которая будет искаться в тексте поста
	targetPublicIds: {
		type    : [mongoose.Schema.Types.ObjectId],
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
 * @property {String} targetPublicIds
 * @property {Number} likesCount
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetPublicIds
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount      = opts.likesCount;
		baseTask.targetPublicIds = opts.targetPublicIds;
		baseTask.publicId        = opts.publicId;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetPublicIds
	 * @param {Number} opts.publicId
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, targetPublicIds, publicId }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (targetPublicIds) {
			this.targetPublicIds = targetPublicIds;
		}
		
		if (publicId) {
			this.publicId = publicId;
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
