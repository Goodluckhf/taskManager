import mongoose       from '../../../lib/mongoose';
import PremiumAccount from './PremiumAccount';
import BillingAccount from './BillingAccount';

const userMapperToAccount = {
	PremiumUser: PremiumAccount,
	AccountUser: BillingAccount,
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
	 * @param {String} type
	 * @param {Number} quantity
	 * @return {InvoiceDocument}
	 */
	createInvoice(type, quantity) {
		const InvoiceModel = mongoose.model('Invoice');
		
		const tariffs = this.config.get('prices');
		if (!Object.keys(tariffs).includes(type)) {
			throw new Error('Invalid invoice type');
		}
		
		return InvoiceModel.createInstance({
			price: this.calculatePrice(type, quantity),
			type,
		});
	}
	
	/**
	 * Считает цену за кол-во
	 * @param {String} type
	 * @param {Number} quantity
	 * @return {Number}
	 */
	calculatePrice(type, quantity) {
		const cost = this.config.get(`prices.${type}`);
		return cost * quantity;
	}
	
	
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {Number}
	 */
	//eslint-disable-next-line class-methods-use-this
	getTotalPrice(invoice) {
		const invoices = Array.isArray(invoice) ? invoice : [invoice];
		return invoices.reduce((sum, _invoice) => (sum + _invoice.price), 0);
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
