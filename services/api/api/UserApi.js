import mongoose from 'mongoose';
import jwt      from 'jsonwebtoken';

import BaseApi                            from './BaseApi';
import { LoginFailed, UserAlreadyExists } from './errors';

class UserApi extends BaseApi {
	createToken(user) {
		return jwt.sign({
			email: user.email,
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
				email   : { type: 'string' },
				password: { type: 'string' },
			},
			required: ['email', 'password'],
		}, data);
		
		const existUser = await User.count({ email: data.email });
		if (existUser > 0) {
			throw new UserAlreadyExists({ email: data.email });
		}
		
		const user = User.createInstance({
			email   : data.email,
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
	 * Обновляет токены и данные для задач
	 * @param {Object} data
	 * @param {String} data.chatId
	 * @param {UserDocument} user
	 * @return {Promise<void>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async updateTokens(user, { chatId }) {
		if (chatId) {
			//eslint-disable-next-line no-param-reassign
			user.chatId = chatId;
			await user.save();
		}
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
		
		const user = await mongoose.model('User').findOne({ email: data.email });
		
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
