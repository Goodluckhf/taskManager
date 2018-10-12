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
		const totalPrice = this.billing.getTotalPrice(invoice);
		if (this.availableBalance - totalPrice <= 0) {
			throw new NotEnoughBalance(this.availableBalance, totalPrice, new Error('Пополните баланс'));
		}
	}
	
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {void}
	 */
	freezeMoney(invoice) {
		this.canPay(invoice);
		const totalPrice = this.billing.getTotalPrice(invoice);
		this.user.freezeBalance += totalPrice;
	}
	
	/**
	 * @description Размараживает баланс на сумму инвойса
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {void}
	 */
	rollBackInvoice(invoice) {
		const totalPrice = this.billing.getTotalPrice(invoice);
		this.user.freezeBalance -= totalPrice;
	}
	
	/**
	 * @description Переводит из замороженного реальный баланс
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {void}
	 */
	commitInvoice(invoice) {
		const totalPrice = this.billing.getTotalPrice(invoice);
		
		this.user.freezeBalance -= totalPrice;
		this.user.balance       -= totalPrice;
	}
	
	get availableBalance() {
		return this.user.balance - this.user.freezeBalance;
	}
}

export default BillingAccount;
