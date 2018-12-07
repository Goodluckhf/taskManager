import mongoose from '../../../../lib/mongoose';

const checkBalanceTaskSchema = new mongoose.Schema({
	repeated: {
		type: Boolean,
		default: true,
	},
});

/**
 * @extends TaskDocument
 */
export class CheckBalanceTaskDocument {
	static createInstance(opts) {
		return mongoose.model('Task').createInstance(this, opts);
	}
}

checkBalanceTaskSchema.loadClass(CheckBalanceTaskDocument);

export default checkBalanceTaskSchema;
