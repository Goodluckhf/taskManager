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
	 */
	constructor(userDocument, config, billing) {
		this.user    = userDocument;
		this.config  = config;
		this.billing = billing;
	}
	
	
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {Boolean}
	 * @abstract
	 */
	//eslint-disable-next-line no-unused-vars,class-methods-use-this
	canPay(invoice) {}
}

export default BaseAccount;
