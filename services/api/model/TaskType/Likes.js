import mongoose        from 'mongoose';
import { arrayToHash } from '../../../../lib/helper';

const repeatIntervals = ['daily'];
const repeatIntervalsHash = arrayToHash(repeatIntervals);

const likesSchema = new mongoose.Schema({
	publicId: {
		type    : mongoose.Schema.Types.ObjectId,
		required: true,
	},
	
	// Дата публикации поста
	postPublishAt: {
		type   : Date,
		require: true,
	},
	
	likesCount: {
		type    : Number,
		required: true,
	},
	
	repeatInterval: {
		type   : String,
		enum   : repeatIntervals,
		default: null,
	},
});

export class LikesTaskDocument {
	static get repeatInterval() {
		return repeatIntervalsHash;
	}
	
	static createInstance(opts) {
		return new this(opts);
	}
}

likesSchema.loadClass(LikesTaskDocument);

export default likesSchema;
