import jwt from 'jsonwebtoken';

import mongoose           from '../../../lib/mongoose';
import BaseApi            from './BaseApi';
import {
	ChatAlreadyExists,
	LoginFailed,
	NoFriendsInvite,
	UserAlreadyExists, ValidationError,
} from './errors';
import { linkByVkUserId } from '../../../lib/helper';
import BillingAccount     from '../billing/BillingAccount';

/**
 * @property {VkApi} vkApi
 * @property {Billing} billing
 */
class UserApi extends BaseApi {
	constructor(vkApi, billing, ...args) {
		super(...args);
		this.vkApi   = vkApi;
		this.billing = billing;
	}
	
	createToken(user) {
		return jwt.sign({
			email: user.email.toLowerCase(),
			id   : user.id,
		}, this.config.get('jwt.secret'));
	}
	
	/**
	 * @param {Object} data
	 * @param {String} data.email
	 * @param {String} data.password
	 * @param {Boolean} data.isActive
	 */
	async register(data) {
		const User        = mongoose.model('User');
		const AccountUser = mongoose.model('AccountUser');
		
		this.validate({
			properties: {
				email   : { type: 'string', format: 'email' },
				password: { type: 'string' },
			},
			required: ['email', 'password'],
		}, data);
		
		const existUser = await User.count({ email: data.email.toLowerCase() });
		if (existUser > 0) {
			throw new UserAlreadyExists({ email: data.email });
		}
		
		// По умолчанию создаются пользователи с балансом
		const user = AccountUser.createInstance({
			email   : data.email.toLowerCase(),
			password: data.password,
		});
		
		await user.save();
		const token = this.createToken(user);
		
		const displayUser = user.toObject();
		delete displayUser.passwordHash;
		delete displayUser.salt;
		return { user: displayUser, token };
	}
	
	/**
	 * @param {UserDocument} user
	 * @param {String} vkLink
	 * @return {Promise<Object>}
	 */
	async createChat({ user, vkLink }) {
		if (user.chatId) {
			throw new ChatAlreadyExists(user.chatId);
		}
		
		const screenNameOrId = vkLink.replace(/^(?:https?:\/\/)?vk.com\/(?:id)?/i, '');
		
		const { response: [{ id: vkId }] } = await this.vkApi.apiRequest('users.get', {
			user_ids: screenNameOrId,
		});
		
		const { response: [{ friend_status: status }] } = await this.vkApi.apiRequest('friends.areFriends', {
			user_ids : vkId,
			need_sign: 0,
		});
		
		// Пользователь не является другом или
		// отменил дружбу, тогда я остаюсь в подписчиках
		// И ему нужно просто добавить в друзья
		if (status === 0 || status === 1) {
			throw new NoFriendsInvite(linkByVkUserId(this.config.get('vkApi.id')));
		}
		
		if (status === 2) {
			await this.vkApi.apiRequest('friends.add', {
				user_id: vkId,
				follow : 0,
			});
		}
		
		const { response: chatId } = await this.vkApi.apiRequest('messages.createChat', {
			user_ids: vkId,
			title   : 'Алерты',
		});
		
		//eslint-disable-next-line no-param-reassign
		user.chatId = chatId;
		//eslint-disable-next-line no-param-reassign
		user.vkId   = vkId;
		await user.save();
		return { chatId, vkLink };
	}
	
	
	/**
	 * Возвращает инфу о пользователе
	 * @param {UserDocument} user
	 * @return {Promise<void>}
	 */
	async getUser(user) {
		return {
			chatId      : user.chatId,
			vkLink      : linkByVkUserId(user.vkId),
			systemVkLink: linkByVkUserId(this.config.get('vkApi.id')),
		};
	}
	
	/**
	 * @param {Object} data
	 * @param {String} data.email
	 * @param {String} data.password
	 */
	async login(data) {
		this.validate({
			properties: {
				email   : { type: 'string' },
				password: { type: 'string' },
			},
			required: ['email', 'password'],
		}, data);
		
		const user = await mongoose.model('User').findOne({ email: data.email.toLowerCase() });
		
		if (!user || !user.checkPassword(data.password)) {
			throw new LoginFailed({ email: data.email });
		}
		
		const displayUser = user.toObject();
		delete displayUser.passwordHash;
		delete displayUser.salt;
		const token = this.createToken(user);
		return { user: displayUser, token };
	}
	
	async createTopUpInvoice(account, amount) {
		if (!(account instanceof BillingAccount)) {
			throw new ValidationError(['Account type']);
		}
		
		const TopUpInvoice = mongoose.model('TopUpInvoice');
		
		let topUpInvoice = await TopUpInvoice.findOne({
			user  : account.user,
			status: TopUpInvoice.status.active,
		});
		
		if (topUpInvoice) {
			this.logger.info({
				mark     : 'billing',
				message  : 'у инвойса изменилась сумма',
				invoiceId: topUpInvoice.id,
				userId   : account.user.id,
				newAmount: amount,
				oldAmount: topUpInvoice.amount,
			});
			topUpInvoice.amount = amount;
		} else {
			topUpInvoice = this.billing.createTopUpInvoice(account.user, amount);
		}
		
		await topUpInvoice.save();
		return topUpInvoice.toObject();
	}
	
	/**
	 * @return {Promise.<UserDocument>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async list() {
		return mongoose
			.model('User')
			.find({})
			.select({
				passwordHas: 0,
				salt       : 0,
			})
			.lean()
			.exec();
	}
}

export default UserApi;
