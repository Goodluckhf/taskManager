import mongoose from '../../../../lib/mongoose';

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
	
	commentsCount: {
		type    : Number,
		required: true,
	},
	
	repostsCount: {
		type    : Number,
		required: true,
	},
	
	// Прошлый пост
	lastPostLink: {
		type: String,
	},
	
	repeated: {
		type   : Boolean,
		default: true,
	},
});

/**
 * @property {ObjectId|GroupDocument} group
 * @property {Number} likesCount
 * @property {Number} commentsCount
 * @property {Number} repostsCount
 * @property {String} lastPostLink
 */
export class AutoLikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {Number} opts.commentsCount
	 * @param {Number} opts.repostsCount
	 * @param {ObjectId} opts.group
	 * @return {AutoLikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount    = opts.likesCount;
		baseTask.commentsCount = opts.commentsCount;
		baseTask.repostsCount  = opts.repostsCount;
		baseTask.group         = opts.group;
		return baseTask;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {Number} opts.commentsCount
	 * @param {Number} opts.groupId
	 * @return {AutoLikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, groupId, commentsCount }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (commentsCount) {
			this.commentsCount = commentsCount;
		}
		
		if (groupId) {
			this.group = groupId;
		}
		
		return this;
	}
}

autolikesSchema.loadClass(AutoLikesTaskDocument);

export default autolikesSchema;
