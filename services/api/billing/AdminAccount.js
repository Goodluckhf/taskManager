import BaseAccount   from './BaseAccount';

/**
 * @property {AdminUserDocument} user
 */
class AdminAccount extends BaseAccount {
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {boolean}
	 */
	// eslint-disable-next-line no-unused-vars,class-methods-use-this
	canPay(invoice) {
		return true;
	}
}

export default AdminAccount;
