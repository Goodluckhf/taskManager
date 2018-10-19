import bluebird from 'bluebird';
import mongoose from '../../../lib/mongoose';
import BaseAccount          from './BaseAccount';
import { NotEnoughBalance } from '../api/errors/tasks';

/**
 * @property {Billing} billing
 * @property {AccountUserDocument} user
 */
class BillingAccount extends BaseAccount {
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {void}
	 */
	canPay(invoice) {
		const totalPrice = this.billing.getTotalPrice(invoice);
		if (this.availableBalance - totalPrice < 0) {
			throw new NotEnoughBalance(this.availableBalance, totalPrice, new Error('Пополните баланс'));
		}
	}
	
	/**
	 * @param {TaskDocument | Array.<TaskDocument>} task
	 * @return {void}
	 */
	async freezeMoney(task) {
		const tasks    = Array.isArray(task) ? task : [task];
		const invoices = tasks.map(t => this.billing.createTaskInvoice(t, this.user));
		this.canPay(invoices);
		const totalPrice = this.billing.getTotalPrice(invoices);
		this.logger.info({
			mark   : 'billing',
			message: 'freezeMoney',
			userId : this.user.id,
			tasksId: tasks.map(t => t.id),
			amount : totalPrice,
		});
		this.user.freezeBalance += totalPrice;
		await bluebird.map(invoices, invoice => invoice.save());
		await this.user.save();
	}
	
	/**
	 * @description Размараживает баланс на сумму инвойса
	 * @param {TaskDocument | Array.<TaskDocument>} task
	 * @return {void}
	 */
	async rollBack(task) {
		const TaskInvoice = mongoose.model('TaskInvoice');
		const tasks       = Array.isArray(task) ? task : [task];
		const taskIds     = tasks.map(t => t.id);
		const invoices    = await TaskInvoice.find({ task: { $in: taskIds } });
		const totalPrice = this.billing.getTotalPrice(invoices);
		
		this.logger.info({
			mark   : 'billing',
			message: 'rollBack',
			userId : this.user.id,
			tasksId: tasks.map(t => t.id),
			amount : totalPrice,
		});
		
		this.user.freezeBalance -= totalPrice;
		await Promise.all([
			TaskInvoice.setInactive(invoices),
			this.user.save(),
		]);
	}
	
	/**
	 * @description Переводит из замороженного в реальный баланс
	 * @param {TaskDocument | Array.<TaskDocument>} task
	 * @return {void}
	 */
	async commit(task) {
		const TaskInvoice = mongoose.model('TaskInvoice');
		const tasks      = Array.isArray(task) ? task : [task];
		const taskIds    = tasks.map(t => t.id);
		const invoices   = await TaskInvoice.find({ task: { $in: taskIds } });
		const totalPrice = this.billing.getTotalPrice(invoices);
		
		this.logger.info({
			mark   : 'billing',
			message: 'commit',
			userId : this.user.id,
			tasksId: tasks.map(t => t.id),
			amount : totalPrice,
		});
		
		this.user.freezeBalance -= totalPrice;
		this.user.balance       -= totalPrice;
		await Promise.all([
			TaskInvoice.setPaid(invoices),
			this.user.save(),
		]);
	}
	
	/**
	 * @return {Number}
	 */
	get availableBalance() {
		return this.user.balance - this.user.freezeBalance;
	}
}

export default BillingAccount;
