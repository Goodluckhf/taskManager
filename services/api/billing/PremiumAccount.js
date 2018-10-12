import BaseAccount   from './BaseAccount';
import BaseTaskError from '../api/errors/tasks/BaseTaskError';

/**
 * @property {PremiumUserDocument} user
 */
class PremiumAccount extends BaseAccount {
	/**
	 * @param {InvoiceDocument | Array.<InvoiceDocument>} invoice
	 * @return {void}
	 */
	// eslint-disable-next-line no-unused-vars
	canPay(invoice) {
		const hasAllCredentials = ['likest', 'likePro', 'z1y1x1'].every(service => (
			this.user.services[service]
		));
		
		if (!hasAllCredentials) {
			throw new BaseTaskError(new Error('Не все данные для сервисов заполнены'));
		}
	}
}

export default PremiumAccount;
