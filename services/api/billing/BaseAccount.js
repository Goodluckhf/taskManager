/**
 * @property {UserDocument} user
 * @property {Config} config
 * @property {Billing} billing
 */
class BaseAccount {
	/**
	 * @param {UserDocument} userDocument
	 * @param {Config} config
	 * @param {Billing} billing
	 * @param {Logger} logger
	 */
	constructor(userDocument, config, billing, logger) {
		this.user    = userDocument;
		this.config  = config;
		this.billing = billing;
		this.logger  = logger;
	}
	
	
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @abstract
	 */
	//eslint-disable-next-line no-unused-vars,class-methods-use-this
	canPay(invoice) {}
}

export default BaseAccount;
