import mongoose from 'mongoose';

const autolikesSchema = new mongoose.Schema({
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
	
	repeated: {
		type   : Boolean,
		default: true,
	},
	
	subTasks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Task',
	}],
});

/**
 * @property {ObjectId|GroupDocument} group
 * @property {Number} likesCount
 */
export class AutoLikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {ObjectId} opts.group
	 * @return {AutoLikesTaskDocument}
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
	 * @return {AutoLikesTaskDocument}
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

autolikesSchema.loadClass(AutoLikesTaskDocument);

export default autolikesSchema;
