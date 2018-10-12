import mongoose from 'mongoose';

const accountUserSchema = new mongoose.Schema({
	balance: {
		type: Number,
	},
	
	// Баланс в работе
	freezeBalance: {
		type: Number,
	},
});

/**
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
