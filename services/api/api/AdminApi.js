import mongoose                      from '../../../lib/mongoose';
import BaseApi                       from './BaseApi';
import { NotFound, ValidationError } from './errors';

class AdminApi extends BaseApi {
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
		
		user.balance += quantity;
		await user.save();
	}
}

export default AdminApi;
