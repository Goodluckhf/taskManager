import moment                        from 'moment';
import mongoose                      from '../../../lib/mongoose';
import BaseApi                       from './BaseApi';
import { NotFound, ValidationError } from './errors';

/**
 * @property {Billing} billing
 */
class AdminApi extends BaseApi {
	constructor(billing, ...args) {
		super(...args);
		this.billing = billing;
	}
	
	/**
	 * Пополнить баланс пользователю
	 * @param {ObjectId} userId
	 * @param {Number} quantity
	 * @return {Promise<void>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async increaseBalance(userId, quantity) {
		const user = await mongoose.model('AccountUser').findById(userId);
		if (!user) {
			throw new NotFound({
				what : 'User',
				query: { userId },
			});
		}
		
		if (!quantity) {
			throw new ValidationError(['quantity']);
		}
		
		const invoice = this.billing.createTopUpInvoice(user, quantity);
		user.balance += quantity;
		invoice.status = mongoose.model('Invoice').status.paid;
		invoice.paidAt = moment.now();
		await Promise.all([
			user.save(),
			invoice.save(),
		]);
	}
}

export default AdminApi;
