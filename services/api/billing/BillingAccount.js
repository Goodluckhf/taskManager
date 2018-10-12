import BaseAccount          from './BaseAccount';
import { NotEnoughBalance } from '../api/errors/tasks';

/**
 * @property {Billing} billing
 * @property {AccountUserDocument} user
 */
class BillingAccount extends BaseAccount {
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {Boolean}
	 */
	canPay(invoice) {
		const invoices   = Array.isArray(invoice) ? invoice : [invoice];
		const totalPrice = invoices.reduce((sum, _invoice) => (sum + _invoice), 0);
		if (this.availableBalance - totalPrice <= 0) {
			throw new NotEnoughBalance(this.availableBalance, totalPrice, new Error('Пополните баланс'));
		}
	}
	
	get availableBalance() {
		return this.user.balance - this.user.freezeBalance;
	}
}

export default BillingAccount;
