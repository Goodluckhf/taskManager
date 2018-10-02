import mongoose from 'mongoose';
import jwt      from 'jsonwebtoken';

import BaseApi                                                                from './BaseApi';
import { ChatAlreadyExists, LoginFailed, NoFriendsInvite, UserAlreadyExists } from './errors';
import { linkByVkUserId }                                                     from '../../../lib/helper';

/**
 * @property {VkApi} vkApi
 */
class UserApi extends BaseApi {
	constructor(vkApi, ...args) {
		super(...args);
		this.vkApi = vkApi;
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
		const User = mongoose.model('User');
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
		
		const user = User.createInstance({
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
	 * @param {String} vkId
	 * @return {Promise<void>}
	 */
	async createChat({ user, vkId }) {
		if (user.chatId) {
			throw new ChatAlreadyExists(user.chatId);
		}
		
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
		return chatId;
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
}

export default UserApi;
