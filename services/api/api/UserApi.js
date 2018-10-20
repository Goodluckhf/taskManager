import jwt    from 'jsonwebtoken';
import moment from 'moment';
import { stringify }     from 'querystring';

import mongoose           from '../../../lib/mongoose';
import BaseApi            from './BaseApi';
import {
	ChatAlreadyExists,
	LoginFailed,
	NoFriendsInvite,
	UserAlreadyExists, ValidationError,
	CheckPaymentFailure,
}                         from './errors';
import { linkByVkUserId } from '../../../lib/helper';
import BillingAccount     from '../billing/BillingAccount';

/**
 * @property {VkApi} vkApi
 * @property {Billing} billing
 * @property {Axios} axios
 */
class UserApi extends BaseApi {
	constructor(vkApi, billing, axios, ...args) {
		super(...args);
		this.vkApi   = vkApi;
		this.billing = billing;
		this.axios   = axios;
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
	 * @param {BaseAccount} account
	 * @return {Promise<Object>}
	 */
	async getUser(account) {
		const data = {
			chatId      : account.user.chatId,
			vkLink      : linkByVkUserId(account.user.vkId),
			systemVkLink: linkByVkUserId(this.config.get('vkApi.id')),
		};
		
		if (account instanceof BillingAccount) {
			data.balance = account.availableBalance;
		}
		
		return data;
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
		const amountNumber = parseInt(amount, 10);
		if (!amountNumber) {
			throw new ValidationError(['amount']);
		}
		
		const money        = this.billing.getMoneyByAmount(amount);
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
				newAmount: amountNumber,
				oldAmount: topUpInvoice.amount,
				money,
			});
			topUpInvoice.amount = amountNumber;
			topUpInvoice.money  = money;
		} else {
			topUpInvoice = this.billing.createTopUpInvoice(account.user, amountNumber);
		}
		
		await topUpInvoice.save();
		return topUpInvoice.toObject();
	}
	
	/**
	 *
	 * @param {BillingAccount} account
	 * @return {Promise<Number>}
	 */
	async checkPayment(account) {
		if (!(account instanceof BillingAccount)) {
			throw new ValidationError(['Account type']);
		}
		
		const TopUpInvoice = mongoose.model('TopUpInvoice');
		
		const invoice = await TopUpInvoice.findOne({
			user  : account.user,
			status: TopUpInvoice.status.active,
		});
		
		if (!invoice) {
			throw new ValidationError(['invoice']);
		}
		
		const token = this.config.get('yandex.token');
		
		const { data: { operations } } = await this.axios.post(
			'https://money.yandex.ru/api/operation-history',
			stringify({
				type   : 'deposition',
				details: true,
				records: 100,
			}),
			{
				headers: {
					'User-Agent'  : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0',
					Authorization : `Bearer ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);
		
		const payment = operations.find((operation) => {
			if (operation.amount < invoice.money) {
				return false;
			}
			
			if (operation.codepro) {
				return false;
			}
			
			if (operation.type !== 'incoming-transfer') {
				return false;
			}
			
			if (operation.status !== 'success') {
				return false;
			}
			
			return operation.message === invoice.note;
		});
		
		if (!payment) {
			throw new CheckPaymentFailure(invoice.money, invoice.note);
		}
		
		account.user.balance += invoice.amount;
		invoice.status = TopUpInvoice.status.paid;
		invoice.paidAt = moment.now();
		await Promise.all([
			invoice.save(),
			account.user.save(),
		]);
		
		return account.availableBalance;
	}
	
	/**
	 * @param {Number | String} amount
	 * @return {Promise<number>}
	 */
	convertMoney(amount) {
		return {
			money: this.billing.getMoneyByAmount(parseInt(amount, 10)),
			rate : parseFloat(this.config.get('rubbleRatio')),
		};
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
