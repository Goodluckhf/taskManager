import mongoose from 'mongoose';
import moment   from 'moment';

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
	
	// Расписание выхода постов
	schedule: [Date],
});

/**
 * @property {ObjectId} publicId
 * @property {String} targetLink
 * @property {Number} likesCount
 * @property {Array.<Date>} schedule
 */
export class LikesTaskDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetLink
	 * @param {Number} opts.publicId
	 * @param {String} opts.schedule
	 * @return {LikesTaskDocument}
	 */
	static createInstance(opts) {
		const baseTask = mongoose.model('Task').createInstance(this, opts);
		baseTask.likesCount = opts.likesCount;
		baseTask.targetLink = opts.targetLink;
		baseTask.publicId   = opts.publicId;
		baseTask.schedule   = this.getScheduleDatesFromString(opts.schedule);
		return baseTask;
	}
	
	/**
	 * @example 07/08@08:10,08/08@08:10 -> [Date, Date]
	 * @param {String} schedule
	 * @return {Array.<Date>}
	 */
	static getScheduleDatesFromString(schedule) {
		return schedule
			.split(',')
			.map(d => moment(d, 'DD/MM@HH:mm'));
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} opts.likesCount
	 * @param {String} opts.targetLink
	 * @param {Number} opts.publicId
	 * @param {String} opts.schedule
	 * @return {LikesTaskDocument}
	 */
	// eslint-disable-next-line object-curly-newline
	fill({ likesCount, targetLink, publicId, schedule }) {
		if (likesCount) {
			this.likesCount = likesCount;
		}
		
		if (targetLink) {
			this.targetLink = targetLink;
		}
		
		if (publicId) {
			this.publicId = publicId;
		}
		
		if (schedule) {
			this.schedule = LikesTaskDocument.getScheduleDatesFromString(schedule);
		}
		
		return this;
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
