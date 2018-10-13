import mongoose from '../../../../lib/mongoose';

const checkWallBanTaskSchema = new mongoose.Schema({
	group: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
		ref     : 'Group',
	},
	
	postCount: {
		type    : Number,
		required: true,
	},
	
	repeated: {
		type   : Boolean,
		default: true,
	},
});

/**
 * @property {GroupDocument} group
 * @property {Number} postCount
 */
export class CheckWallBanTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.postCount
	 * @param {GroupDocument} opts.group
	 * @return {CheckWallBanTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.postCount = opts.postCount;
		baseTask.group     = opts.group;
		return baseTask;
	}
}

checkWallBanTaskSchema.loadClass(CheckWallBanTaskDocument);

export default checkWallBanTaskSchema;
