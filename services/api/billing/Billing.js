import mongoose       from '../../../lib/mongoose';
import PremiumAccount from './PremiumAccount';
import BillingAccount from './BillingAccount';
import AdminAccount   from './AdminAccount';

const userMapperToAccount = {
	PremiumUser: PremiumAccount,
	AccountUser: BillingAccount,
	AdminUser  : AdminAccount,
};

/**
 * @property {Config} config
 */
class Billing {
	/**
	 * @param {Config} config
	 * @param {Logger} logger
	 */
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;
	}
	
	/**
	 * @param {Number} amount
	 * @return {number}
	 */
	getMoneyByAmount(amount) {
		return Math.round(amount * this.config.get('rubbleRatio') * 100) / 100;
	}
	
	/**
	 * @param {UserDocument} user
	 * @param {Number} amount
	 * @return {TopUpInvoiceDocument}
	 */
	createTopUpInvoice(user, amount) {
		const TopUpInvoiceModel = mongoose.model('TopUpInvoice');
		const money             = this.getMoneyByAmount(amount);
		
		const invoice = TopUpInvoiceModel.createInstance({
			user,
			amount,
			money,
		});
		
		this.logger.info({
			mark   : 'billing',
			message: 'Создался инвойс на пополнения баланса',
			invoice: invoice.id,
			userId : user.id,
			money,
		});
		
		return invoice;
	}
	
	/**
	 * @param {TaskDocument} task
	 * @param {UserDocument} user
	 * @return {InvoiceDocument}
	 */
	createTaskInvoice(task, user) {
		const TaskInvoiceModel = mongoose.model('TaskInvoice');
		const invoice = TaskInvoiceModel.createInstance({
			amount: this.calculatePrice(task),
			task,
			user,
		});
		
		this.logger.info({
			mark     : 'billing',
			message  : 'Создался инвойс на оплату задачи',
			invoiceId: invoice.id,
			userId   : user.id,
		});
		
		return invoice;
	}
	
	/**
	 * Считает цену за кол-во
	 * @param {TaskDocument} task
	 * @return {Number}
	 */
	calculatePrice(task) {
		const prices = this.config.get('prices');
		
		if (task.likesCount) {
			return task.likesCount * prices.like;
		}
		
		if (task.commentsCount) {
			return task.commentsCount * prices.comment;
		}
		
		if (task.repostsCount) {
			return task.repostsCount * prices.repost;
		}
		
		throw new Error('there is not price for this task type');
	}
	
	
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {Number}
	 */
	//eslint-disable-next-line class-methods-use-this
	getTotalPrice(invoice) {
		const invoices = Array.isArray(invoice) ? invoice : [invoice];
		return invoices.reduce((sum, _invoice) => (sum + _invoice.amount), 0);
	}
	
	/**
	 * @param {UserDocument} user
	 * @return {BaseAccount}
	 */
	createAccount(user) {
		return new userMapperToAccount[user.__t](
			user,
			this.config,
			this,
			this.logger,
		);
	}
}


// Из схемы инвойса
// Что бы был автокоплит
Billing.types = {
	like   : 'like',
	repost : 'repost',
	comment: 'comment',
	topUp  : 'topUp',
};

export default Billing;
