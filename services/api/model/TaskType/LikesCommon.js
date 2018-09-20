import mongoose from 'mongoose';

const likesCommonSchema = new mongoose.Schema({
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
	
	subTasks: [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Task',
	}],
	
	// Если задача была создана в ручную будет null
	parentTask: mongoose.Schema.Types.ObjectId,
});

/**
 * @property {String} postLink
 * @property {Number} likesCount
 */
export class LikesCommonDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.postLink
	 * @return {LikesCommonDocument}
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
	 * @return {LikesCommonDocument}
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

likesCommonSchema.loadClass(LikesCommonDocument);

export default likesCommonSchema;
