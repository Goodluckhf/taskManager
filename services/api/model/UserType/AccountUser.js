import mongoose from '../../../../lib/mongoose';

const accountUserSchema = new mongoose.Schema({
	balance: {
		type   : Number,
		default: 0,
	},
	
	// Баланс в работе
	freezeBalance: {
		type   : Number,
		default: 0,
	},
});

/**
 * @extends UserDocument
 * @property {Number} balance
 * @property {Number} freezeBalance
 */
export class AccountUserDocument {
	/**
	 * @param {Object} opts
	 * @param {Number} opts.balance
	 * @return {AccountUserDocument}
	 */
	static createInstance(opts) {
		const baseUser   = mongoose.model('User').createInstance(this, opts);
		baseUser.balance = opts.balance || 0;
		return baseUser;
	}
}

accountUserSchema.loadClass(AccountUserDocument);

export default accountUserSchema;
