import mongoose from 'mongoose';

const likesSchema = new mongoose.Schema({
	group: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
		ref     : 'Group',
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
 * @property {ObjectId|GroupDocument} group
 * @property {Number} likesCount
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {ObjectId} opts.group
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.group      = opts.group;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {Number} opts.groupId
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, groupId }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (groupId) {
			this.group = groupId;
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
